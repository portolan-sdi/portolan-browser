import { describe, expect, it } from 'vitest';
import { limitConcurrency, MAX_CONCURRENT_RANGES } from '../../src/utils/parquet';

// A fake AsyncBuffer over bytes 0..n-1 (byte i holds i % 256) whose slices
// resolve only when released, recording each fetch and how many are in
// flight at once.
function fakeFile(n = 100000) {
  const pending = [];
  const fetches = [];
  const state = { active: 0, peak: 0 };
  const file = {
    byteLength: n,
    slice(start, end) {
      fetches.push([start, end]);
      state.active++;
      state.peak = Math.max(state.peak, state.active);
      return new Promise(resolve => {
        pending.push(() => {
          state.active--;
          resolve(Uint8Array.from({ length: end - start }, (_, i) => (start + i) % 256).buffer);
        });
      });
    },
  };
  return { file, pending, fetches, state };
}

const tick = () => new Promise(resolve => {
  setTimeout(resolve, 0);
});

// Release the pending fetches one by one, letting the limiter start the next.
async function drain(pending) {
  await tick();
  if (pending.length === 0) {return;}
  pending.shift()();
  await drain(pending);
}

describe('limitConcurrency', () => {
  it('keeps at most `max` fetches in flight and resolves every slice', async () => {
    const { file, pending, state } = fakeFile();
    const limited = limitConcurrency(file, { max: 3, gap: 0 });
    expect(limited.byteLength).toBe(100000);
    // 10 ranges 1,000 bytes apart: too far apart to merge.
    const reads = Array.from({ length: 10 }, (_, i) => limited.slice(i * 1000, i * 1000 + 10));
    await tick();
    expect(state.active).toBe(3);
    await drain(pending);
    const buffers = await Promise.all(reads);
    expect(buffers.map(b => new Uint8Array(b)[0])).toEqual(
      Array.from({ length: 10 }, (_, i) => (i * 1000) % 256));
    expect(state.peak).toBe(3);
  });

  it('merges ranges that follow each other and hands back the right bytes', async () => {
    const { file, pending, fetches } = fakeFile();
    const limited = limitConcurrency(file, { max: 2, gap: 100 });
    // 0-30 contiguous, 120-130 within the 100-byte gap of 30, 5000-5010 far off.
    const ranges = [[0, 10], [10, 20], [20, 30], [120, 130], [5000, 5010]];
    const reads = ranges.map(([s, e]) => limited.slice(s, e));
    await drain(pending);
    const buffers = await Promise.all(reads);
    expect(fetches).toEqual([[0, 130], [5000, 5010]]);
    buffers.forEach((b, i) => {
      const [s, e] = ranges[i];
      expect(b.byteLength).toBe(e - s);
      expect(new Uint8Array(b)[0]).toBe(s % 256);
    });
  });

  it('caps a merged fetch at maxMerged', async () => {
    const { file, pending, fetches } = fakeFile();
    const limited = limitConcurrency(file, { max: 4, gap: 0, maxMerged: 25 });
    const reads = [[0, 10], [10, 20], [20, 30], [30, 40]].map(([s, e]) => limited.slice(s, e));
    await drain(pending);
    await Promise.all(reads);
    expect(fetches).toEqual([[0, 20], [20, 40]]);
  });

  it('rejects every slice of a failed fetch and frees its slot', async () => {
    let calls = 0;
    const file = {
      byteLength: 100,
      slice(start, end) {
        calls++;
        return calls === 1 ? Promise.reject(new Error('503')) : Promise.resolve(new ArrayBuffer(end - start));
      },
    };
    const limited = limitConcurrency(file, { max: 1 });
    const a = limited.slice(0, 1);
    const b = limited.slice(1, 2);
    await expect(a).rejects.toThrow('503');
    await expect(b).rejects.toThrow('503');
    await expect(limited.slice(50, 60)).resolves.toBeInstanceOf(ArrayBuffer);
  });

  it('defaults to MAX_CONCURRENT_RANGES', () => {
    expect(MAX_CONCURRENT_RANGES).toBe(16);
  });
});
