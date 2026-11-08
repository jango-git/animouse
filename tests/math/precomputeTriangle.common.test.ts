import { expect, test } from "vitest";
import { precomputeTriangle } from "../../src/miscellaneous/math";

test("precomputeTriangle: should validate a.x parameter", () => {
  expect(() => precomputeTriangle({ x: NaN, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: Infinity, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: -Infinity, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() =>
    precomputeTriangle({ x: Number.MAX_SAFE_INTEGER + 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    precomputeTriangle({ x: -Number.MAX_SAFE_INTEGER - 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/maximum safe integer/);
});

test("precomputeTriangle: should validate a.y parameter", () => {
  expect(() => precomputeTriangle({ x: 0, y: NaN }, { x: 0, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: 0, y: Infinity }, { x: 0, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: 0, y: -Infinity }, { x: 0, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() =>
    precomputeTriangle({ x: 0, y: Number.MAX_SAFE_INTEGER + 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    precomputeTriangle({ x: 0, y: -Number.MAX_SAFE_INTEGER - 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/maximum safe integer/);
});

test("precomputeTriangle: should validate b.x parameter", () => {
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: NaN, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: Infinity, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: -Infinity, y: 1 }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() =>
    precomputeTriangle({ x: 0, y: 0 }, { x: Number.MAX_SAFE_INTEGER + 1, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    precomputeTriangle({ x: 0, y: 0 }, { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 }, { x: 1, y: 1 }),
  ).toThrow(/maximum safe integer/);
});

test("precomputeTriangle: should validate b.y parameter", () => {
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: NaN }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: Infinity }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: -Infinity }, { x: 1, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() =>
    precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: Number.MAX_SAFE_INTEGER + 1 }, { x: 1, y: 1 }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 }, { x: 1, y: 1 }),
  ).toThrow(/maximum safe integer/);
});

test("precomputeTriangle: should validate c.x parameter", () => {
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: NaN, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: Infinity, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: -Infinity, y: 1 })).toThrow(
    /finite number/,
  );
  expect(() =>
    precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: Number.MAX_SAFE_INTEGER + 1, y: 1 }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 }),
  ).toThrow(/maximum safe integer/);
});

test("precomputeTriangle: should validate c.y parameter", () => {
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: NaN })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: Infinity })).toThrow(
    /finite number/,
  );
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: -Infinity })).toThrow(
    /finite number/,
  );
  expect(() =>
    precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: Number.MAX_SAFE_INTEGER + 1 }),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: -Number.MAX_SAFE_INTEGER - 1 }),
  ).toThrow(/maximum safe integer/);
});

test("precomputeTriangle: should throw for degenerate triangle", () => {
  // Test collinear points (all points on the same line)
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 })).toThrow(
    /Degenerate triangle detected/,
  );

  // Test duplicate points
  expect(() => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 })).toThrow(
    /Degenerate triangle detected/,
  );

  // Test another collinear case (vertical line)
  expect(() => precomputeTriangle({ x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 })).toThrow(
    /Degenerate triangle detected/,
  );
});
