import { test } from "uvu";
import * as assert from "uvu/assert";
import { isAzimuthBetween } from "../../src/mescellaneous/math";

test("isAzimuthBetween: should throw for 'value' value", () => {
  assert.throws(
    () => isAzimuthBetween(NaN, 0, Math.PI),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(Infinity, 0, Math.PI),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(-Infinity, 0, Math.PI),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(Number.MAX_SAFE_INTEGER + 1, 0, Math.PI),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => isAzimuthBetween(-Number.MAX_SAFE_INTEGER - 1, 0, Math.PI),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => isAzimuthBetween(-0.1, 0, Math.PI),
    /azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => isAzimuthBetween(Math.PI * 2 + 0.1, 0, Math.PI),
    /azimuth must be between 0 and 2π radians/,
  );
});

test("isAzimuthBetween: should throw for 'from' value", () => {
  assert.throws(
    () => isAzimuthBetween(0, NaN, Math.PI),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(0, Infinity, Math.PI),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(0, -Infinity, Math.PI),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(0, Number.MAX_SAFE_INTEGER + 1, Math.PI),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => isAzimuthBetween(0, -Number.MAX_SAFE_INTEGER - 1, Math.PI),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => isAzimuthBetween(0, -0.1, Math.PI),
    /azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => isAzimuthBetween(0, Math.PI * 2 + 0.1, Math.PI),
    /azimuth must be between 0 and 2π radians/,
  );
});

test("isAzimuthBetween: should throw for 'to' value", () => {
  assert.throws(
    () => isAzimuthBetween(0, 0, NaN),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(0, 0, Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(0, 0, -Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(0, 0, Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => isAzimuthBetween(0, 0, -Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => isAzimuthBetween(0, 0, -0.1),
    /azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => isAzimuthBetween(0, 0, Math.PI * 2 + 0.1),
    /azimuth must be between 0 and 2π radians/,
  );
});

test.run();
