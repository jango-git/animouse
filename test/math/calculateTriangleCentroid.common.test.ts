import { test } from "uvu";
import * as assert from "uvu/assert";
import { calculateTriangleCentroid } from "../../src/mescellaneous/math";

test("calculateTriangleCentroid: should validate a.x parameter", () => {
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: NaN, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: Infinity, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: -Infinity, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("calculateTriangleCentroid: should validate a.y parameter", () => {
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: NaN },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: Infinity },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: -Infinity },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("calculateTriangleCentroid: should validate b.x parameter", () => {
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: NaN, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: Infinity, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: -Infinity, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("calculateTriangleCentroid: should validate b.y parameter", () => {
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: NaN },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: Infinity },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: -Infinity },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("calculateTriangleCentroid: should validate c.x parameter", () => {
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: NaN, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: Infinity, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -Infinity, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("calculateTriangleCentroid: should validate c.y parameter", () => {
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: NaN },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: Infinity },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: -Infinity },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: Number.MAX_SAFE_INTEGER + 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateTriangleCentroid(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: -Number.MAX_SAFE_INTEGER - 1 },
      ),
    /maximum safe integer/,
  );
});

test.run();
