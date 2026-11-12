// The download card's choices, as pure functions: which parquet table of a
// multi-asset collection, over which dates, said how honestly.
//
// Fixtures are trimmed from the real catalogs these were written against:
// Fields of the World's `benchmark-data` collections (four parquet tables
// with role `data`, each with its own `table:columns` and `table:row_count`)
// and firms-catalog's year items (a detections table beside two aggregates,
// with the item's `table:columns` describing only the first).

import { describe, it, expect } from 'vitest'
import { Collection, Item } from 'stac-js'
import {
  parquetDataAssets,
  primaryAssetKey,
  narrowToAsset,
  hasOwnTableFields
} from '../../src/utils/download/assets.js'
import {
  temporalExtent,
  toDateInput,
  extentDays,
  defaultWindow,
  toTimeFilter,
  windowInverted,
  DEFAULT_WINDOW_DAYS
} from '../../src/utils/download/time.js'
import {
  formatBytes,
  formatCount,
  describeBounded,
  pruneLines,
  camelCode,
  describeError,
  isCancellation,
  ERROR_CODES
} from '../../src/utils/download/present.js'
import { describeDataset, toPlainStacJson, fetchTargets } from '../../src/utils/download/descriptor.js'
import { listFormats, pluginWeight, pickerExtension, FORMAT_ORDER } from '../../src/utils/download/formats.js'

const BENCHMARK_URL = 'https://data.example.org/ftw/benchmark-data/at_2021/collection.json'

function columns(names) {
  return names.map(name => ({
    name,
    type: name === 'geometry' ? 'geometry' : name === 'bbox' ? 'struct' : 'double'
  }))
}

/** Austria 2021: four parquet tables with role `data`, plus a mirror. */
function benchmark() {
  return new Collection({
    type: 'Collection',
    stac_version: '1.1.0',
    id: 'at_2021',
    title: 'Austria — 2021',
    description: 'Field boundaries and chips.',
    license: 'CC-BY-4.0',
    extent: {
      spatial: { bbox: [[9.53, 46.4, 17.16, 49.02]] },
      temporal: { interval: [['2021-01-01T00:00:00Z', '2021-12-31T23:59:59Z']] }
    },
    assets: {
      fields: {
        href: './at_2021_fields.parquet',
        type: 'application/vnd.apache.parquet',
        title: 'Field boundary polygons',
        'file:size': 888904336,
        'table:row_count': 2610511,
        'table:columns': columns(['crop:name', 'geometry', 'bbox']),
        roles: ['data']
      },
      boundary_lines: {
        href: './at_2021_boundary_lines.parquet',
        type: 'application/vnd.apache.parquet',
        title: 'Field boundary lines',
        'file:size': 596696681,
        'table:row_count': 1836737,
        'table:columns': columns(['crop:name', 'geometry', 'bbox']),
        roles: ['data']
      },
      chips: {
        href: './at_2021_chips.parquet',
        type: 'application/vnd.apache.parquet',
        title: 'Chip definitions with field coverage',
        'file:size': 1458742,
        'table:row_count': 14506,
        'table:columns': columns(['split', 'field_coverage_pct', 'geometry', 'bbox']),
        roles: ['data']
      },
      items: {
        href: './items.parquet',
        type: 'application/vnd.apache.parquet',
        title: 'STAC items in GeoParquet format (collection mirror)',
        roles: ['collection-mirror']
      },
      fields_tiles: { href: './fields.pmtiles', type: 'application/vnd.pmtiles', roles: ['visual'] },
      thumbnail: { href: './thumbnail.webp', type: 'image/webp', roles: ['thumbnail'] }
    },
    links: [{ rel: 'self', href: BENCHMARK_URL }]
  })
}

