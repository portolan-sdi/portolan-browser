import { describe, it, expect } from 'vitest';
import { parseRegistryExport } from '../../src/utils/registry.js';

function child(props = {}) {
  return Object.assign({
    rel: 'child',
    href: 'https://stac.example/catalog.json',
    type: 'application/json',
    title: 'Example Catalog',
    'portolan_registry:id': 'example-catalog',
    'portolan_registry:status': 'valid',
    'portolan_registry:api_type': 'static',
    'portolan_registry:collection_count': 3,
    'portolan_registry:feature_count': 1234567
  }, props);
}

function exportDoc(links) {
  return { type: 'Catalog', id: 'portolan-registry', links };
}

describe('parseRegistryExport', () => {
  it('maps a child link to a catalog entry', () => {
    const [entry] = parseRegistryExport(exportDoc([child()]));
    expect(entry).toEqual({
      id: 'example-catalog',
      title: 'Example Catalog',
      url: 'https://stac.example/catalog.json',
      isApi: false,
      collectionCount: 3,
      featureCount: 1234567,
      countsPartial: false
    });
  });

  it('ignores the root and self links', () => {
    const entries = parseRegistryExport(exportDoc([
      { rel: 'root', href: 'https://registry.example/catalogs.json' },
      { rel: 'self', href: 'https://registry.example/catalogs.json' },
      child()
    ]));
    expect(entries).toHaveLength(1);
  });

  it('drops removed catalogs but keeps stale ones', () => {
    const entries = parseRegistryExport(exportDoc([
      child({ 'portolan_registry:id': 'gone', 'portolan_registry:status': 'removed' }),
      child({ 'portolan_registry:id': 'stale', 'portolan_registry:status': 'stale' })
    ]));
    expect(entries.map(e => e.id)).toEqual(['stale']);
  });

  it('flags APIs', () => {
    const [entry] = parseRegistryExport(exportDoc([child({ 'portolan_registry:api_type': 'api' })]));
    expect(entry.isApi).toBe(true);
  });

  it('reports partial counts as partial', () => {
    const [entry] = parseRegistryExport(exportDoc([child({
      'portolan_registry:collection_count': 1,
      'portolan_registry:feature_count': 0,
      'portolan_registry:counts_partial': true
    })]));
    expect(entry).toMatchObject({ collectionCount: 1, featureCount: null, countsPartial: true });
  });

  it('leaves out counts the registry could not measure', () => {
    const [entry] = parseRegistryExport(exportDoc([child({
      'portolan_registry:collection_count': 0,
      'portolan_registry:feature_count': null
    })]));
    expect(entry).toMatchObject({ collectionCount: null, featureCount: null });
  });

  // The export is fetched from a host this repo does not control, and a click
  // follows the href, so anything the browser cannot read a catalog over is not
  // offered at all.
  it('refuses hrefs that are not plain http(s) URLs', () => {
    const entries = parseRegistryExport(exportDoc([
      child({ 'portolan_registry:id': 'js', href: 'javascript:alert(1)' }),
      child({ 'portolan_registry:id': 'data', href: 'data:text/html,<script>alert(1)</script>' }),
      child({ 'portolan_registry:id': 'file', href: 'file:///etc/passwd' }),
      child({ 'portolan_registry:id': 'blank', href: '   ' }),
      child({ 'portolan_registry:id': 'relative', href: '/catalog.json' }),
      child({ 'portolan_registry:id': 'ok', href: 'https://stac.example/catalog.json' })
    ]));
    expect(entries.map(e => e.id)).toEqual(['ok']);
  });

  it('refuses credentials embedded in the URL', () => {
    const entries = parseRegistryExport(exportDoc([
      child({ href: 'https://user:pw@stac.example/catalog.json' })
    ]));
    expect(entries).toEqual([]);
  });

  // The id keys the rendered list; a repeat would render the wrong row.
  it('keeps the ids it returns unique', () => {
    const entries = parseRegistryExport(exportDoc([
      child({ href: 'https://a.example/catalog.json' }),
      child({ href: 'https://b.example/catalog.json' })
    ]));
    expect(entries).toHaveLength(2);
    expect(new Set(entries.map(e => e.id)).size).toBe(2);
  });

  it('falls back to the registry id when a title is missing', () => {
    const [entry] = parseRegistryExport(exportDoc([child({ title: '' })]));
    expect(entry.title).toBe('example-catalog');
  });

  it('returns nothing for malformed input', () => {
    expect(parseRegistryExport(null)).toEqual([]);
    expect(parseRegistryExport({})).toEqual([]);
    expect(parseRegistryExport(exportDoc([{ rel: 'child' }]))).toEqual([]);
  });
});
