import { describe, it, expect } from 'vitest';
import {
  MAX_PARTITION_KEYS,
  expandPartitionGlob,
  globToRegExp,
  readPartitionMetadata,
} from '../../src/utils/partitionList.js';

// A stac-js object stands in for a collection: the module reads metadata
// through getMetadata, which stac-js resolves up to the collection itself.
function stacObject(metadata) {
  return {
    getMetadata(field) {
      return metadata[field];
    },
  };
}

// The live Source Cooperative scheme of the FTW harmonized-field-data
// collection, which the custom-s3 cases list against.
const SOURCE_COOP = {
  'source-coop': {
    type: 'custom-s3',
    platform: 'https://data.source.coop',
    region: 'us-west-2',
    bucket: 'ftw',
  },
};

function s3ListXml(keys, nextToken) {
  const contents = keys.map(key => `<Contents><Key>${key}</Key></Contents>`).join('');
  const token = nextToken ? `<NextContinuationToken>${nextToken}</NextContinuationToken>` : '';
  const truncated = `<IsTruncated>${nextToken ? 'true' : 'false'}</IsTruncated>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${contents}${truncated}${token}</ListBucketResult>`;
}

function azureListXml(keys, nextMarker) {
  const blobs = keys.map(key => `<Blob><Name>${key}</Name></Blob>`).join('');
  return `<?xml version="1.0" encoding="utf-8"?>
<EnumerationResults><Blobs>${blobs}</Blobs><NextMarker>${nextMarker || ''}</NextMarker></EnumerationResults>`;
}

// Records every requested URL and answers from a queue of bodies, so a test
// asserts both the request shapes and the expansion. No network is reached.
function stubFetch(bodies) {
  const urls = [];
  const queue = [...bodies];
  const fetchFn = (url) => {
    urls.push(url);
    const body = queue.shift();
    if (body === undefined) {
      return Promise.reject(new Error(`unexpected request ${url}`));
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(body),
      json: () => Promise.resolve(body),
    });
  };
  fetchFn.urls = urls;
  return fetchFn;
}

describe('readPartitionMetadata', () => {
  it('reads the four partition fields', () => {
    const object = stacObject({
      'partition:glob': 's3://ftw/harmonized-field-data/at/year=*/*.parquet',
      'partition:scheme': 'hive',
      'partition:keys': ['year'],
      'partition:file_count': 12,
    });
    expect(readPartitionMetadata(object)).toEqual({
      glob: 's3://ftw/harmonized-field-data/at/year=*/*.parquet',
      scheme: 'hive',
      keys: ['year'],
      fileCount: 12,
    });
  });

  it('is null without a glob', () => {
    expect(readPartitionMetadata(stacObject({ 'partition:scheme': 'hive' }))).toBeNull();
    expect(readPartitionMetadata({})).toBeNull();
    expect(readPartitionMetadata(null)).toBeNull();
  });

  it('leaves the optional fields null', () => {
    const object = stacObject({ 'partition:glob': 'gs://b/p/*.parquet' });
    expect(readPartitionMetadata(object)).toEqual({
      glob: 'gs://b/p/*.parquet',
      scheme: null,
      keys: null,
      fileCount: null,
    });
  });
});

describe('globToRegExp', () => {
  it('keeps a wildcard inside one segment', () => {
    const matcher = globToRegExp('a/year=*/*.parquet');
    expect(matcher.test('a/year=2021/at-2021.parquet')).toBe(true);
    expect(matcher.test('a/year=2021/deeper/x.parquet')).toBe(false);
    expect(matcher.test('a/year=2021/x.csv')).toBe(false);
  });

  it('matches the percent-encoded wildcard too', () => {
    expect(globToRegExp('a/%2A.parquet').test('a/b.parquet')).toBe(true);
  });

  it('treats regex characters as literals', () => {
    const matcher = globToRegExp('a+b/*.parquet');
    expect(matcher.test('a+b/x.parquet')).toBe(true);
    expect(matcher.test('aab/x.parquet')).toBe(false);
  });
});