/** A FIRMS year: the detections table, then two aggregates of it. */
function firmsItem() {
  return new Item({
    type: 'Feature',
    stac_version: '1.1.0',
    id: '2020',
    collection: 'detections',
    geometry: { type: 'Polygon', coordinates: [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]] },
    properties: {
      start_datetime: '2020-01-01T00:00:00Z',
      end_datetime: '2020-12-31T23:58:00Z',
      'table:row_count': 45667027,
      'table:columns': [
        { name: 'geometry', type: 'geometry' },
        { name: 'acq_datetime', type: 'timestamp' },
        { name: 'frp', type: 'double' },
        { name: 'sensor', type: 'string' }
      ]
    },
    assets: {
      data: {
        href: './detections.parquet',
        type: 'application/vnd.apache.parquet',
        title: '2020 detections, GeoParquet 2.0',
        'file:size': 797505286,
        roles: ['data']
      },
      pmtiles: { href: './fire-2020.pmtiles', type: 'application/vnd.pmtiles', roles: ['visual', 'tiles'] },
      'aggregate-r5': {
        href: './aggregate-r5.parquet',
        type: 'application/vnd.apache.parquet',
        title: '2020 detections aggregated to a5 r5, daily columns',
        'file:size': 1840483,
        roles: ['data', 'aggregate']
      }
    },
    links: [{ rel: 'self', href: 'https://data.example.org/firms/detections/year=2020/2020.json' }]
  })
}

/** A collection whose only parquet asset declares no roles at all. */
function unroled() {
  return new Collection({
    type: 'Collection',
    stac_version: '1.1.0',
    id: 'unroled',
    description: 'A table with no roles declared.',
    license: 'CC0-1.0',
    extent: { spatial: { bbox: [[-1, -1, 1, 1]] }, temporal: { interval: [[null, null]] } },
    'table:columns': columns(['name', 'geometry', 'bbox']),
    assets: {
      table: { href: './table.parquet', type: 'application/vnd.apache.parquet' }
    },
    links: [{ rel: 'self', href: 'https://data.example.org/unroled/collection.json' }]
  })
}

describe('parquetDataAssets', () => {
  it('lists every parquet table a download could read, in document order', () => {
    const assets = parquetDataAssets(toPlainStacJson(benchmark()))
    expect(assets.map(asset => asset.key)).toEqual(['fields', 'boundary_lines', 'chips'])
    expect(assets[2]).toMatchObject({
      title: 'Chip definitions with field coverage',
      rowCount: 14506,
      bytes: 1458742,
      aggregate: false,
      overview: false,
      ownTable: true
    })
  })

  it('leaves out the collection mirror, the tiles and the thumbnail', () => {
    const keys = parquetDataAssets(toPlainStacJson(benchmark())).map(asset => asset.key)
    expect(keys).not.toContain('items')
    expect(keys).not.toContain('fields_tiles')
    expect(keys).not.toContain('thumbnail')
  })

  it('marks an aggregate as one, so the picker can say so', () => {
    const assets = parquetDataAssets(toPlainStacJson(firmsItem()))
    expect(assets.map(asset => asset.key)).toEqual(['data', 'aggregate-r5'])
    expect(assets[1].aggregate).toBe(true)
    // The aggregate declares no columns of its own; the item's describe the
    // detections table beside it.
    expect(assets[1].ownTable).toBe(false)
    expect(hasOwnTableFields(toPlainStacJson(firmsItem()).assets.data)).toBe(false)
  })

  it('marks a simplified display table as one', () => {
    // Every geoBoundaries collection publishes `display`: the same rows in
    // the same order with simplified geometry, role `data` + `overview`.
    // It is a real download choice (42 MB against 104 MB), and it is not
    // interchangeable with the data asset.
    const collection = benchmark()
    collection.assets.display = {
      href: './cgaz_adm2_display.parquet',
      type: 'application/vnd.apache.parquet',
      title: 'Display and filter geometry',
      'table:row_count': 49349,
      roles: ['data', 'overview']
    }
    const display = parquetDataAssets(toPlainStacJson(collection)).find(asset => asset.key === 'display')
    expect(display).toMatchObject({ overview: true, aggregate: false, rowCount: 49349 })
  })

  it('counts an asset with no roles as a candidate, and a wildcard href as none', () => {
    expect(parquetDataAssets(toPlainStacJson(unroled())).map(asset => asset.key)).toEqual(['table'])
    const globbed = {
      assets: {
        parts: { href: 'https://example.org/year=*/data.parquet', type: 'application/vnd.apache.parquet', roles: ['data'] }
      }
    }
    expect(parquetDataAssets(globbed)).toEqual([])
  })

  it('says nothing for junk', () => {
    expect(parquetDataAssets(null)).toEqual([])
    expect(parquetDataAssets({})).toEqual([])
    expect(primaryAssetKey({ assets: {} })).toBeUndefined()
  })
})

