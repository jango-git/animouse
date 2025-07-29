import { test } from "uvu";
import * as assert from "uvu/assert";
import { calculateDistanceToEdgeSquared } from "../../src/mescellaneous/math";

test("calculateDistanceToEdgeSquared: should validate 'edge[0].x' value", () => {
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: NaN, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: Infinity, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: -Infinity, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
        2,
      ),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
        2,
      ),
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceToEdgeSquared: should validate 'edge[0].y' value", () => {
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: NaN },
          { x: 0, y: 0 },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: Infinity },
          { x: 0, y: 0 },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: -Infinity },
          { x: 0, y: 0 },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
          { x: 0, y: 0 },
        ],
        1,
        2,
      ),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
          { x: 0, y: 0 },
        ],
        1,
        2,
      ),
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceToEdgeSquared: should validate 'edge[1].x' value", () => {
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: NaN, y: 0 },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: Infinity, y: 0 },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: -Infinity, y: 0 },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
        ],
        1,
        2,
      ),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
        ],
        1,
        2,
      ),
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceToEdgeSquared: should validate 'edge[1].y' value", () => {
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: NaN },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: Infinity },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: -Infinity },
        ],
        1,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        ],
        1,
        2,
      ),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        ],
        1,
        2,
      ),
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceToEdgeSquared: should validate 'x' value", () => {
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        NaN,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        Infinity,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        -Infinity,
        2,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        Number.MAX_SAFE_INTEGER + 1,
        2,
      ),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        -Number.MAX_SAFE_INTEGER - 1,
        2,
      ),
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceToEdgeSquared: should validate 'y' value", () => {
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
        NaN,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
        Infinity,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
        -Infinity,
      ),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
        Number.MAX_SAFE_INTEGER + 1,
      ),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
        -Number.MAX_SAFE_INTEGER - 1,
      ),
    /value exceeds maximum safe integer range/,
  );
});

test.run();
