import { describe, it, expect, vi } from 'vitest'
import Collection from 'stac-js/src/collection.js'
import { resolveStyles, extractLegend, loadStyleJson } from '../../src/utils/portolanStyles.js'

const COLLECTION_URL = 'https://example.com/boundaries/nl/collection.json'

describe('portolanStyles', () => {
  describe('extractLegend', () => {
    it('returns empty array for null style', () => {
      expect(extractLegend(null)).toEqual([])
    })

    it('returns empty array when no layers', () => {
      expect(extractLegend({})).toEqual([])
      expect(extractLegend({ layers: [] })).toEqual([])
    })

    it('returns empty array when no fill layer', () => {
      const style = {
        layers: [{ type: 'line', paint: {} }]
      }
      expect(extractLegend(style)).toEqual([])
    })

    it('returns empty array for string fill-color', () => {
      const style = {
        layers: [{ type: 'fill', paint: { 'fill-color': '#ff0000' } }]
      }
      expect(extractLegend(style)).toEqual([])
    })

    it('parses step expression', () => {
      const style = {
        layers: [{
          type: 'fill',
          paint: {
            'fill-color': [
              'step',
              ['get', 'value'],
              '#ccc',      // default color
              10, '#red',  // stop 1
              20, '#blue', // stop 2
              30, '#green' // stop 3
            ]
          }
        }]
      }
      const legend = extractLegend(style)
      expect(legend).toHaveLength(4)
      expect(legend[0]).toEqual({ color: '#ccc', label: '< 10' })
      expect(legend[1]).toEqual({ color: '#red', label: '10–20' })
      expect(legend[2]).toEqual({ color: '#blue', label: '20–30' })
      expect(legend[3]).toEqual({ color: '#green', label: '30+' })
    })

    it('parses match expression', () => {
      const style = {
        layers: [{
          type: 'fill',
          paint: {
            'fill-color': [
              'match',
              ['get', 'category'],
              'residential', '#ff0000',
              'commercial', '#00ff00',
              'industrial', '#0000ff',
              '#cccccc' // fallback
            ]
          }
        }]
      }
      const legend = extractLegend(style)
      expect(legend).toHaveLength(3)
      expect(legend[0]).toEqual({ color: '#ff0000', label: 'residential' })
      expect(legend[1]).toEqual({ color: '#00ff00', label: 'commercial' })
      expect(legend[2]).toEqual({ color: '#0000ff', label: 'industrial' })
    })

    it('handles numeric match values', () => {
      const style = {
        layers: [{
          type: 'fill',
          paint: {
            'fill-color': [
              'match',
              ['get', 'code'],
              1, '#red',
              2, '#blue',
              '#gray'
            ]
          }
        }]
      }
      const legend = extractLegend(style)
      expect(legend[0].label).toBe('1')
      expect(legend[1].label).toBe('2')
    })
  })

  describe('resolveStyles', () => {
    it('returns empty array when no styles property', () => {
      const stac = { properties: {} }
      expect(resolveStyles(stac)).toEqual([])
    })

    // Portolan core.md: styles are discovered by filtering collection assets
    // on the `style` role, and the default among them carries a second
    // `default` role. No `portolan:styles` manifest exists any more.
    describe('style-role assets', () => {
      // A real stac-js Collection — this is what MapView passes in production
      // (the vuex store hydrates STAC JSON via src/models/stac.js), so these
      // tests exercise the shipped path rather than a duck type.
      const collection = (assets, extra = {}) => new Collection({
        type: 'Collection',
        stac_version: '1.0.0',
        id: 'nl',
        description: 'test',
        license: 'proprietary',
        extent: { spatial: { bbox: [[-180, -90, 180, 90]] }, temporal: { interval: [[null, null]] } },
        links: [{ rel: 'self', href: COLLECTION_URL }],
        assets,
        ...extra,
      }, COLLECTION_URL)

      const styleAsset = (over = {}) => ({
        type: 'application/vnd.mapbox.style+json',
        roles: ['style'],
        ...over,
      })

      it('discovers styles from assets with the style role', () => {
        const stac = collection({
          data: { href: './d.parquet', roles: ['data'] },
          'style-categorical': styleAsset({ href: './styles/categorical.json', title: 'Categorical MapLibre style' }),
          'style-labeled': styleAsset({ href: './styles/labeled.json', title: 'Labeled MapLibre style' }),
        })
        const result = resolveStyles(stac)
        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({
          name: 'style-categorical',
          title: 'Categorical MapLibre style',
          href: 'https://example.com/boundaries/nl/styles/categorical.json',
        })
        expect(result[1].href).toBe('https://example.com/boundaries/nl/styles/labeled.json')
      })

      // core.md: "when a collection provides more than one style, exactly one
      // style asset MUST carry both `style` and `default` in its `roles`."
      it('hoists the asset carrying the default role, whatever its position', () => {
        const stac = collection({
          'style-labeled': styleAsset({ href: './styles/labeled.json', title: 'Labeled' }),
          'style-graduated': styleAsset({ href: './styles/graduated.json', title: 'Graduated' }),
          'style-categorical': styleAsset({ href: './styles/categorical.json', title: 'Categorical', roles: ['style', 'default'] }),
        })
        expect(resolveStyles(stac).map(s => s.name)).toEqual([
          'style-categorical', 'style-labeled', 'style-graduated',
        ])
      })

      it('keeps a default-role asset first when it already is', () => {
        const stac = collection({
          'style-default': styleAsset({ href: './styles/default.json', title: 'Default', roles: ['style', 'default'] }),
          'style-labeled': styleAsset({ href: './styles/labeled.json', title: 'Labeled' }),
        })
        expect(resolveStyles(stac).map(s => s.name)).toEqual(['style-default', 'style-labeled'])
      })

      // Keys deliberately in non-alphabetical order, so a stray sort on the
      // entries would fail here rather than slip through.
      it('falls back to document order when no asset carries the default role', () => {
        const stac = collection({
          'style-zoning': styleAsset({ href: './styles/zoning.json', title: 'Zoning' }),
          'style-admin': styleAsset({ href: './styles/admin.json', title: 'Admin' }),
        })
        expect(resolveStyles(stac).map(s => s.name)).toEqual(['style-zoning', 'style-admin'])
      })

      it('ignores assets without the style role', () => {
        const stac = collection({
          visual: { href: './v.pmtiles', roles: ['visual'], type: 'application/vnd.pmtiles' },
          thumbnail: { href: './t.png', roles: ['thumbnail'], type: 'image/png' },
        })
        expect(resolveStyles(stac)).toEqual([])
      })

      // Raster styling has no decided format, so a style-role asset of some
      // other media type must not reach MapLibre.
      it('ignores style-role assets of a non-MapLibre media type', () => {
        const stac = collection({
          'style-sld': { href: './styles/x.sld', roles: ['style'], type: 'application/vnd.ogc.sld+xml' },
        })
        expect(resolveStyles(stac)).toEqual([])
      })

      // Catalogs published before the media type was pinned type their styles
      // application/json; the role is the normative signal.
      it('accepts a style-role asset typed application/json', () => {
        const stac = collection({
          'style-main': { href: './styles/main.json', roles: ['style'], type: 'application/json' },
        })
        expect(resolveStyles(stac).map(s => s.href))
          .toEqual(['https://example.com/boundaries/nl/styles/main.json'])
      })

      it('accepts a media type differing only in case', () => {
        const stac = collection({
          'style-main': { href: './styles/main.json', roles: ['style'], type: 'Application/VND.Mapbox.Style+JSON' },
        })
        expect(resolveStyles(stac)).toHaveLength(1)
      })

      it('accepts a style-role asset that declares no media type', () => {
        const stac = collection({ 'style-main': { href: './styles/main.json', roles: ['style'] } })
        expect(resolveStyles(stac)).toEqual([{
          name: 'style-main',
          title: 'style-main',
          href: 'https://example.com/boundaries/nl/styles/main.json',
        }])
      })

      it('ignores an asset whose roles is not an array', () => {
        const stac = collection({ 'style-main': { href: './styles/main.json', roles: 'style' } })
        expect(resolveStyles(stac)).toEqual([])
      })

      it('falls back to the asset key, minus the styles/ prefix, when untitled', () => {
        const stac = collection({ 'styles/categorical': styleAsset({ href: './styles/categorical.json' }) })
        expect(resolveStyles(stac)[0].title).toBe('categorical')
      })

      // Anchored strip: an unanchored replace would mangle this to basemap/dark.
      it('only strips a leading styles/ from the key', () => {
        const stac = collection({ 'basemap/styles/dark': styleAsset({ href: './styles/dark.json' }) })
        expect(resolveStyles(stac)[0].title).toBe('basemap/styles/dark')
      })

      it('strips a common prefix across style-role asset titles', () => {
        const stac = collection({
          s1: styleAsset({ href: 's1.json', title: 'Land Use - Residential' }),
          s2: styleAsset({ href: 's2.json', title: 'Land Use - Commercial' }),
        })
        expect(resolveStyles(stac).map(s => s.title)).toEqual(['Residential', 'Commercial'])
      })

      describe('malformed assets are skipped, not thrown on', () => {
        it('skips a style asset with no href and keeps the rest', () => {
          const stac = collection({
            'style-broken': styleAsset({ title: 'Broken' }),
            'style-ok': styleAsset({ href: './styles/ok.json', title: 'OK' }),
          })
          expect(resolveStyles(stac).map(s => s.name)).toEqual(['style-ok'])
        })

        it('skips a style asset with a non-string type', () => {
          const stac = collection({ 'style-main': { href: './styles/main.json', roles: ['style'], type: 123 } })
          expect(() => resolveStyles(stac)).not.toThrow()
          expect(resolveStyles(stac)).toEqual([])
        })

        it('does not throw on a non-string title', () => {
          const stac = collection({
            s1: styleAsset({ href: './styles/a.json', title: {} }),
            s2: styleAsset({ href: './styles/b.json', title: 'B' }),
          })
          expect(() => resolveStyles(stac)).not.toThrow()
          expect(resolveStyles(stac).map(s => s.title)).toEqual(['s1', 'B'])
        })

        // Hrefs come from untrusted catalog JSON and go straight to fetch().
        it.each(['file:///etc/passwd', 'javascript:alert(1)', 'data:application/json,{}'])(
          'drops a style href with the %s scheme',
          href => {
            expect(resolveStyles(collection({ 'style-main': styleAsset({ href }) }))).toEqual([])
          },
        )
      })

      describe('legacy portolan:styles manifest', () => {
        // A half-migrated catalog: one style tagged as an asset, the others
        // still only named in the manifest. Neither source may erase the other.
        it('merges manifest entries the asset scan did not find', () => {
          const stac = collection({
            'styles/default': { href: './styles/default.json', roles: ['style'], type: 'application/json', title: 'Default' },
            'styles/by-age': { href: './styles/by-age.json', title: 'By Age' },
          }, { 'portolan:styles': ['styles/default', 'styles/by-age'] })
          expect(resolveStyles(stac).map(s => s.name)).toEqual(['styles/default', 'styles/by-age'])
        })

        // No asset carries the default role, so the manifest's curated order
        // breaks the tie rather than asset document order.
        it('lets the manifest first entry outrank document order', () => {
          const stac = collection({
            'styles/by-age': { href: './styles/by-age.json', roles: ['style'], type: 'application/json', title: 'By Age' },
            'styles/default': { href: './styles/default.json', roles: ['style'], type: 'application/json', title: 'Default' },
          }, { 'portolan:styles': ['styles/default', 'styles/by-age'] })
          expect(resolveStyles(stac).map(s => s.name)).toEqual(['styles/default', 'styles/by-age'])
        })

        it('lets the default role outrank the manifest order', () => {
          const stac = collection({
            'styles/by-age': { href: './styles/by-age.json', roles: ['style', 'default'], type: 'application/json', title: 'By Age' },
            'styles/default': { href: './styles/default.json', roles: ['style'], type: 'application/json', title: 'Default' },
          }, { 'portolan:styles': ['styles/default', 'styles/by-age'] })
          expect(resolveStyles(stac).map(s => s.name)).toEqual(['styles/by-age', 'styles/default'])
        })

        it('does not let a manifest-only entry leapfrog a tagged asset', () => {
          const stac = collection({
            legacy: { href: './styles/legacy.json', title: 'Legacy' },
            'style-new': styleAsset({ href: './styles/new.json', title: 'New' }),
          }, { 'portolan:styles': ['legacy'] })
          expect(resolveStyles(stac).map(s => s.name)).toEqual(['style-new', 'legacy'])
        })
      })

      it('resolves hrefs relative when the collection has no self link', () => {
        const stac = new Collection({
          type: 'Collection',
          stac_version: '1.0.0',
          id: 'nl',
          description: 'test',
          license: 'proprietary',
          extent: { spatial: { bbox: [[-180, -90, 180, 90]] }, temporal: { interval: [[null, null]] } },
          links: [],
          assets: { 'style-main': styleAsset({ href: 'styles/main.json' }) },
        })
        expect(resolveStyles(stac).map(s => s.href)).toEqual(['styles/main.json'])
      })
    })

    it('returns empty array for null', () => {
      expect(resolveStyles(null)).toEqual([])
    })

    it('returns empty array when styles is empty', () => {
      const stac = { properties: { 'portolan:styles': [] } }
      expect(resolveStyles(stac)).toEqual([])
    })

    it('resolves string entries from assets', () => {
      const stac = {
        properties: { 'portolan:styles': ['style1'] },
        assets: {
          style1: {
            title: 'My Style',
            href: 'styles/style1.json',
            getAbsoluteUrl: () => 'https://example.com/styles/style1.json'
          }
        },
        getAbsoluteUrl: () => 'https://example.com/'
      }
      const result = resolveStyles(stac)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('style1')
      expect(result[0].title).toBe('My Style')
      expect(result[0].href).toBe('https://example.com/styles/style1.json')
    })

    it('skips missing asset references', () => {
      const stac = {
        properties: { 'portolan:styles': ['missing'] },
        assets: {},
        getAbsoluteUrl: () => 'https://example.com/'
      }
      expect(resolveStyles(stac)).toEqual([])
    })

    it('resolves object entries with href', () => {
      const stac = {
        properties: {
          'portolan:styles': [{ name: 'custom', href: 'styles/custom.json' }]
        },
        assets: {},
        getAbsoluteUrl: () => 'https://example.com/'
      }
      const result = resolveStyles(stac)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('custom')
      expect(result[0].href).toBe('https://example.com/styles/custom.json')
    })

    it('strips common prefix from multiple style titles', () => {
      const stac = {
        properties: { 'portolan:styles': ['s1', 's2'] },
        assets: {
          s1: { title: 'Land Use - Residential', href: 's1.json', getAbsoluteUrl: () => 's1.json' },
          s2: { title: 'Land Use - Commercial', href: 's2.json', getAbsoluteUrl: () => 's2.json' }
        },
        getAbsoluteUrl: () => ''
      }
      const result = resolveStyles(stac)
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Residential')
      expect(result[1].title).toBe('Commercial')
    })

    it('reads from top-level portolan:styles if not in properties', () => {
      const stac = {
        'portolan:styles': ['topLevel'],
        properties: {},
        assets: {
          topLevel: { title: 'Top Level', href: 'tl.json', getAbsoluteUrl: () => 'tl.json' }
        },
        getAbsoluteUrl: () => ''
      }
      const result = resolveStyles(stac)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('topLevel')
    })
  })

  describe('loadStyleJson', () => {
    it('fetches and validates style', async () => {
      const mockStyle = { version: 8, layers: [] }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStyle)
      })

      const result = await loadStyleJson('https://example.com/style.json')
      expect(result).toEqual(mockStyle)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/style.json',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    })

    it('throws on HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })

      await expect(loadStyleJson('https://example.com/missing.json'))
        .rejects.toThrow('Failed to fetch style: 404')
    })

    it('throws on invalid version', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ version: 7 })
      })

      await expect(loadStyleJson('https://example.com/old.json'))
        .rejects.toThrow('Invalid Mapbox GL style (version !== 8)')
    })
  })
})