describe('narrowToAsset', () => {
  it('leaves the derivation only the chosen table', () => {
    const narrowed = narrowToAsset(toPlainStacJson(benchmark()), 'chips')
    expect(Object.keys(narrowed.assets).sort()).toEqual(['chips', 'fields_tiles', 'items', 'thumbnail'])
    expect(narrowed['table:row_count']).toBe(14506)
    expect(narrowed['table:columns'].map(column => column.name)).toContain('field_coverage_pct')
  })

  it('falls back to the primary table for an unknown key', () => {
    const narrowed = narrowToAsset(toPlainStacJson(benchmark()), 'nope')
    expect(Object.keys(narrowed.assets)).toContain('fields')
    expect(narrowed['table:row_count']).toBe(2610511)
  })

  it('gives an unroled asset the role §2.4 looks for', () => {
    const narrowed = narrowToAsset(toPlainStacJson(unroled()), 'table')
    expect(narrowed.assets.table.roles).toEqual(['data'])
  })

  it('does not hand an aggregate the entity-level columns of the table beside it', () => {
    const json = toPlainStacJson(firmsItem())
    expect(json['table:columns']).toBeDefined()
    const narrowed = narrowToAsset(json, 'aggregate-r5')
    // The aggregate's schema is daily columns, nothing like the detections
    // table's -- so no declared table at all, and `estimate()` infers one
    // from the parquet footer instead.
    expect(narrowed['table:columns']).toBeUndefined()
    expect(narrowed['table:row_count']).toBeUndefined()
    // The primary one keeps them.
    expect(narrowToAsset(json, 'data')['table:row_count']).toBe(45667027)
  })
})

describe('describeDataset with several parquet tables', () => {
  it('derives the primary table by default and names the alternatives', () => {
    const support = describeDataset(benchmark())
    expect(support.supported).toBe(true)
    expect(support.assetKey).toBe('fields')
    expect(support.descriptor.source.url).toBe('https://data.example.org/ftw/benchmark-data/at_2021/at_2021_fields.parquet')
    expect(support.assets.map(asset => asset.key)).toEqual(['fields', 'boundary_lines', 'chips'])
  })

  it('derives the chosen table, with that table\'s own row count and columns', () => {
    const support = describeDataset(benchmark(), { assetKey: 'chips' })
    expect(support.descriptor.source.url).toMatch(/at_2021_chips\.parquet$/)
    expect(support.descriptor.table.rowCount).toBe(14506)
    expect(support.descriptor.table.columns.map(column => column.name)).toContain('split')
  })

  it('offers an unroled parquet asset instead of refusing it', () => {
    const support = describeDataset(unroled())
    expect(support.supported).toBe(true)
    expect(support.descriptor.source).toEqual({
      kind: 'parquet',
      url: 'https://data.example.org/unroled/table.parquet'
    })
  })

  it('offers no picker for a partitioned collection, whose source is its partitions', () => {
    const firms = new Collection({
      type: 'Collection',
      stac_version: '1.1.0',
      id: 'detections',
      description: 'Fires.',
      license: 'CC0-1.0',
      extent: { spatial: { bbox: [[-180, -90, 180, 90]] }, temporal: { interval: [['2000-11-01T00:13:00Z', '2026-11-12T11:29:00Z']] } },
      'partition:scheme': 'hive',
      'partition:glob': 's3://portolan-mirrors/firms-catalog/detections/year=*/detections.parquet',
      'partition:keys': [{ name: 'year', type: 'int32' }],
      'table:columns': [
        { name: 'geometry', type: 'geometry' },
        { name: 'acq_datetime', type: 'timestamp' }
      ],
      assets: {
        'aggregate-r5': { href: './alltime-r5.parquet', type: 'application/vnd.apache.parquet', roles: ['data', 'aggregate'] }
      },
      links: [{ rel: 'self', href: 'https://data.example.org/firms/detections/collection.json' }]
    })
    const support = describeDataset(firms)
    expect(support.supported).toBe(true)
    expect(support.assets).toEqual([])
    expect(support.descriptor.source.kind).toBe('hive')
    // The aggregate asset must not have replaced the collection's own
    // columns, or the time filter would lose its column.
    expect(support.descriptor.table.timeColumn).toBe('acq_datetime')
  })
})

