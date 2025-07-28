import { test } from "uvu";
import * as assert from "uvu/assert";
import { isPointInsideCircle } from "../../src/mescellaneous/math";

test("isPointInsideCircle: should validate center.x parameter", () => {
  assert.throws(
    () => isPointInsideCircle({ x: NaN, y: 0 }, 1, { x: 0, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () => isPointInsideCircle({ x: Infinity, y: 0 }, 1, { x: 0, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () => isPointInsideCircle({ x: -Infinity, y: 0 }, 1, { x: 0, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () =>
      isPointInsideCircle({ x: Number.MAX_SAFE_INTEGER + 1, y: 0 }, 1, {
        x: 0,
        y: 0,
      }),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      isPointInsideCircle({ x: -Number.MAX_SAFE_INTEGER - 1, y: 0 }, 1, {
        x: 0,
        y: 0,
      }),
    /maximum safe integer/,
  );
});

test("isPointInsideCircle: should validate center.y parameter", () => {
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: NaN }, 1, { x: 0, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: Infinity }, 1, { x: 0, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: -Infinity }, 1, { x: 0, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () =>
      isPointInsideCircle({ x: 0, y: Number.MAX_SAFE_INTEGER + 1 }, 1, {
        x: 0,
        y: 0,
      }),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      isPointInsideCircle({ x: 0, y: -Number.MAX_SAFE_INTEGER - 1 }, 1, {
        x: 0,
        y: 0,
      }),
    /maximum safe integer/,
  );
});

test("isPointInsideCircle: should validate radiusSquared parameter", () => {
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: 0 }, NaN, { x: 0, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: 0 }, Infinity, { x: 0, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: 0 }, -Infinity, { x: 0, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () =>
      isPointInsideCircle({ x: 0, y: 0 }, Number.MAX_SAFE_INTEGER + 1, {
        x: 0,
        y: 0,
      }),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      isPointInsideCircle({ x: 0, y: 0 }, -Number.MAX_SAFE_INTEGER - 1, {
        x: 0,
        y: 0,
      }),
    /maximum safe integer/,
  );

  assert.throws(
    () =>
      isPointInsideCircle({ x: 0, y: 0 }, 0, {
        x: 0,
        y: 0,
      }),
    /greater than or equal/,
  );

  assert.throws(
    () =>
      isPointInsideCircle({ x: 0, y: 0 }, -1, {
        x: 0,
        y: 0,
      }),
    /greater than or equal/,
  );
});

test("isPointInsideCircle: should validate point.x parameter", () => {
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: NaN, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: Infinity, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: -Infinity, y: 0 }),
    /finite number/,
  );
  assert.throws(
    () =>
      isPointInsideCircle({ x: 0, y: 0 }, 1, {
        x: Number.MAX_SAFE_INTEGER + 1,
        y: 0,
      }),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      isPointInsideCircle({ x: 0, y: 0 }, 1, {
        x: -Number.MAX_SAFE_INTEGER - 1,
        y: 0,
      }),
    /maximum safe integer/,
  );
});

test("isPointInsideCircle: should validate point.y parameter", () => {
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: 0, y: NaN }),
    /finite number/,
  );
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: 0, y: Infinity }),
    /finite number/,
  );
  assert.throws(
    () => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: 0, y: -Infinity }),
    /finite number/,
  );
  assert.throws(
    () =>
      isPointInsideCircle({ x: 0, y: 0 }, 1, {
        x: 0,
        y: Number.MAX_SAFE_INTEGER + 1,
      }),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      isPointInsideCircle({ x: 0, y: 0 }, 1, {
        x: 0,
        y: -Number.MAX_SAFE_INTEGER - 1,
      }),
    /maximum safe integer/,
  );
});

test("isPointInsideCircle: should return true for point inside circle", () => {
  const center = { x: 0, y: 0 };
  const radiusSquared = 4;
  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: 1, y: 1 }),
    true,
    "Point (1,1) should be inside circle with radius 2",
  );

  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: 0, y: 0 }),
    true,
    "Point at center should be inside circle",
  );
});

test("isPointInsideCircle: should return false for point outside circle", () => {
  const center = { x: 0, y: 0 };
  const radiusSquared = 4;
  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: 3, y: 0 }),
    false,
    "Point (3,0) should be outside circle with radius 2",
  );

  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: 2, y: 2 }),
    false,
    "Point (2,2) should be outside circle with radius 2",
  );
});

test("isPointInsideCircle: should handle points exactly on circle boundary", () => {
  const center = { x: 0, y: 0 };
  const radiusSquared = 1;
  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: 1, y: 0 }),
    false,
    "Point exactly on boundary should be outside due to EPSILON",
  );

  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: 0, y: 1 }),
    false,
    "Point exactly on boundary should be outside due to EPSILON",
  );
});

test("isPointInsideCircle: should work with non-origin centers", () => {
  const center = { x: 5, y: 3 };
  const radiusSquared = 4;
  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: 5.5, y: 3.5 }),
    true,
    "Point should be inside offset circle",
  );

  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: 8, y: 3 }),
    false,
    "Point should be outside offset circle",
  );
});

test("isPointInsideCircle: should work with negative coordinates", () => {
  const center = { x: -2, y: -1 };
  const radiusSquared = 2.25;
  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: -2.5, y: -1.5 }),
    true,
    "Point should be inside circle with negative center",
  );

  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: -0.5, y: -1 }),
    false,
    "Point should be outside circle with negative center",
  );
});

test("isPointInsideCircle: should work with decimal coordinates", () => {
  const center = { x: 0.1, y: 0.2 };
  const radiusSquared = 0.25;
  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: 0.2, y: 0.3 }),
    true,
    "Point should be inside circle with decimal coordinates",
  );

  assert.equal(
    isPointInsideCircle(center, radiusSquared, { x: 0.7, y: 0.2 }),
    false,
    "Point should be outside circle with decimal coordinates",
  );
});

test.run();
