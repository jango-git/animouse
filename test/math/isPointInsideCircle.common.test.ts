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

test.run();