describe('fetchTargets', () => {
  it('reports the glob only when the glob is what gets fetched', () => {
    const glob = 's3://bucket/year=*/data.parquet'
    expect(fetchTargets({ kind: 'hive', glob, enumeration: { kind: 'declared' } })).toEqual([glob])
    expect(fetchTargets({ kind: 'hive', glob, enumeration: { kind: 'stac-items', collectionUrl: 'https://x/c.json' } }))
      .toEqual(['https://x/c.json'])
    expect(fetchTargets({ kind: 'hive', glob, enumeration: { kind: 'collection-mirror', url: 'https://x/items.parquet' } }))
      .toEqual(['https://x/items.parquet'])
    expect(fetchTargets({ kind: 'parquet', url: 'https://x/a.parquet' })).toEqual(['https://x/a.parquet'])
    expect(fetchTargets({ kind: 'parquet-set', urls: ['https://x/a.parquet', 'https://x/b.parquet'] })).toHaveLength(2)
    expect(fetchTargets(null)).toEqual([])
  })
})

describe('temporalExtent', () => {
  it('reads a collection\'s overall interval', () => {
    expect(temporalExtent(toPlainStacJson(benchmark()))).toEqual({
      start: '2021-01-01T00:00:00Z',
      end: '2021-12-31T23:59:59Z'
    })
  })

  it('reads an item\'s start and end', () => {
    expect(temporalExtent(toPlainStacJson(firmsItem()))).toEqual({
      start: '2020-01-01T00:00:00Z',
      end: '2020-12-31T23:58:00Z'
    })
  })

  it('reports no extent rather than an empty one', () => {
    expect(temporalExtent({ extent: { temporal: { interval: [[null, null]] } } })).toBeNull()
    expect(temporalExtent(null)).toBeNull()
  })

  it('treats a single datetime as both ends', () => {
    expect(temporalExtent({ properties: { datetime: '2024-05-01T00:00:00Z' } })).toEqual({
      start: '2024-05-01T00:00:00Z',
      end: '2024-05-01T00:00:00Z'
    })
  })
})

