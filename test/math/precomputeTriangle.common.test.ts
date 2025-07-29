import { test } from "uvu";
import * as assert from "uvu/assert";
import { precomputeTriangle } from "../../src/mescellaneous/math";

test("precomputeTriangle: should validate a.x parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: NaN, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: Infinity, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: -Infinity, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should validate a.y parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: 0, y: NaN }, { x: 0, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: 0, y: Infinity }, { x: 0, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: -Infinity },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should validate b.x parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: NaN, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: 0, y: 0 }, { x: Infinity, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: -Infinity, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should validate b.y parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: NaN }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: Infinity }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: -Infinity },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should validate c.x parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: NaN, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: Infinity, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -Infinity, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should validate c.y parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: NaN }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: Infinity }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: -Infinity },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: Number.MAX_SAFE_INTEGER + 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: -Number.MAX_SAFE_INTEGER - 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should throw for degenerate triangle", () => {
  // Test collinear points (all points on the same line)
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }),
    /Degenerate triangle detected/,
  );

  // Test duplicate points
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }),
    /Degenerate triangle detected/,
  );

  // Test another collinear case (vertical line)
  assert.throws(
    () => precomputeTriangle({ x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }),
    /Degenerate triangle detected/,
  );
});

test.run();