describe('expandPartitionGlob custom-s3', () => {
  it('lists path-style and keeps only segment-wise matches', async () => {
    const fetchFn = stubFetch([
      s3ListXml([
        'harmonized-field-data/at/year=2021/at-2021.parquet',
        'harmonized-field-data/at/year=2022/at-2022.parquet',
        'harmonized-field-data/at/year=2021/deeper/x.parquet',
        'harmonized-field-data/at/year=2021/notes.txt',
      ]),
    ]);
    const urls = await expandPartitionGlob(
      's3://ftw/harmonized-field-data/at/year=*/*.parquet',
      SOURCE_COOP,
      { fetchFn },
    );
    expect(fetchFn.urls).toEqual([
      'https://data.source.coop/ftw?list-type=2&prefix=harmonized-field-data/at/',
    ]);
    expect(urls).toEqual([
      'https://data.source.coop/ftw/harmonized-field-data/at/year%3D2021/at-2021.parquet',
      'https://data.source.coop/ftw/harmonized-field-data/at/year%3D2022/at-2022.parquet',
    ]);
  });

  it('sorts the keys lexicographically', async () => {
    const fetchFn = stubFetch([
      s3ListXml(['p/c.parquet', 'p/a.parquet', 'p/b.parquet']),
    ]);
    const urls = await expandPartitionGlob('s3://ftw/p/*.parquet', SOURCE_COOP, { fetchFn });
    expect(urls).toEqual([
      'https://data.source.coop/ftw/p/a.parquet',
      'https://data.source.coop/ftw/p/b.parquet',
      'https://data.source.coop/ftw/p/c.parquet',
    ]);
  });

  it('follows the continuation token over two pages', async () => {
    const fetchFn = stubFetch([
      s3ListXml(['p/a.parquet'], 'tok-1'),
      s3ListXml(['p/b.parquet']),
    ]);
    const urls = await expandPartitionGlob('s3://ftw/p/*.parquet', SOURCE_COOP, { fetchFn });
    expect(fetchFn.urls).toEqual([
      'https://data.source.coop/ftw?list-type=2&prefix=p/',
      'https://data.source.coop/ftw?list-type=2&prefix=p/&continuation-token=tok-1',
    ]);
    expect(urls).toEqual([
      'https://data.source.coop/ftw/p/a.parquet',
      'https://data.source.coop/ftw/p/b.parquet',
    ]);
  });

  it('rejects when the pages exceed the key cap', async () => {
    const page = count => Array.from({ length: count }, (unused, index) => `p/f${index}.parquet`);
    const fetchFn = stubFetch([
      s3ListXml(page(400), 'tok-1'),
      s3ListXml(page(400), 'tok-2'),
      s3ListXml(page(400), 'tok-3'),
    ]);
    await expect(
      expandPartitionGlob('s3://ftw/p/*.parquet', SOURCE_COOP, { fetchFn }),
    ).rejects.toMatchObject({ code: 'globUnresolved' });
    expect(fetchFn.urls).toHaveLength(3);
  });

  it('percent-encodes a key with a space', async () => {
    const fetchFn = stubFetch([s3ListXml(['p/two words.parquet'])]);
    const urls = await expandPartitionGlob('s3://ftw/p/*.parquet', SOURCE_COOP, { fetchFn });
    expect(urls).toEqual(['https://data.source.coop/ftw/p/two%20words.parquet']);
  });

  it('ignores a trailing slash on the platform', async () => {
    const fetchFn = stubFetch([s3ListXml(['p/a.parquet'])]);
    const schemes = { s: { type: 'custom-s3', platform: 'https://data.source.coop/', bucket: 'ftw' } };
    const urls = await expandPartitionGlob('s3://ftw/p/*.parquet', schemes, { fetchFn });
    expect(fetchFn.urls[0]).toBe('https://data.source.coop/ftw?list-type=2&prefix=p/');
    expect(urls).toEqual(['https://data.source.coop/ftw/p/a.parquet']);
  });

  it('rejects a failed list request', async () => {
    const fetchFn = () => Promise.resolve({
      ok: false,
      status: 403,
      text: () => Promise.resolve(''),
    });
    await expect(
      expandPartitionGlob('s3://ftw/p/*.parquet', SOURCE_COOP, { fetchFn }),
    ).rejects.toMatchObject({ code: 'globUnresolved' });
  });

  it('forwards the abort signal', async () => {
    const seen = [];
    const signal = new AbortController().signal;
    const fetchFn = (url, options) => {
      seen.push(options?.signal);
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(s3ListXml(['p/a.parquet'])),
      });
    };
    await expandPartitionGlob('s3://ftw/p/*.parquet', SOURCE_COOP, { fetchFn, signal });
    expect(seen).toEqual([signal]);
  });
});

