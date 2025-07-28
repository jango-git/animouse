import { test } from "uvu";
import * as assert from "uvu/assert";
import {
  assertValidAzimuth,
  assertValidNonNegativeNumber,
  assertValidNumber,
  assertValidPositiveNumber,
  assertValidUnitRange,
  EPSILON,
} from "../src/mescellaneous/assertions";

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
    /test: value must be a finite number/,
  );
  assert.throws(
    () => assertValidNumber(Infinity, "test"),
    /test: value must be a finite number/,
  );
  assert.throws(
    () => assertValidNumber(-Infinity, "test"),
    /test: value must be a finite number/,
  );
});

test("assertValidNumber: should throw for values exceeding safe integer range", () => {
  assert.throws(
    () => assertValidNumber(Number.MAX_SAFE_INTEGER + 1, "test"),
    /test: value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => assertValidNumber(-Number.MAX_SAFE_INTEGER - 1, "test"),
    /test: value exceeds maximum safe integer range/,
  );
});

test("assertValidAzimuth: should not throw for valid azimuth values", () => {
  assert.not.throws(() => assertValidAzimuth(0, "test"));
  assert.not.throws(() => assertValidAzimuth(Math.PI, "test"));
  assert.not.throws(() => assertValidAzimuth(Math.PI * 2, "test"));
  assert.not.throws(() => assertValidAzimuth(Math.PI / 2, "test"));
  assert.not.throws(() => assertValidAzimuth((3 * Math.PI) / 2, "test"));
});

test("assertValidAzimuth: should throw for azimuth values outside [0, 2π] range", () => {
  assert.throws(
    () => assertValidAzimuth(-0.1, "test"),
    /test: azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => assertValidAzimuth(Math.PI * 2 + 0.1, "test"),
    /test: azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => assertValidAzimuth(-Math.PI, "test"),
    /test: azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => assertValidAzimuth(3 * Math.PI, "test"),
    /test: azimuth must be between 0 and 2π radians/,
  );
});

test("assertValidAzimuth: should throw for non-finite azimuth values", () => {
  assert.throws(
    () => assertValidAzimuth(NaN, "test"),
    /test: value must be a finite number/,
  );
  assert.throws(
    () => assertValidAzimuth(Infinity, "test"),
    /test: value must be a finite number/,
  );
  assert.throws(
    () => assertValidAzimuth(-Infinity, "test"),
    /test: value must be a finite number/,
  );
});

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
    /test: value must be between 0 and 1/,
  );
  assert.throws(
    () => assertValidUnitRange(1.1, "test"),
    /test: value must be between 0 and 1/,
  );
  assert.throws(
    () => assertValidUnitRange(-1, "test"),
    /test: value must be between 0 and 1/,
  );
  assert.throws(
    () => assertValidUnitRange(2, "test"),
    /test: value must be between 0 and 1/,
  );
});

test("assertValidUnitRange: should throw for non-finite values with correct message", () => {
  assert.throws(
    () => assertValidUnitRange(NaN, "test"),
    /test: value must be a finite number/,
  );
  assert.throws(
    () => assertValidUnitRange(Infinity, "test"),
    /test: value must be a finite number/,
  );
  assert.throws(
    () => assertValidUnitRange(-Infinity, "test"),
    /test: value must be a finite number/,
  );
});

test("assertValidUnitRange: should throw for values exceeding safe integer range", () => {
  assert.throws(
    () => assertValidUnitRange(Number.MAX_SAFE_INTEGER + 1, "test"),
    /test: value exceeds maximum safe integer range/,
  );
});

test("assertValidPositiveNumber: should not throw for positive values", () => {
  assert.not.throws(() => assertValidPositiveNumber(0.1, "test"));
  assert.not.throws(() => assertValidPositiveNumber(1, "test"));
  assert.not.throws(() => assertValidPositiveNumber(123.456, "test"));
  assert.not.throws(() => assertValidPositiveNumber(1000, "test"));
  assert.not.throws(() => assertValidPositiveNumber(EPSILON, "test"));
  assert.not.throws(() =>
    assertValidPositiveNumber(Number.MAX_SAFE_INTEGER, "test"),
  );
});

test("assertValidPositiveNumber: should throw for non-positive values", () => {
  assert.throws(
    () => assertValidPositiveNumber(0, "test"),
    /test: value must be greater than or equal to/,
  );
  assert.throws(
    () => assertValidPositiveNumber(-0.1, "test"),
    /test: value must be greater than or equal to/,
  );
  assert.throws(
    () => assertValidPositiveNumber(-1, "test"),
    /test: value must be greater than or equal to/,
  );
  assert.throws(
    () => assertValidPositiveNumber(-100, "test"),
    /test: value must be greater than or equal to/,
  );
});

test("assertValidPositiveNumber: should throw for non-finite values with correct message", () => {
  assert.throws(
    () => assertValidPositiveNumber(NaN, "test"),
    /test: value must be a finite number/,
  );
  assert.throws(
    () => assertValidPositiveNumber(Infinity, "test"),
    /test: value must be a finite number/,
  );
  assert.throws(
    () => assertValidPositiveNumber(-Infinity, "test"),
    /test: value must be a finite number/,
  );
});

test("assertValidPositiveNumber: should throw for values exceeding safe integer range", () => {
  assert.throws(
    () => assertValidPositiveNumber(Number.MAX_SAFE_INTEGER + 1, "test"),
    /test: value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => assertValidPositiveNumber(-Number.MAX_SAFE_INTEGER - 1, "test"),
    /test: value exceeds maximum safe integer range/,
  );
});

test("assertValidNonNegativeNumber: should not throw for non-negative values", () => {
  assert.not.throws(() => assertValidNonNegativeNumber(0, "test"));
  assert.not.throws(() => assertValidNonNegativeNumber(0.1, "test"));
  assert.not.throws(() => assertValidNonNegativeNumber(1, "test"));
  assert.not.throws(() => assertValidNonNegativeNumber(123.456, "test"));
  assert.not.throws(() => assertValidNonNegativeNumber(1000, "test"));
  assert.not.throws(() =>
    assertValidNonNegativeNumber(Number.MAX_SAFE_INTEGER, "test"),
  );
});

test("assertValidNonNegativeNumber: should throw for negative values", () => {
  assert.throws(
    () => assertValidNonNegativeNumber(-0.1, "test"),
    /test: value must be greater than or equal to 0/,
  );
  assert.throws(
    () => assertValidNonNegativeNumber(-1, "test"),
    /test: value must be greater than or equal to 0/,
  );
  assert.throws(
    () => assertValidNonNegativeNumber(-100, "test"),
    /test: value must be greater than or equal to 0/,
  );
});

test("assertValidNonNegativeNumber: should throw for non-finite values with correct message", () => {
  assert.throws(
    () => assertValidNonNegativeNumber(NaN, "test"),
    /test: value must be a finite number/,
  );
  assert.throws(
    () => assertValidNonNegativeNumber(Infinity, "test"),
    /test: value must be a finite number/,
  );
  assert.throws(
    () => assertValidNonNegativeNumber(-Infinity, "test"),
    /test: value must be a finite number/,
  );
});

test("assertValidNonNegativeNumber: should throw for values exceeding safe integer range", () => {
  assert.throws(
    () => assertValidNonNegativeNumber(Number.MAX_SAFE_INTEGER + 1, "test"),
    /test: value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => assertValidNonNegativeNumber(-Number.MAX_SAFE_INTEGER - 1, "test"),
    /test: value exceeds maximum safe integer range/,
  );
});

test.run();
