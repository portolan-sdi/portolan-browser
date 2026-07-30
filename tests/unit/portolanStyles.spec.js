import { describe, it, expect, vi } from 'vitest'
import { resolveStyles, extractLegend, loadStyleJson } from '../../src/utils/portolanStyles.js'

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
    // on `roles: ["style"]`. No `portolan:styles` manifest exists any more.
    describe('style-role assets', () => {
      const styleAsset = (over = {}) => ({
        type: 'application/vnd.mapbox.style+json',
        roles: ['style'],
        ...over,
      })

      it('discovers styles from assets with the style role', () => {
        const stac = {
          assets: {
            data: { href: './d.parquet', roles: ['data'] },
            'style-categorical': styleAsset({ href: './styles/categorical.json', title: 'Categorical MapLibre style' }),
            'style-labeled': styleAsset({ href: './styles/labeled.json', title: 'Labeled MapLibre style' }),
          },
          getAbsoluteUrl: () => 'https://example.com/boundaries/nl/collection.json',
        }
        const result = resolveStyles(stac)
        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({
          name: 'style-categorical',
          title: 'Categorical MapLibre style',
          href: 'https://example.com/boundaries/nl/styles/categorical.json',
        })
        expect(result[1].href).toBe('https://example.com/boundaries/nl/styles/labeled.json')
      })

      it('preserves asset document order (the default is listed first)', () => {
        const stac = {
          assets: {
            'style-a': styleAsset({ href: 'a.json' }),
            'style-b': styleAsset({ href: 'b.json' }),
          },
          getAbsoluteUrl: () => 'https://example.com/c.json',
        }
        expect(resolveStyles(stac).map(s => s.name)).toEqual(['style-a', 'style-b'])
      })

      it('reads assets through getAssets() when stac-js provides it', () => {
        const asset = {
          ...styleAsset({ href: './styles/main.json', title: 'Main' }),
          getKey: () => 'style-main',
          getAbsoluteUrl: () => 'https://example.com/styles/main.json',
        }
        const stac = {
          getAssets: () => [asset],
          getAbsoluteUrl: () => 'https://example.com/collection.json',
        }
        const result = resolveStyles(stac)
        expect(result).toEqual([
          { name: 'style-main', title: 'Main', href: 'https://example.com/styles/main.json' },
        ])
      })

      it('ignores assets without the style role', () => {
        const stac = {
          assets: {
            visual: { href: './v.pmtiles', roles: ['visual'], type: 'application/vnd.pmtiles' },
            thumbnail: { href: './t.png', roles: ['thumbnail'], type: 'image/png' },
          },
          getAbsoluteUrl: () => 'https://example.com/c.json',
        }
        expect(resolveStyles(stac)).toEqual([])
      })

      // Raster styling is still incubating in the spec with no decided format,
      // so a style-role asset of some other media type must not reach MapLibre.
      it('ignores style-role assets of a non-MapLibre media type', () => {
        const stac = {
          assets: {
            'style-sld': { href: './styles/x.sld', roles: ['style'], type: 'application/vnd.ogc.sld+xml' },
          },
          getAbsoluteUrl: () => 'https://example.com/c.json',
        }
        expect(resolveStyles(stac)).toEqual([])
      })

      it('accepts a style-role asset that declares no media type', () => {
        const stac = {
          assets: { 'style-main': { href: './styles/main.json', roles: ['style'] } },
          getAbsoluteUrl: () => 'https://example.com/c.json',
        }
        expect(resolveStyles(stac)).toHaveLength(1)
      })

      it('falls back to the asset key, minus the styles/ prefix, when untitled', () => {
        const stac = {
          assets: { 'styles/categorical': styleAsset({ href: './styles/categorical.json' }) },
          getAbsoluteUrl: () => 'https://example.com/c.json',
        }
        expect(resolveStyles(stac)[0].title).toBe('categorical')
      })

      it('strips a common prefix across style-role asset titles', () => {
        const stac = {
          assets: {
            s1: styleAsset({ href: 's1.json', title: 'Land Use - Residential' }),
            s2: styleAsset({ href: 's2.json', title: 'Land Use - Commercial' }),
          },
          getAbsoluteUrl: () => 'https://example.com/c.json',
        }
        expect(resolveStyles(stac).map(s => s.title)).toEqual(['Residential', 'Commercial'])
      })

      // The legacy manifest is a fallback only: a catalog carrying both must
      // follow the assets, which are what the spec defines.
      it('prefers style-role assets over a legacy portolan:styles manifest', () => {
        const stac = {
          properties: { 'portolan:styles': ['legacy'] },
          assets: {
            legacy: { href: './styles/legacy.json', title: 'Legacy', getAbsoluteUrl: () => 'https://example.com/styles/legacy.json' },
            'style-new': styleAsset({ href: './styles/new.json', title: 'New' }),
          },
          getAbsoluteUrl: () => 'https://example.com/c.json',
        }
        expect(resolveStyles(stac).map(s => s.name)).toEqual(['style-new'])
      })
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
