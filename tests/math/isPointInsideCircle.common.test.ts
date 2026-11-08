import { expect, test } from "vitest";
import { isPointInsideCircle } from "../../src/miscellaneous/math";

test("isPointInsideCircle: should validate center.x parameter", () => {
  expect(() => isPointInsideCircle({ x: NaN, y: 0 }, 1, { x: 0, y: 0 })).toThrow(/finite number/);
  expect(() => isPointInsideCircle({ x: Infinity, y: 0 }, 1, { x: 0, y: 0 })).toThrow(
    /finite number/,
  );
  expect(() => isPointInsideCircle({ x: -Infinity, y: 0 }, 1, { x: 0, y: 0 })).toThrow(
    /finite number/,
  );
  expect(() =>
    isPointInsideCircle({ x: Number.MAX_SAFE_INTEGER + 1, y: 0 }, 1, {
      x: 0,
      y: 0,
    }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    isPointInsideCircle({ x: -Number.MAX_SAFE_INTEGER - 1, y: 0 }, 1, {
      x: 0,
      y: 0,
    }),
  ).toThrow(/maximum safe integer/);
});

test("isPointInsideCircle: should validate center.y parameter", () => {
  expect(() => isPointInsideCircle({ x: 0, y: NaN }, 1, { x: 0, y: 0 })).toThrow(/finite number/);
  expect(() => isPointInsideCircle({ x: 0, y: Infinity }, 1, { x: 0, y: 0 })).toThrow(
    /finite number/,
  );
  expect(() => isPointInsideCircle({ x: 0, y: -Infinity }, 1, { x: 0, y: 0 })).toThrow(
    /finite number/,
  );
  expect(() =>
    isPointInsideCircle({ x: 0, y: Number.MAX_SAFE_INTEGER + 1 }, 1, {
      x: 0,
      y: 0,
    }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    isPointInsideCircle({ x: 0, y: -Number.MAX_SAFE_INTEGER - 1 }, 1, {
      x: 0,
      y: 0,
    }),
  ).toThrow(/maximum safe integer/);
});

test("isPointInsideCircle: should validate radiusSquared parameter", () => {
  expect(() => isPointInsideCircle({ x: 0, y: 0 }, NaN, { x: 0, y: 0 })).toThrow(/finite number/);
  expect(() => isPointInsideCircle({ x: 0, y: 0 }, Infinity, { x: 0, y: 0 })).toThrow(
    /finite number/,
  );
  expect(() => isPointInsideCircle({ x: 0, y: 0 }, -Infinity, { x: 0, y: 0 })).toThrow(
    /finite number/,
  );
  expect(() =>
    isPointInsideCircle({ x: 0, y: 0 }, Number.MAX_SAFE_INTEGER + 1, {
      x: 0,
      y: 0,
    }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    isPointInsideCircle({ x: 0, y: 0 }, -Number.MAX_SAFE_INTEGER - 1, {
      x: 0,
      y: 0,
    }),
  ).toThrow(/maximum safe integer/);

  expect(() =>
    isPointInsideCircle({ x: 0, y: 0 }, 0, {
      x: 0,
      y: 0,
    }),
  ).toThrow(/greater than or equal/);

  expect(() =>
    isPointInsideCircle({ x: 0, y: 0 }, -1, {
      x: 0,
      y: 0,
    }),
  ).toThrow(/greater than or equal/);
});

test("isPointInsideCircle: should validate point.x parameter", () => {
  expect(() => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: NaN, y: 0 })).toThrow(/finite number/);
  expect(() => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: Infinity, y: 0 })).toThrow(
    /finite number/,
  );
  expect(() => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: -Infinity, y: 0 })).toThrow(
    /finite number/,
  );
  expect(() =>
    isPointInsideCircle({ x: 0, y: 0 }, 1, {
      x: Number.MAX_SAFE_INTEGER + 1,
      y: 0,
    }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    isPointInsideCircle({ x: 0, y: 0 }, 1, {
      x: -Number.MAX_SAFE_INTEGER - 1,
      y: 0,
    }),
  ).toThrow(/maximum safe integer/);
});

test("isPointInsideCircle: should validate point.y parameter", () => {
  expect(() => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: 0, y: NaN })).toThrow(/finite number/);
  expect(() => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: 0, y: Infinity })).toThrow(
    /finite number/,
  );
  expect(() => isPointInsideCircle({ x: 0, y: 0 }, 1, { x: 0, y: -Infinity })).toThrow(
    /finite number/,
  );
  expect(() =>
    isPointInsideCircle({ x: 0, y: 0 }, 1, {
      x: 0,
      y: Number.MAX_SAFE_INTEGER + 1,
    }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    isPointInsideCircle({ x: 0, y: 0 }, 1, {
      x: 0,
      y: -Number.MAX_SAFE_INTEGER - 1,
    }),
  ).toThrow(/maximum safe integer/);
});
