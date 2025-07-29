import { test } from "uvu";
import * as assert from "uvu/assert";
import { DelaunayTriangulator } from "../../src/mescellaneous/DelaunayTriangulator";

test("triangulate: ...", () => {
  assert.throws(
    () =>
      DelaunayTriangulator.triangulate([
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ]),
    /At least/,
  );
});

test("triangulate: ...", () => {
  assert.throws(
    () =>
      DelaunayTriangulator.triangulate([
        { x: 0, y: NaN },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ]),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      DelaunayTriangulator.triangulate([
        { x: 0, y: 0 },
        { x: 1, y: Infinity },
        { x: 0, y: 1 },
      ]),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      DelaunayTriangulator.triangulate([
        { x: 0, y: 0 },
        { x: 1, y: -Infinity },
        { x: 0, y: 1 },
      ]),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      DelaunayTriangulator.triangulate([
        { x: 0, y: 0 },
        { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
        { x: 0, y: 1 },
      ]),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () =>
      DelaunayTriangulator.triangulate([
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
      ]),
    /value exceeds maximum safe integer range/,
  );
});

test("triangulate: ...", () => {
  assert.throws(
    () =>
      DelaunayTriangulator.triangulate([
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 1 },
      ]),
    /Duplicate points/,
  );
});

test("triangulate: ...", () => {
  assert.throws(
    () =>
      DelaunayTriangulator.triangulate([
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ]),
    /collinear/,
  );
});

test.run();
