import { describe, it, expect } from 'vitest';
import {
  dataHostRewrite,
  entryDocumentCandidates,
  entryDocumentHits
} from '../../src/utils/externalUrlRecovery.js';

describe('externalUrlRecovery', () => {
  describe('dataHostRewrite', () => {
    it('rewrites source.coop to the data host', () => {
      const result = dataHostRewrite('https://source.coop/mmidzik/goes-fdc/goes-18-fdcc');
      expect(result).toEqual({
        host: 'source.coop',
        dataHost: 'data.source.coop',
        url: 'https://data.source.coop/mmidzik/goes-fdc/goes-18-fdcc'
      });
    });

    it('rewrites www.source.coop to the data host', () => {
      const result = dataHostRewrite('https://www.source.coop/mmidzik/goes-fdc');
      expect(result).toEqual({
        host: 'www.source.coop',
        dataHost: 'data.source.coop',
        url: 'https://data.source.coop/mmidzik/goes-fdc'
      });
    });

    it('keeps the path, the query and the trailing slash', () => {
      const result = dataHostRewrite('https://source.coop/a/b/?x=1');
      expect(result.url).toBe('https://data.source.coop/a/b/?x=1');
    });

    it('ignores the case of the host', () => {
      const result = dataHostRewrite('https://Source.Coop/a');
      expect(result.url).toBe('https://data.source.coop/a');
    });

    it('returns null for a host that is not source.coop', () => {
      expect(dataHostRewrite('https://example.com/a/b')).toBeNull();
      expect(dataHostRewrite('https://data.source.coop/a/b')).toBeNull();
      expect(dataHostRewrite('https://notsource.coop/a/b')).toBeNull();
    });

    it('returns null for input that is not an absolute URL', () => {
      expect(dataHostRewrite('/a/b')).toBeNull();
      expect(dataHostRewrite('')).toBeNull();
      expect(dataHostRewrite(null)).toBeNull();
    });
  });

  describe('entryDocumentCandidates', () => {
    it('lists the entry documents of the URL and of the parent', () => {
      expect(entryDocumentCandidates('https://data.source.coop/mmidzik/goes-fdc/goes-18-fdcc')).toEqual([
        'https://data.source.coop/mmidzik/goes-fdc/goes-18-fdcc/catalog.json',
        'https://data.source.coop/mmidzik/goes-fdc/goes-18-fdcc/collection.json',
        'https://data.source.coop/mmidzik/goes-fdc/catalog.json',
        'https://data.source.coop/mmidzik/goes-fdc/collection.json'
      ]);
    });

    it('gives the same list for a URL with a trailing slash', () => {
      const plain = entryDocumentCandidates('https://example.com/a/b');
      expect(entryDocumentCandidates('https://example.com/a/b/')).toEqual(plain);
    });

    it('returns no candidate for a URL that ends in .json', () => {
      expect(entryDocumentCandidates('https://example.com/a/catalog.json')).toEqual([]);
      expect(entryDocumentCandidates('https://example.com/a/Collection.JSON')).toEqual([]);
      expect(entryDocumentCandidates('https://example.com/a/catalog.json?x=1')).toEqual([]);
    });

    it('returns no parent candidate for a root-level URL', () => {
      expect(entryDocumentCandidates('https://example.com/')).toEqual([
        'https://example.com/catalog.json',
        'https://example.com/collection.json'
      ]);
      expect(entryDocumentCandidates('https://example.com')).toEqual([
        'https://example.com/catalog.json',
        'https://example.com/collection.json'
      ]);
    });

    it('removes duplicate candidates', () => {
      const candidates = entryDocumentCandidates('https://example.com/');
      expect(candidates).toHaveLength(2);
      expect(new Set(candidates).size).toBe(candidates.length);
    });

    it('drops the query and the fragment of the pasted URL', () => {
      expect(entryDocumentCandidates('https://example.com/a?x=1#y')).toEqual([
        'https://example.com/a/catalog.json',
        'https://example.com/a/collection.json',
        'https://example.com/catalog.json',
        'https://example.com/collection.json'
      ]);
    });

    it('returns no candidate for input that is not an absolute URL', () => {
      expect(entryDocumentCandidates('/a/b')).toEqual([]);
      expect(entryDocumentCandidates(null)).toEqual([]);
    });
  });

  describe('entryDocumentHits', () => {
    it('keeps a result that fetches OK and parses as JSON', () => {
      const results = [
        { url: 'https://example.com/a/catalog.json', ok: false, json: false },
        { url: 'https://example.com/a/collection.json', ok: true, json: true },
        { url: 'https://example.com/catalog.json', ok: true, json: true },
        { url: 'https://example.com/collection.json', ok: true, json: false }
      ];
      expect(entryDocumentHits(results)).toEqual([
        'https://example.com/a/collection.json',
        'https://example.com/catalog.json'
      ]);
    });

    it('returns an empty list for no result and for bad input', () => {
      expect(entryDocumentHits([])).toEqual([]);
      expect(entryDocumentHits(null)).toEqual([]);
      expect(entryDocumentHits([null, undefined, {}])).toEqual([]);
    });

    it('removes duplicate hits', () => {
      const hit = { url: 'https://example.com/catalog.json', ok: true, json: true };
      expect(entryDocumentHits([hit, hit])).toEqual(['https://example.com/catalog.json']);
    });
  });
});