describe('defaultWindow', () => {
  const firmsExtent = { start: '2000-11-01T00:13:00Z', end: '2026-11-12T11:29:00Z' }
  const now = Date.parse('2026-11-12T20:00:00Z')

  it('offers the last 30 days of a 26-year archive', () => {
    expect(defaultWindow(firmsExtent, { now })).toEqual({ start: '2026-10-13', end: '2026-11-12' })
  })

  it('ends at the data, not at today', () => {
    const stale = { start: '2000-01-01T00:00:00Z', end: '2024-03-10T00:00:00Z' }
    expect(defaultWindow(stale, { now })).toEqual({ start: '2024-02-09', end: '2024-03-10' })
  })

  it('leaves a narrow extent whole', () => {
    // A benchmark collection covering one year *is* the dataset, not a
    // slice of a bigger one: a default window would silently drop eleven
    // months of what the user asked for by name.
    const oneYear = { start: '2021-01-01T00:00:00Z', end: '2021-12-31T23:59:59Z' }
    expect(defaultWindow(oneYear, { now })).toBeNull()
    expect(extentDays(oneYear)).toBeCloseTo(365, 0)
    expect(defaultWindow({ start: '2021-05-01T00:00:00Z', end: '2021-06-15T00:00:00Z' }, { now })).toBeNull()
  })

  it('treats an open-ended extent as the widest there is', () => {
    expect(extentDays({ start: '2000-01-01T00:00:00Z', end: null })).toBe(Infinity)
    expect(defaultWindow({ start: '2000-01-01T00:00:00Z', end: null }, { now })).toEqual({
      start: '2026-10-13',
      end: '2026-11-12'
    })
  })

  it('never starts before the data does', () => {
    const window = defaultWindow({ start: '2026-11-01T00:00:00Z', end: null }, { now, days: 365 })
    expect(window.start).toBe('2026-11-01')
  })

  it('has no window without an extent', () => {
    expect(defaultWindow(null)).toBeNull()
    expect(DEFAULT_WINDOW_DAYS).toBe(30)
  })
})

describe('toTimeFilter', () => {
  it('makes a half-open window that includes the whole end day', () => {
    expect(toTimeFilter({ start: '2025-08-01', end: '2025-08-31' })).toEqual({
      start: '2025-08-01T00:00:00Z',
      end: '2025-09-01T00:00:00Z',
      closed: '[)'
    })
  })

  it('takes one open end', () => {
    expect(toTimeFilter({ start: '2025-08-01', end: '' })).toEqual({
      start: '2025-08-01T00:00:00Z',
      closed: '[)'
    })
  })

  it('is not a filter with no bounds at all', () => {
    expect(toTimeFilter({ start: '', end: '' })).toBeNull()
    expect(toTimeFilter(undefined)).toBeNull()
  })

  it('spots an inside-out window', () => {
    expect(windowInverted({ start: '2025-09-01', end: '2025-08-01' })).toBe(true)
    expect(windowInverted({ start: '2025-08-01', end: '2025-09-01' })).toBe(false)
    expect(windowInverted({ start: '2025-08-01' })).toBe(false)
  })

  it('renders an ISO instant as a date input value', () => {
    expect(toDateInput('2020-12-31T23:58:00Z')).toBe('2020-12-31')
    expect(toDateInput(null)).toBe('')
    expect(toDateInput('not a date')).toBe('')
  })
})

describe('describeBounded (O12)', () => {
  it('says an exact number plainly', () => {
    const described = describeBounded({ min: 218, max: 218, estimate: 218, exact: true })
    expect(described).toEqual({ kind: 'exact', estimate: '218', min: '218', max: '218' })
  })

  it('hedges a modelled number', () => {
    expect(describeBounded({ min: 0, max: 100000, estimate: 36469, exact: false })).toMatchObject({
      kind: 'range',
      estimate: '36,469'
    })
  })

  it('leads with the range when the model has little to go on', () => {
    // The FIRMS case: a row cap of 100,000 and no selectivity information,
    // so the honest headline is "0 - 100,000", not "100,000".
    expect(describeBounded({ min: 0, max: 400000, estimate: 2000, exact: false })).toMatchObject({
      kind: 'wide',
      min: '0',
      max: '400,000'
    })
  })

  it('formats bytes when asked to', () => {
    expect(describeBounded({ min: 0, max: 1048576, estimate: 524288, exact: false }, formatBytes)).toMatchObject({
      max: '1.0 MB',
      estimate: '512.0 kB'
    })
  })

  it('collapses a range that rounds to one number', () => {
    expect(describeBounded({ min: 1, max: 1.4, estimate: 1.2, exact: false }).kind).toBe('exact')
  })

  it('says nothing about nothing', () => {
    expect(describeBounded(null)).toBeNull()
    expect(formatCount(undefined)).toBe('0')
    expect(formatBytes(0)).toBe('0 B')
  })
})

