import { test } from "uvu";
import * as assert from "uvu/assert";
import {
  assertValidAzimuth,
  assertValidNumber,
  assertValidPositiveNumber,
  assertValidUnitRange,
} from "../src/mescellaneous/assertions";
import { PI2 } from "../src/mescellaneous/miscellaneous";

test("constants: should have PI2 equal to 2π", () => {
  assert.equal(PI2, Math.PI * 2);
});

// assertValidNumber tests
test("assertValidNumber: should not throw for valid finite numbers", () => {
  assert.not.throws(() => assertValidNumber(0, "test"));
  assert.not.throws(() => assertValidNumber(123.456, "test"));
  assert.not.throws(() => assertValidNumber(-789, "test"));
  assert.not.throws(() => assertValidNumber(Number.MAX_SAFE_INTEGER, "test"));
  assert.not.throws(() => assertValidNumber(-Number.MAX_SAFE_INTEGER, "test"));
});

test("assertValidNumber: should throw for non-finite values with correct message", () => {
  assert.throws(
    () => assertValidNumber(NaN, "test"),
    /test: Value must be a finite number/,
  );
  assert.throws(
    () => assertValidNumber(Infinity, "test"),
    /test: Value must be a finite number/,
  );
  assert.throws(
    () => assertValidNumber(-Infinity, "test"),
    /test: Value must be a finite number/,
  );
});

test("assertValidNumber: should throw for values exceeding safe integer range", () => {
  assert.throws(
    () => assertValidNumber(Number.MAX_SAFE_INTEGER + 1, "test"),
    /test: Value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => assertValidNumber(-Number.MAX_SAFE_INTEGER - 1, "test"),
    /test: Value exceeds maximum safe integer range/,
  );
});

// assertValidAzimuth tests
test("assertValidAzimuth: should not throw for valid azimuth values", () => {
  assert.not.throws(() => assertValidAzimuth(0, "test"));
  assert.not.throws(() => assertValidAzimuth(Math.PI, "test"));
  assert.not.throws(() => assertValidAzimuth(PI2, "test"));
  assert.not.throws(() => assertValidAzimuth(Math.PI / 2, "test"));
  assert.not.throws(() => assertValidAzimuth((3 * Math.PI) / 2, "test"));
});

test("assertValidAzimuth: should throw for azimuth values outside [0, 2π] range", () => {
  assert.throws(
    () => assertValidAzimuth(-0.1, "test"),
    /test: Azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => assertValidAzimuth(PI2 + 0.1, "test"),
    /test: Azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => assertValidAzimuth(-Math.PI, "test"),
    /test: Azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => assertValidAzimuth(3 * Math.PI, "test"),
    /test: Azimuth must be between 0 and 2π radians/,
  );
});

test("assertValidAzimuth: should throw for non-finite azimuth values", () => {
  assert.throws(
    () => assertValidAzimuth(NaN, "test"),
    /test: Value must be a finite number/,
  );
  assert.throws(
    () => assertValidAzimuth(Infinity, "test"),
    /test: Value must be a finite number/,
  );
  assert.throws(
    () => assertValidAzimuth(-Infinity, "test"),
    /test: Value must be a finite number/,
  );
});

// assertValidUnitRange tests
test("assertValidUnitRange: should not throw for valid unit range values", () => {
  assert.not.throws(() => assertValidUnitRange(0, "test"));
  assert.not.throws(() => assertValidUnitRange(0.5, "test"));
  assert.not.throws(() => assertValidUnitRange(1, "test"));
  assert.not.throws(() => assertValidUnitRange(0.25, "test"));
  assert.not.throws(() => assertValidUnitRange(0.75, "test"));
});

test("assertValidUnitRange: should throw for values outside [0, 1] range", () => {
  assert.throws(
    () => assertValidUnitRange(-0.1, "test"),
    /test: Value must be between 0 and 1/,
  );
  assert.throws(
    () => assertValidUnitRange(1.1, "test"),
    /test: Value must be between 0 and 1/,
  );
  assert.throws(
    () => assertValidUnitRange(-1, "test"),
    /test: Value must be between 0 and 1/,
  );
  assert.throws(
    () => assertValidUnitRange(2, "test"),
    /test: Value must be between 0 and 1/,
  );
});

test("assertValidUnitRange: should throw for non-finite values with correct message", () => {
  assert.throws(
    () => assertValidUnitRange(NaN, "test"),
    /test: Value must be a finite number/,
  );
  assert.throws(
    () => assertValidUnitRange(Infinity, "test"),
    /test: Value must be a finite number/,
  );
  assert.throws(
    () => assertValidUnitRange(-Infinity, "test"),
    /test: Value must be a finite number/,
  );
});

test("assertValidUnitRange: should throw for values exceeding safe integer range", () => {
  assert.throws(
    () => assertValidUnitRange(Number.MAX_SAFE_INTEGER + 1, "test"),
    /test: Value exceeds maximum safe integer range/,
  );
});

// assertValidPositiveNumber tests
test("assertValidPositiveNumber: should not throw for positive values", () => {
  assert.not.throws(() => assertValidPositiveNumber(0.1, "test"));
  assert.not.throws(() => assertValidPositiveNumber(1, "test"));
  assert.not.throws(() => assertValidPositiveNumber(123.456, "test"));
  assert.not.throws(() => assertValidPositiveNumber(1000, "test"));
  assert.not.throws(() =>
    assertValidPositiveNumber(Number.MAX_SAFE_INTEGER, "test"),
  );
});

test("assertValidPositiveNumber: should throw for non-positive values", () => {
  assert.throws(
    () => assertValidPositiveNumber(0, "test"),
    /test: Value must be greater than 0/,
  );
  assert.throws(
    () => assertValidPositiveNumber(-0.1, "test"),
    /test: Value must be greater than 0/,
  );
  assert.throws(
    () => assertValidPositiveNumber(-1, "test"),
    /test: Value must be greater than 0/,
  );
  assert.throws(
    () => assertValidPositiveNumber(-100, "test"),
    /test: Value must be greater than 0/,
  );
});

test("assertValidPositiveNumber: should throw for non-finite values with correct message", () => {
  assert.throws(
    () => assertValidPositiveNumber(NaN, "test"),
    /test: Value must be a finite number/,
  );
  assert.throws(
    () => assertValidPositiveNumber(Infinity, "test"),
    /test: Value must be a finite number/,
  );
  assert.throws(
    () => assertValidPositiveNumber(-Infinity, "test"),
    /test: Value must be a finite number/,
  );
});

test("assertValidPositiveNumber: should throw for values exceeding safe integer range", () => {
  assert.throws(
    () => assertValidPositiveNumber(Number.MAX_SAFE_INTEGER + 1, "test"),
    /test: Value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => assertValidPositiveNumber(-Number.MAX_SAFE_INTEGER - 1, "test"),
    /test: Value exceeds maximum safe integer range/,
  );
});

test.run();
