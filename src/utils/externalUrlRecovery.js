/**
 * Recovery logic for an external URL that the browser cannot load.
 *
 * A user pastes a URL into the browser. The URL can point at a website host
 * instead of a data host, or at a directory instead of a STAC document. The
 * functions here compute better URLs to try. They run no request.
 */

// Website hosts, mapped to the host that serves the data.
const DATA_HOST_FOR = {
  'source.coop': 'data.source.coop',
  'www.source.coop': 'data.source.coop'
};

// The file names of a STAC entry document.
const ENTRY_DOCUMENTS = ['catalog.json', 'collection.json'];

function parseUrl(url) {
  if (typeof url !== 'string' || url.length === 0) {
    return null;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed : null;
  } catch (error) {
    return null;
  }
}

/**
 * Computes the data host for a website URL.
 *
 * @param {string} url An absolute URL.
 * @returns {?{host: string, dataHost: string, url: string}} The rewrite, or null
 * when the host serves data already.
 */
export function dataHostRewrite(url) {
  const parsed = parseUrl(url);
  if (!parsed) {
    return null;
  }
  const host = parsed.hostname;
  const dataHost = DATA_HOST_FOR[host];
  if (!dataHost) {
    return null;
  }
  parsed.hostname = dataHost;
  return { host, dataHost, url: parsed.toString() };
}

function candidateUrl(parsed, segments, name) {
  const candidate = new URL(parsed.toString());
  candidate.search = '';
  candidate.hash = '';
  candidate.pathname = '/' + segments.concat(name).join('/');
  return candidate.toString();
}

/**
 * Lists the entry documents to probe for a URL that did not load.
 *
 * The list covers the URL itself and its parent. A URL that ends in .json
 * names a document already, so it gets no candidate. The root has no parent,
 * and the duplicate parent candidates drop out.
 *
 * @param {string} url An absolute URL.
 * @returns {string[]} The candidate URLs, in probe order.
 */
export function entryDocumentCandidates(url) {
  const parsed = parseUrl(url);
  if (!parsed || parsed.pathname.toLowerCase().endsWith('.json')) {
    return [];
  }
  const segments = parsed.pathname.split('/').filter(Boolean);
  const parent = segments.slice(0, Math.max(segments.length - 1, 0));
  const candidates = [];
  for (const base of [segments, parent]) {
    for (const name of ENTRY_DOCUMENTS) {
      candidates.push(candidateUrl(parsed, base, name));
    }
  }
  return Array.from(new Set(candidates));
}

/**
 * Selects the candidates that hold an entry document.
 *
 * A candidate is a hit when the request succeeds and the body parses as JSON.
 *
 * @param {Array<?{url: string, ok: boolean, json: boolean}>} results The probe results.
 * @returns {string[]} The URLs of the hits, in result order.
 */
export function entryDocumentHits(results) {
  if (!Array.isArray(results)) {
    return [];
  }
  const hits = results
    .filter(result => result && result.ok === true && result.json === true && typeof result.url === 'string')
    .map(result => result.url);
  return Array.from(new Set(hits));
}
