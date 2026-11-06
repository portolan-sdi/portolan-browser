import { describe, it, expect } from 'vitest';
import proj4 from 'proj4';
import { allowWebMercatorOverflow } from '../../src/utils/cogProjection.js';

const WORLD_X = 20037508.342789244;

// The west edge of the World Bank fwi-rp2 grid (issue #78).
const WEST_EDGE = -180.3125;

describe('allowWebMercatorOverflow', () => {
  it('keeps a longitude west of -180 on the west side', () => {
    const before = proj4('EPSG:4326', 'EPSG:3857').forward([WEST_EDGE, 10], false);
    // The built-in definition wraps the west edge to the east edge.
    expect(before[0]).toBeGreaterThan(WORLD_X - 50000);

    allowWebMercatorOverflow();

    const [x, y] = proj4('EPSG:4326', 'EPSG:3857').forward([WEST_EDGE, 10], false);
    expect(x).toBeLessThan(-WORLD_X);
    expect(x).toBeCloseTo(-WORLD_X - (0.3125 / 180) * WORLD_X, 0);
    expect(y).toBeCloseTo(before[1], 6);
  });

  it('does not change positions inside the world', () => {
    allowWebMercatorOverflow();
    const c = proj4('EPSG:4326', 'EPSG:3857');
    expect(c.forward([-180, 0], false)[0]).toBeCloseTo(-WORLD_X, 3);
    const [x, y] = c.forward([13.4, 52.5], false);
    expect(x).toBeCloseTo((13.4 / 180) * WORLD_X, 3);
    const [lon, lat] = c.inverse([x, y], false);
    expect(lon).toBeCloseTo(13.4, 9);
    expect(lat).toBeCloseTo(52.5, 9);
  });

  it('inverts an x west of the world to a longitude west of -180', () => {
    allowWebMercatorOverflow();
    const c = proj4('EPSG:4326', 'EPSG:3857');
    const [x, y] = c.forward([WEST_EDGE, -40], false);
    const [lon, lat] = c.inverse([x, y], false);
    expect(lon).toBeCloseTo(WEST_EDGE, 9);
    expect(lat).toBeCloseTo(-40, 9);
  });

  it('is idempotent and leaves the aliases alone', () => {
    allowWebMercatorOverflow();
    const def = proj4.defs('EPSG:3857');
    allowWebMercatorOverflow();
    expect(proj4.defs('EPSG:3857')).toBe(def);
    expect(proj4.defs('EPSG:900913').over).toBeFalsy();
  });
});
