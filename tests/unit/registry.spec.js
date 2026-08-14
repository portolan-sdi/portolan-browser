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
      summary: '3 collections · 1.2M features',
      url: 'https://stac.example/catalog.json',
      isApi: false
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

  it('marks partial counts as a floor', () => {
    const [entry] = parseRegistryExport(exportDoc([child({
      'portolan_registry:collection_count': 1,
      'portolan_registry:feature_count': 0,
      'portolan_registry:counts_partial': true
    })]));
    expect(entry.summary).toBe('1+ collection');
  });

  it('leaves out counts the registry could not measure', () => {
    const [entry] = parseRegistryExport(exportDoc([child({
      'portolan_registry:collection_count': 0,
      'portolan_registry:feature_count': null
    })]));
    expect(entry.summary).toBe('');
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
