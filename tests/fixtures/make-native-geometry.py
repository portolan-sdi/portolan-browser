#!/usr/bin/env python3
"""Write tests/fixtures/native-geometry.parquet.

The fixture is a Parquet file whose geometry column uses the *native* Parquet
GEOMETRY logical type instead of a GeoParquet `geo` key.
Portolan v0.3 accepts such a file as vector data, so the browser must detect
the geometry column from the schema alone.

Fixture properties the browser tests depend on:

- the geometry column is called `shape`, so the `geometry`/`geom` name
  fallback in `src/utils/parquet.js` cannot find it;
- the file carries no `geo` key (and no `ARROW:schema` key either, because
  `store_schema=False`), so the GeoParquet path cannot find it;
- the GEOMETRY logical type carries an empty `crs`, which per the Parquet
  specification means OGC:CRS84 (lon/lat);
- three rows with tiny geometries, so the file stays about 1 kB.

Tooling that produced the committed fixture (2026-11-21):

    pyarrow         24.0.0   (writes the GEOMETRY logical type)
    geoarrow-pyarrow 0.3.0   (provides the geoarrow.wkb extension type that
                              Arrow C++ maps to that logical type)

Run from the repository root:

    python3 tests/fixtures/make-native-geometry.py
"""

from pathlib import Path

import geoarrow.pyarrow as ga
import pyarrow as pa
import pyarrow.parquet as pq

OUT = Path(__file__).with_name("native-geometry.parquet")

WKT = [
    "POINT (10 20)",
    "POINT (11 21)",
    "POLYGON ((10 20, 11 20, 11 21, 10 20))",
]


def main() -> None:
    shape = ga.as_wkb(pa.array(WKT, ga.wkt()))
    table = pa.table(
        {
            "id": pa.array([1, 2, 3], pa.int32()),
            "name": pa.array(["one", "two", "three"], pa.string()),
            "shape": shape,
        }
    )
    # store_schema=False drops the ARROW:schema key, so the only geometry
    # signal left in the file is the GEOMETRY logical type itself.
    pq.write_table(table, OUT, store_schema=False)

    # Verify what was written, so a regenerated fixture cannot silently lose
    # the logical type or gain a `geo` key.
    md = pq.read_metadata(OUT)
    keys = sorted(k.decode() for k in (md.metadata or {}))
    column = md.schema.column(2)
    print(f"{OUT.name}: {md.num_rows} rows, {OUT.stat().st_size} bytes")
    print(f"key_value_metadata keys: {keys}")
    print(f"column {column.name!r}: {column.logical_type} {column.physical_type}")
    assert "geo" not in keys, keys
    assert column.name == "shape"
    assert str(column.logical_type).startswith("Geometry"), column.logical_type


if __name__ == "__main__":
    main()