describe('expandPartitionGlob plain s3', () => {
  it('uses the AWS virtual host when no scheme names the bucket', async () => {
    const fetchFn = stubFetch([s3ListXml(['p/a.parquet'])]);
    const schemes = {
      other: { type: 'custom-s3', platform: 'https://data.source.coop', bucket: 'other' },
    };
    const urls = await expandPartitionGlob('s3://ftw/p/*.parquet', schemes, { fetchFn });
    expect(fetchFn.urls).toEqual([
      'https://ftw.s3.us-east-1.amazonaws.com/?list-type=2&prefix=p/',
    ]);
    expect(urls).toEqual(['https://ftw.s3.us-east-1.amazonaws.com/p/a.parquet']);
  });

  it('takes the region from a matching aws scheme', async () => {
    const fetchFn = stubFetch([s3ListXml(['p/a.parquet'])]);
    const schemes = { aws: { type: 'aws-s3', region: 'eu-central-1', bucket: 'ftw' } };
    const urls = await expandPartitionGlob('s3://ftw/p/*.parquet', schemes, { fetchFn });
    expect(fetchFn.urls).toEqual([
      'https://ftw.s3.eu-central-1.amazonaws.com/?list-type=2&prefix=p/',
    ]);
    expect(urls).toEqual(['https://ftw.s3.eu-central-1.amazonaws.com/p/a.parquet']);
  });

  it('lists with no storage schemes at all', async () => {
    const fetchFn = stubFetch([s3ListXml(['p/a.parquet'])]);
    const urls = await expandPartitionGlob('s3://ftw/p/*.parquet', null, { fetchFn });
    expect(urls).toEqual(['https://ftw.s3.us-east-1.amazonaws.com/p/a.parquet']);
  });
});

describe('expandPartitionGlob gs', () => {
  it('reads the google json listing', async () => {
    const fetchFn = stubFetch([
      { items: [{ name: 'p/a.parquet' }, { name: 'p/skip.txt' }], nextPageToken: 'tok-1' },
      { items: [{ name: 'p/b.parquet' }] },
    ]);
    const urls = await expandPartitionGlob('gs://bucket/p/*.parquet', null, { fetchFn });
    expect(fetchFn.urls).toEqual([
      'https://storage.googleapis.com/storage/v1/b/bucket/o?prefix=p/',
      'https://storage.googleapis.com/storage/v1/b/bucket/o?prefix=p/&pageToken=tok-1',
    ]);
    expect(urls).toEqual([
      'https://storage.googleapis.com/bucket/p/a.parquet',
      'https://storage.googleapis.com/bucket/p/b.parquet',
    ]);
  });
});

describe('expandPartitionGlob az', () => {
  it('lists the container through the scheme platform', async () => {
    const fetchFn = stubFetch([
      azureListXml(['p/a.parquet'], 'mark-1'),
      azureListXml(['p/b.parquet'], ''),
    ]);
    const schemes = {
      azure: { type: 'custom-azure', platform: 'https://acct.blob.core.windows.net', bucket: 'data' },
    };
    const urls = await expandPartitionGlob('az://data/p/*.parquet', schemes, { fetchFn });
    expect(fetchFn.urls).toEqual([
      'https://acct.blob.core.windows.net/data?restype=container&comp=list&prefix=p/',
      'https://acct.blob.core.windows.net/data?restype=container&comp=list&prefix=p/&marker=mark-1',
    ]);
    expect(urls).toEqual([
      'https://acct.blob.core.windows.net/data/p/a.parquet',
      'https://acct.blob.core.windows.net/data/p/b.parquet',
    ]);
  });

  it('rejects without a scheme platform', async () => {
    const fetchFn = stubFetch([]);
    await expect(
      expandPartitionGlob('az://data/p/*.parquet', null, { fetchFn }),
    ).rejects.toMatchObject({ code: 'globUnresolved' });
    expect(fetchFn.urls).toEqual([]);
  });
});

describe('expandPartitionGlob rejections', () => {
  it('rejects an unsupported scheme by name', async () => {
    const fetchFn = stubFetch([]);
    await expect(
      expandPartitionGlob('ftp://host/p/*.parquet', null, { fetchFn }),
    ).rejects.toMatchObject({ code: 'globUnresolved', message: expect.stringContaining('ftp') });
    expect(fetchFn.urls).toEqual([]);
  });

  it('rejects a glob with no bucket', async () => {
    await expect(expandPartitionGlob('s3://', null, { fetchFn: stubFetch([]) }))
      .rejects.toMatchObject({ code: 'globUnresolved' });
  });

  it('rejects an empty glob', async () => {
    await expect(expandPartitionGlob('', null, { fetchFn: stubFetch([]) }))
      .rejects.toMatchObject({ code: 'globUnresolved' });
  });
});

describe('MAX_PARTITION_KEYS', () => {
  it('caps an expansion at one thousand files', () => {
    expect(MAX_PARTITION_KEYS).toBe(1000);
  });
});
