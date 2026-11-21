// Expands the `partition:glob` field of the Portolan partition extension into
// the list of files it names. Portolan v0.3 writes that field as an absolute
// bucket URL, such as
// `s3://ftw/harmonized-field-data/at/year=*/*.parquet`, and leaves the
// expansion to the client. A browser cannot speak the storage SDKs, so this
// module calls each provider's anonymous HTTP listing API over `fetch` and
// keeps the keys the pattern matches.
//
// Import-light on purpose: the parquet table preview imports it from a code
// path that must not pull hyparquet or any other heavy dependency into the
// bundle. Only constants from parquetShared.js come in.

import { WILDCARD } from './parquetShared.js';

// Cap on the files one glob may expand to. A listing walks every page of the
// prefix, so an unbounded pattern over a large bucket would spend many
// requests and then hand the caller a list no reader can use. The cap is the
// size of one ListObjectsV2 page, which covers every partitioned collection
// published so far.
export const MAX_PARTITION_KEYS = 1000;

// Cap on list requests for one expansion. The key cap alone does not bound the
// walk: a prefix that holds a million objects none of which the pattern
// matches would page forever.
const MAX_LIST_REQUESTS = 20;

// Shares the rejection code of utils/parquetGlob.js, whose GLOB_UNRESOLVED has
// the same meaning: the pattern names files this client cannot reach. The
// caller turns the code into its own message, because this module does no
// localization.
const GLOB_UNRESOLVED = 'globUnresolved';

function unresolved(message) {
  const error = new Error(message);
  error.code = GLOB_UNRESOLVED;
  return error;
}

/**
 * A matcher over object keys for one glob pattern.
 *
 * A wildcard matches within one path segment, as it does for DuckDB and for
 * the `partition:glob` field: a pattern over `year=*` must not reach into
 * `year=2021/deeper`. Every other character is matched literally. Both
 * spellings of the wildcard are accepted, because a percent-encoded href
 * reaches a caller as `%2A` (see parquetShared.WILDCARD).
 *
 * The semantics match the private globToRegExp of utils/parquetGlob.js, which
 * resolves an asset href against a collection's items rather than a bucket.
 */
export function globToRegExp(pattern) {
  const body = pattern
    .split(WILDCARD)
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]*');
  return new RegExp(`^${body}$`);
}

/**
 * The partition metadata of a STAC object, or null when it declares no glob.
 *
 * Read through `getMetadata`, so an item inherits the fields its collection
 * declares once, which is how portolan-cli writes them.
 */
export function readPartitionMetadata(stacObject) {
  const read = field => stacObject?.getMetadata?.(field);
  const glob = read('partition:glob');
  if (typeof glob !== 'string' || glob === '') {
    return null;
  }
  return {
    glob,
    scheme: read('partition:scheme') ?? null,
    keys: read('partition:keys') ?? null,
    fileCount: read('partition:file_count') ?? null,
  };
}

// Percent-encodes a key or a prefix for use in a URL path or query value. Each
// segment is encoded on its own so the separators stay separators: a key with
// a space becomes `two%20words.parquet`, and the `/` between segments is kept.
function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function trimSlash(url) {
  return url.replace(/\/+$/, '');
}

// `s3://bucket/some/prefix/*.parquet` -> scheme, bucket and the key pattern.
function parseGlob(glob) {
  const match = /^([a-z0-9][a-z0-9+.-]*):\/\/(.+)$/i.exec(glob || '');
  if (!match) {
    throw unresolved(`The partition glob ${glob} is not an absolute bucket URL`);
  }
  const [, scheme, rest] = match;
  const slash = rest.indexOf('/');
  if (slash < 1 || slash === rest.length - 1) {
    throw unresolved(`The partition glob ${glob} names no path inside its bucket`);
  }
  return {
    scheme: scheme.toLowerCase(),
    bucket: rest.slice(0, slash),
    pattern: rest.slice(slash + 1),
  };
}

// The longest prefix of the pattern that holds no wildcard, cut back to a
// segment boundary. A listing is a prefix query, so everything from the first
// wildcard on is matched client-side.
function prefixOf(pattern) {
  const literal = pattern.split(WILDCARD)[0];
  return literal.slice(0, literal.lastIndexOf('/') + 1);
}

function schemeValues(storageSchemes) {
  return storageSchemes && typeof storageSchemes === 'object'
    ? Object.values(storageSchemes).filter(scheme => scheme && typeof scheme === 'object')
    : [];
}

// A `storage:schemes` entry describes the bucket under either name, because
// the Azure vocabulary calls it a container.
function namesBucket(scheme, bucket) {
  return scheme.bucket === bucket || scheme.container === bucket;
}

function findScheme(storageSchemes, bucket, predicate) {
  return schemeValues(storageSchemes)
    .find(scheme => namesBucket(scheme, bucket) && predicate(scheme)) || null;
}

async function fetchBody(url, { signal, fetchFn }, asJson) {
  const response = await fetchFn(url, signal ? { signal } : undefined);
  if (!response?.ok) {
    throw unresolved(`Listing ${url} failed with status ${response?.status}`);
  }
  return asJson ? response.json() : response.text();
}

function xmlTexts(document, tagName) {
  return Array.from(document.getElementsByTagName(tagName)).map(node => node.textContent || '');
}

function parseXml(text, url) {
  const document = new DOMParser().parseFromString(text, 'application/xml');
  if (document.getElementsByTagName('parsererror').length > 0) {
    throw unresolved(`Listing ${url} did not return XML`);
  }
  return document;
}

