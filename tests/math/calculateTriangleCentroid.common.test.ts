import { expect, test } from "vitest";
import { calculateTriangleCentroid } from "../../src/miscellaneous/math";

test("calculateTriangleCentroid: should validate a.x parameter", () => {
  expect(() => calculateTriangleCentroid({ x: NaN, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() =>
    calculateTriangleCentroid({ x: Infinity, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid({ x: -Infinity, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid(
      { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateTriangleCentroid(
      { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateTriangleCentroid: should validate a.y parameter", () => {
  expect(() => calculateTriangleCentroid({ x: 0, y: NaN }, { x: 0, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() =>
    calculateTriangleCentroid({ x: 0, y: Infinity }, { x: 0, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid({ x: 0, y: -Infinity }, { x: 0, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid(
      { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateTriangleCentroid(
      { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateTriangleCentroid: should validate b.x parameter", () => {
  expect(() => calculateTriangleCentroid({ x: 0, y: 0 }, { x: NaN, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() =>
    calculateTriangleCentroid({ x: 0, y: 0 }, { x: Infinity, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid({ x: 0, y: 0 }, { x: -Infinity, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid(
      { x: 0, y: 0 },
      { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
      { x: 1, y: 1 },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateTriangleCentroid(
      { x: 0, y: 0 },
      { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
      { x: 1, y: 1 },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateTriangleCentroid: should validate b.y parameter", () => {
  expect(() => calculateTriangleCentroid({ x: 0, y: 0 }, { x: 0, y: NaN }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() =>
    calculateTriangleCentroid({ x: 0, y: 0 }, { x: 0, y: Infinity }, { x: 1, y: 1 }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid({ x: 0, y: 0 }, { x: 0, y: -Infinity }, { x: 1, y: 1 }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid(
      { x: 0, y: 0 },
      { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
      { x: 1, y: 1 },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateTriangleCentroid(
      { x: 0, y: 0 },
      { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
      { x: 1, y: 1 },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateTriangleCentroid: should validate c.x parameter", () => {
  expect(() => calculateTriangleCentroid({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: NaN, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() =>
    calculateTriangleCentroid({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: Infinity, y: 1 }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: -Infinity, y: 1 }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid(
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateTriangleCentroid(
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateTriangleCentroid: should validate c.y parameter", () => {
  expect(() => calculateTriangleCentroid({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: NaN })).toThrow(
    /finite number/,
  );
  expect(() =>
    calculateTriangleCentroid({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: Infinity }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: -Infinity }),
  ).toThrow(/finite number/);
  expect(() =>
    calculateTriangleCentroid(
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: Number.MAX_SAFE_INTEGER + 1 },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateTriangleCentroid(
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: -Number.MAX_SAFE_INTEGER - 1 },
    ),
  ).toThrow(/maximum safe integer/);
});