describe('pruneLines', () => {
  it('narrates each stage with its unit', () => {
    const lines = pruneLines({
      prune: [
        { stage: 'part-time', before: 27, after: 1, basis: 'time window overlaps part interval' },
        { stage: 'row-group-bbox', before: 582, after: 582, basis: 'no covering — full scan' }
      ]
    })
    expect(lines[0]).toMatchObject({ stage: 'part-time', unit: 'files', before: '27', after: '1', dropped: 26 })
    expect(lines[1]).toMatchObject({ unit: 'rowGroups', dropped: 0 })
  })

  it('has nothing to narrate without an estimate', () => {
    expect(pruneLines(null)).toEqual([])
  })
})

describe('the format registry the card offers from', () => {
  it('lists the two built-ins and the five optional packages, in offer order', () => {
    const ids = listFormats().map(entry => entry.id)
    expect(ids.slice(0, 7)).toEqual(FORMAT_ORDER)
  })

  it('gives every format a human label and a byte model', () => {
    for (const entry of listFormats()) {
      expect(entry.label).toBeTruthy()
      expect(entry.label).not.toBe('geojson') // core labels an eager plugin with its own id
      expect(typeof entry.estimateBytes).toBe('function')
      const bytes = entry.estimateBytes([{ name: 'a' }, { name: 'geometry' }], { min: 0, max: 100, estimate: 10 })
      expect(bytes.max).toBeGreaterThan(bytes.estimate)
    }
  })

  it('reports the plugin weight only for a format that has one and has not loaded it', () => {
    const byId = Object.fromEntries(listFormats().map(entry => [entry.id, entry]))
    // sql.js's wasm: the number a user should see before clicking.
    expect(pluginWeight(byId.gpkg)).toBeGreaterThan(100_000)
    expect(pluginWeight(byId.flatgeobuf)).toBeGreaterThan(1_000)
    // Nothing to fetch (built in, or pure JS that is already here).
    expect(pluginWeight(byId.geojson)).toBeNull()
    expect(pluginWeight(byId.shapefile)).toBeNull()
    expect(pluginWeight({ approxBytes: { estimate: 300 }, loadState: 'idle' })).toBeNull()
    expect(pluginWeight({ approxBytes: { estimate: 400_000 }, loadState: 'loaded' })).toBeNull()
  })

  it('listing never loads a plugin', () => {
    // The whole point of the lazy registry: a page that shows the card
    // must not fetch 340 KB of wasm to put a label on a button.
    expect(listFormats().find(entry => entry.id === 'gpkg').loadState).not.toBe('loaded')
  })

  it('gives the save dialog an extension it accepts', () => {
    // Shapefile's extension is `shp.zip`, and showSaveFilePicker rejects
    // an accept entry with two dots in it.
    expect(pickerExtension('shp.zip')).toBe('.zip')
    expect(pickerExtension('geojson')).toBe('.geojson')
    expect(pickerExtension(undefined)).toBe('.bin')
  })
})

describe('describeError', () => {
  it('maps a taxonomy code to its own sentence', () => {
    const described = describeError({ code: 'SINK_QUOTA_EXCEEDED', message: 'Too large to buffer', retryable: false })
    expect(described.key).toBe('widgets.areaDownload.errors.sinkQuotaExceeded')
  })

  it('keeps the thrown message when the code is not in the taxonomy', () => {
    expect(describeError({ code: 'WAT', message: 'boom' })).toMatchObject({ key: null, code: 'WAT', message: 'boom' })
    expect(describeError(new Error('plain'))).toMatchObject({ key: null, message: 'plain' })
  })

  it('camel-cases every code in the taxonomy', () => {
    expect(camelCode('AREA_INVALID_CRS')).toBe('areaInvalidCrs')
    expect(camelCode('NETWORK')).toBe('network')
    expect(ERROR_CODES.every(code => camelCode(code).length > 0)).toBe(true)
  })

  it('knows a cancellation from a failure', () => {
    expect(isCancellation({ code: 'CANCELLED' })).toBe(true)
    expect(isCancellation({ code: 'NETWORK' })).toBe(false)
  })
})
