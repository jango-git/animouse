import { expect, test } from "vitest";
import { calculateDistanceSquared } from "../../src/miscellaneous/math";

test("calculateDistanceSquared: should validate 'x1' value", () => {
  expect(() => calculateDistanceSquared(NaN, 1, 2, 3)).toThrow(/value must be a finite number/);
  expect(() => calculateDistanceSquared(Infinity, 1, 2, 3)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateDistanceSquared(-Infinity, 1, 2, 3)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateDistanceSquared(Number.MAX_SAFE_INTEGER + 1, 1, 2, 3)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => calculateDistanceSquared(-Number.MAX_SAFE_INTEGER - 1, 1, 2, 3)).toThrow(
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceSquared: should validate 'y1' value", () => {
  expect(() => calculateDistanceSquared(1, NaN, 2, 3)).toThrow(/value must be a finite number/);
  expect(() => calculateDistanceSquared(1, Infinity, 2, 3)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateDistanceSquared(1, -Infinity, 2, 3)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateDistanceSquared(1, Number.MAX_SAFE_INTEGER + 1, 2, 3)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => calculateDistanceSquared(1, -Number.MAX_SAFE_INTEGER - 1, 2, 3)).toThrow(
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceSquared: should validate 'x2' value", () => {
  expect(() => calculateDistanceSquared(1, 2, NaN, 3)).toThrow(/value must be a finite number/);
  expect(() => calculateDistanceSquared(1, 2, Infinity, 3)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateDistanceSquared(1, 2, -Infinity, 3)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateDistanceSquared(1, 2, Number.MAX_SAFE_INTEGER + 1, 3)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => calculateDistanceSquared(1, 2, -Number.MAX_SAFE_INTEGER - 1, 3)).toThrow(
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceSquared: should validate 'y2' value", () => {
  expect(() => calculateDistanceSquared(1, 2, 3, NaN)).toThrow(/value must be a finite number/);
  expect(() => calculateDistanceSquared(1, 2, 3, Infinity)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateDistanceSquared(1, 2, 3, -Infinity)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateDistanceSquared(1, 2, 3, Number.MAX_SAFE_INTEGER + 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => calculateDistanceSquared(1, 2, 3, -Number.MAX_SAFE_INTEGER - 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
});
