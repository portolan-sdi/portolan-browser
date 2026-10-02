// How a COG is opened for the map, and why it is not opened by URL.
//
// `@developmentseed/geotiff` reads a tile and its mask through two separate
// `dataSource.fetch` calls (one per IFD chain), and deck asks for one tile at a
// time. GDAL's COG driver writes the mask tile immediately after the tile it
// masks (`MASK_INTERLEAVED_WITH_IMAGERY=YES`), 8 bytes past its end, and writes
// tiles in row-major order, so the bytes those calls ask for are contiguous in
// the file. Over HTTP each call is its own 206 range request, which doubles the
// request count for every masked COG and costs a full round trip each time.
//
// `coalescingDataSource` sits in front of the raw HTTP source, holds each read
// for one macrotask, merges the reads that landed close together into one range
// request, and slices the answer back out. Nothing is fetched that was not
// asked for, apart from the bytes inside a merged gap.
//
// A merged request serves several callers, each with its own `AbortSignal` from
// deck's tile. The merged read is cancelled only when every caller has
// abandoned it; a single caller that aborts gets its rejection at once while
// the others keep their bytes.

/** Merge two reads when the gap between them is at most this many bytes. */
const COALESCE_GAP = 16 * 1024;

/** Never let a merged read grow past this size. */
const COALESCE_MAX_SIZE = 4 * 1024 * 1024;

/** The delay used to collect reads before merging them. One macrotask. */
const COALESCE_DELAY = 0;

function abortError(reason) {
  if (reason != null) {return reason;}
  const err = new Error('The operation was aborted');
  err.name = 'AbortError';
  return err;
}

// One AbortSignal for a merged read: it aborts when every read in the group has
// aborted, never when only one of them has. Returns null when any read came
// without a signal, because that read cannot be cancelled.
function groupSignal(reads) {
  const signals = [];
  for (const read of reads) {
    if (!read.signal) {return null;}
    signals.push(read.signal);
  }
  if (signals.length === 0) {return null;}
  const controller = new AbortController();
  let live = signals.length;
  for (const signal of signals) {
    if (signal.aborted) {
      live -= 1;
      continue;
    }
    signal.addEventListener('abort', () => {
      live -= 1;
      if (live <= 0) {controller.abort(signal.reason);}
    }, { once: true });
  }
  if (live <= 0) {controller.abort(signals[0].reason);}
  return controller.signal;
}

/**
 * Wrap a `@chunkd` source so that reads issued close together in time and
 * close together in the file become one range request.
 *
 * @param source The source to read through. Only `fetch` is used.
 * @param options.gap Merge two reads when the gap between them is at most this
 *   many bytes. Defaults to 16 KiB.
 * @param options.maxSize Never let a merged read grow past this size.
 *   Defaults to 4 MiB.
 * @returns A source with the same `fetch` contract.
 */
export function coalescingDataSource(source, { gap = COALESCE_GAP, maxSize = COALESCE_MAX_SIZE } = {}) {
  let batch = null;

  // Group the collected reads by position, then issue one request per group.
  const flush = () => {
    const reads = batch;
    batch = null;
    reads.sort((a, b) => a.offset - b.offset);
    const groups = [];
    let group = null;
    for (const read of reads) {
      const end = read.offset + read.length;
      if (group && read.offset - group.end <= gap && end - group.offset <= maxSize) {
        group.end = Math.max(group.end, end);
        group.reads.push(read);
      }
      else {
        group = { offset: read.offset, end, reads: [read] };
        groups.push(group);
      }
    }
    for (const g of groups) {
      // A read whose own signal aborted before the flush never reaches the
      // network, and `groupSignal` leaves it out of the merged read's lifetime.
      for (const read of g.reads) {
        if (read.signal?.aborted) {read.reject(abortError(read.signal.reason));}
      }
      const live = g.reads.filter(read => !read.signal?.aborted);
      if (live.length === 0) {continue;}
      const signal = groupSignal(live);
      source.fetch(g.offset, g.end - g.offset, signal ? { signal } : undefined).then(
        (buffer) => {
          for (const read of live) {
            // A read that aborted while the merged request was in flight is
            // rejected, as a direct read of it would have been.
            if (read.signal?.aborted) {
              read.reject(abortError(read.signal.reason));
              continue;
            }
            const start = read.offset - g.offset;
            read.resolve(buffer.slice(start, start + read.length));
          }
        },
        (err) => {
          for (const read of live) {read.reject(err);}
        },
      );
    }
  };

  return {
    fetch(offset, length, options) {
      // A read from the end of the file, or one of unstated length, has no
      // position this can merge on, so it goes straight through.
      if (offset < 0 || typeof length !== 'number') {
        return source.fetch(offset, length, options);
      }
      if (!batch) {
        batch = [];
        setTimeout(flush, COALESCE_DELAY);
      }
      return new Promise((resolve, reject) => {
        batch.push({ offset, length, signal: options?.signal, resolve, reject });
      });
    },
  };
}

/**
 * Open a COG for the map: read its header by URL, then rebuild it over a
 * coalescing data source so tile and mask reads share a range request.
 *
 * @param GeoTIFF The `GeoTIFF` class from `@developmentseed/geotiff`.
 * @param url The COG to open.
 * @param options.signal Cancels the header reads.
 * @returns The opened `GeoTIFF`.
 */
export async function openCog(GeoTIFF, url, { signal } = {}) {
  const header = await GeoTIFF.fromUrl(url, { signal });
  // `fromTiff` reuses the initialised `Tiff`, so the header is not read again.
  // It only replaces the source that tile data is read through.
  return GeoTIFF.fromTiff(header.tiff, coalescingDataSource(header.dataSource), { signal });
}