// One page of a provider's listing: the keys it holds, and the token that asks
// for the page after it.
function parseS3Page(text, url) {
  const document = parseXml(text, url);
  const truncated = xmlTexts(document, 'IsTruncated')[0] === 'true';
  const token = xmlTexts(document, 'NextContinuationToken')[0] || '';
  return { keys: xmlTexts(document, 'Key'), next: truncated && token ? token : '' };
}

function parseAzurePage(text, url) {
  const document = parseXml(text, url);
  return {
    keys: xmlTexts(document, 'Name'),
    next: xmlTexts(document, 'NextMarker')[0] || '',
  };
}

function parseGooglePage(body) {
  const items = Array.isArray(body?.items) ? body.items : [];
  return {
    keys: items.map(item => item?.name).filter(name => typeof name === 'string'),
    next: body?.nextPageToken || '',
  };
}

// The per-provider listing plan: where to list, how to read a page, and how to
// turn a key into a file URL the browser can read.
function listingPlan(glob, storageSchemes) {
  const { scheme, bucket, pattern } = parseGlob(glob);
  const prefix = encodePath(prefixOf(pattern));

  if (scheme === 's3') {
    const custom = findScheme(storageSchemes, bucket, s => s.type === 'custom-s3' && s.platform);
    if (custom) {
      const base = `${trimSlash(custom.platform)}/${bucket}`;
      return {
        pattern,
        listUrl: token => `${base}?list-type=2&prefix=${prefix}${
          token ? `&continuation-token=${encodeURIComponent(token)}` : ''
        }`,
        parsePage: parseS3Page,
        fileUrl: key => `${base}/${encodePath(key)}`,
      };
    }
    const region = findScheme(storageSchemes, bucket, s => typeof s.region === 'string')?.region
      || 'us-east-1';
    const base = `https://${bucket}.s3.${region}.amazonaws.com`;
    return {
      pattern,
      listUrl: token => `${base}/?list-type=2&prefix=${prefix}${
        token ? `&continuation-token=${encodeURIComponent(token)}` : ''
      }`,
      parsePage: parseS3Page,
      fileUrl: key => `${base}/${encodePath(key)}`,
    };
  }

  if (scheme === 'gs') {
    return {
      pattern,
      json: true,
      listUrl: token => `https://storage.googleapis.com/storage/v1/b/${bucket}/o?prefix=${prefix}${
        token ? `&pageToken=${encodeURIComponent(token)}` : ''
      }`,
      parsePage: parseGooglePage,
      fileUrl: key => `https://storage.googleapis.com/${bucket}/${encodePath(key)}`,
    };
  }

  if (scheme === 'az') {
    // Azure has no provider-wide host: the account is part of the endpoint, so
    // only the collection's own storage scheme can name it.
    const azure = findScheme(storageSchemes, bucket, s => typeof s.platform === 'string'
      && s.platform !== '');
    if (!azure) {
      throw unresolved(`No storage scheme gives the account endpoint of the container ${bucket}`);
    }
    const base = `${trimSlash(azure.platform)}/${bucket}`;
    return {
      pattern,
      listUrl: token => `${base}?restype=container&comp=list&prefix=${prefix}${
        token ? `&marker=${encodeURIComponent(token)}` : ''
      }`,
      parsePage: parseAzurePage,
      fileUrl: key => `${base}/${encodePath(key)}`,
    };
  }

  throw unresolved(`The partition glob scheme ${scheme}:// is not supported`);
}

/**
 * Expand a `partition:glob` into the file URLs it names.
 *
 * Lists the glob's bucket over the provider's anonymous HTTP API and returns
 * the https URL of every object whose key the pattern matches, sorted
 * lexicographically by key. `storageSchemes` is the object's
 * `storage:schemes`, which names the endpoint of a custom S3 platform such as
 * Source Cooperative and the account endpoint of an Azure container.
 *
 * Rejects with `error.code === 'globUnresolved'` when the glob is not an
 * absolute bucket URL, when its scheme has no listing path, when an Azure
 * container has no storage scheme, when a listing request fails, and when the
 * expansion passes MAX_PARTITION_KEYS files.
 *
 * `fetchFn` is the listing reader, injected for tests. `signal` (an
 * AbortSignal) is forwarded to it.
 */
export async function expandPartitionGlob(glob, storageSchemes, { signal, fetchFn = fetch } = {}) {
  const plan = listingPlan(glob, storageSchemes);
  const matcher = globToRegExp(plan.pattern);
  const matched = [];
  let token = '';

  for (let request = 0; request < MAX_LIST_REQUESTS; request += 1) {
    const url = plan.listUrl(token);
    // A page names the page after it, so the walk is sequential by construction.
    // eslint-disable-next-line no-await-in-loop
    const body = await fetchBody(url, { signal, fetchFn }, plan.json);
    const page = plan.parsePage(body, url);
    matched.push(...page.keys.filter(key => matcher.test(key)));
    if (matched.length > MAX_PARTITION_KEYS) {
      throw unresolved(`The partition glob ${glob} names more than ${MAX_PARTITION_KEYS} files`);
    }
    if (!page.next) {
      return matched.sort().map(plan.fileUrl);
    }
    token = page.next;
  }

  throw unresolved(`Listing the partition glob ${glob} took more than ${MAX_LIST_REQUESTS} requests`);
}
