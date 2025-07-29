import { test } from "uvu";
import * as assert from "uvu/assert";
import { calculateDistanceSquared } from "../../src/mescellaneous/math";

test("calculateDistanceSquared: should validate 'x1' value", () => {
  assert.throws(
    () => calculateDistanceSquared(NaN, 1, 2, 3),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(Infinity, 1, 2, 3),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(-Infinity, 1, 2, 3),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(Number.MAX_SAFE_INTEGER + 1, 1, 2, 3),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => calculateDistanceSquared(-Number.MAX_SAFE_INTEGER - 1, 1, 2, 3),
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceSquared: should validate 'y1' value", () => {
  assert.throws(
    () => calculateDistanceSquared(1, NaN, 2, 3),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, Infinity, 2, 3),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, -Infinity, 2, 3),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, Number.MAX_SAFE_INTEGER + 1, 2, 3),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, -Number.MAX_SAFE_INTEGER - 1, 2, 3),
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceSquared: should validate 'x2' value", () => {
  assert.throws(
    () => calculateDistanceSquared(1, 2, NaN, 3),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, 2, Infinity, 3),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, 2, -Infinity, 3),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, 2, Number.MAX_SAFE_INTEGER + 1, 3),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, 2, -Number.MAX_SAFE_INTEGER - 1, 3),
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceSquared: should validate 'y2' value", () => {
  assert.throws(
    () => calculateDistanceSquared(1, 2, 3, NaN),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, 2, 3, Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, 2, 3, -Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, 2, 3, Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => calculateDistanceSquared(1, 2, 3, -Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
});

test.run();
