import { expect, test } from "vitest";
import {
  assertValidAzimuth,
  assertValidNonNegativeNumber,
  assertValidNumber,
  assertValidPositiveNumber,
  assertValidUnitRange,
} from "../src/miscellaneous/assertions";
import { EPSILON } from "../src/miscellaneous/miscellaneous";

test("assertValidNumber: should not throw for valid finite numbers", () => {
  expect(() => assertValidNumber(0, "test")).not.toThrow();
  expect(() => assertValidNumber(123.456, "test")).not.toThrow();
  expect(() => assertValidNumber(-789, "test")).not.toThrow();
  expect(() => assertValidNumber(Number.MAX_SAFE_INTEGER, "test")).not.toThrow();
  expect(() => assertValidNumber(-Number.MAX_SAFE_INTEGER, "test")).not.toThrow();
});

test("assertValidNumber: should throw for non-finite values with correct message", () => {
  expect(() => assertValidNumber(NaN, "test")).toThrow(/test: value must be a finite number/);
  expect(() => assertValidNumber(Infinity, "test")).toThrow(/test: value must be a finite number/);
  expect(() => assertValidNumber(-Infinity, "test")).toThrow(/test: value must be a finite number/);
});

test("assertValidNumber: should throw for values exceeding safe integer range", () => {
  expect(() => assertValidNumber(Number.MAX_SAFE_INTEGER + 1, "test")).toThrow(
    /test: value exceeds maximum safe integer range/,
  );
  expect(() => assertValidNumber(-Number.MAX_SAFE_INTEGER - 1, "test")).toThrow(
    /test: value exceeds maximum safe integer range/,
  );
});

test("assertValidAzimuth: should not throw for valid azimuth values", () => {
  expect(() => assertValidAzimuth(0, "test")).not.toThrow();
  expect(() => assertValidAzimuth(Math.PI, "test")).not.toThrow();
  expect(() => assertValidAzimuth(Math.PI * 2, "test")).not.toThrow();
  expect(() => assertValidAzimuth(Math.PI / 2, "test")).not.toThrow();
  expect(() => assertValidAzimuth((3 * Math.PI) / 2, "test")).not.toThrow();
});

test("assertValidAzimuth: should throw for azimuth values outside [0, 2π] range", () => {
  expect(() => assertValidAzimuth(-0.1, "test")).toThrow(
    /test: azimuth must be between 0 and 2π radians/,
  );
  expect(() => assertValidAzimuth(Math.PI * 2 + 0.1, "test")).toThrow(
    /test: azimuth must be between 0 and 2π radians/,
  );
  expect(() => assertValidAzimuth(-Math.PI, "test")).toThrow(
    /test: azimuth must be between 0 and 2π radians/,
  );
  expect(() => assertValidAzimuth(3 * Math.PI, "test")).toThrow(
    /test: azimuth must be between 0 and 2π radians/,
  );
});

test("assertValidAzimuth: should throw for non-finite azimuth values", () => {
  expect(() => assertValidAzimuth(NaN, "test")).toThrow(/test: value must be a finite number/);
  expect(() => assertValidAzimuth(Infinity, "test")).toThrow(/test: value must be a finite number/);
  expect(() => assertValidAzimuth(-Infinity, "test")).toThrow(
    /test: value must be a finite number/,
  );
});

test("assertValidUnitRange: should not throw for valid unit range values", () => {
  expect(() => assertValidUnitRange(0, "test")).not.toThrow();
  expect(() => assertValidUnitRange(0.5, "test")).not.toThrow();
  expect(() => assertValidUnitRange(1, "test")).not.toThrow();
  expect(() => assertValidUnitRange(0.25, "test")).not.toThrow();
  expect(() => assertValidUnitRange(0.75, "test")).not.toThrow();
});

test("assertValidUnitRange: should throw for values outside [0, 1] range", () => {
  expect(() => assertValidUnitRange(-0.1, "test")).toThrow(/test: value must be between 0 and 1/);
  expect(() => assertValidUnitRange(1.1, "test")).toThrow(/test: value must be between 0 and 1/);
  expect(() => assertValidUnitRange(-1, "test")).toThrow(/test: value must be between 0 and 1/);
  expect(() => assertValidUnitRange(2, "test")).toThrow(/test: value must be between 0 and 1/);
});

test("assertValidUnitRange: should throw for non-finite values with correct message", () => {
  expect(() => assertValidUnitRange(NaN, "test")).toThrow(/test: value must be a finite number/);
  expect(() => assertValidUnitRange(Infinity, "test")).toThrow(
    /test: value must be a finite number/,
  );
  expect(() => assertValidUnitRange(-Infinity, "test")).toThrow(
    /test: value must be a finite number/,
  );
});

test("assertValidUnitRange: should throw for values exceeding safe integer range", () => {
  expect(() => assertValidUnitRange(Number.MAX_SAFE_INTEGER + 1, "test")).toThrow(
    /test: value exceeds maximum safe integer range/,
  );
});

test("assertValidPositiveNumber: should not throw for positive values", () => {
  expect(() => assertValidPositiveNumber(0.1, "test")).not.toThrow();
  expect(() => assertValidPositiveNumber(1, "test")).not.toThrow();
  expect(() => assertValidPositiveNumber(123.456, "test")).not.toThrow();
  expect(() => assertValidPositiveNumber(1000, "test")).not.toThrow();
  expect(() => assertValidPositiveNumber(EPSILON, "test")).not.toThrow();
  expect(() => assertValidPositiveNumber(Number.MAX_SAFE_INTEGER, "test")).not.toThrow();
});

test("assertValidPositiveNumber: should throw for non-positive values", () => {
  expect(() => assertValidPositiveNumber(0, "test")).toThrow(
    /test: value must be greater than or equal to/,
  );
  expect(() => assertValidPositiveNumber(-0.1, "test")).toThrow(
    /test: value must be greater than or equal to/,
  );
  expect(() => assertValidPositiveNumber(-1, "test")).toThrow(
    /test: value must be greater than or equal to/,
  );
  expect(() => assertValidPositiveNumber(-100, "test")).toThrow(
    /test: value must be greater than or equal to/,
  );
});

test("assertValidPositiveNumber: should throw for non-finite values with correct message", () => {
  expect(() => assertValidPositiveNumber(NaN, "test")).toThrow(
    /test: value must be a finite number/,
  );
  expect(() => assertValidPositiveNumber(Infinity, "test")).toThrow(
    /test: value must be a finite number/,
  );
  expect(() => assertValidPositiveNumber(-Infinity, "test")).toThrow(
    /test: value must be a finite number/,
  );
});

test("assertValidPositiveNumber: should throw for values exceeding safe integer range", () => {
  expect(() => assertValidPositiveNumber(Number.MAX_SAFE_INTEGER + 1, "test")).toThrow(
    /test: value exceeds maximum safe integer range/,
  );
  expect(() => assertValidPositiveNumber(-Number.MAX_SAFE_INTEGER - 1, "test")).toThrow(
    /test: value exceeds maximum safe integer range/,
  );
});

test("assertValidNonNegativeNumber: should throw for negative values", () => {
  expect(() => assertValidNonNegativeNumber(-0.1, "test")).toThrow(
    /test: value must be greater than or equal to 0/,
  );
  expect(() => assertValidNonNegativeNumber(-1, "test")).toThrow(
    /test: value must be greater than or equal to 0/,
  );
  expect(() => assertValidNonNegativeNumber(-100, "test")).toThrow(
    /test: value must be greater than or equal to 0/,
  );
});

test("assertValidNonNegativeNumber: should throw for non-finite values with correct message", () => {
  expect(() => assertValidNonNegativeNumber(NaN, "test")).toThrow(
    /test: value must be a finite number/,
  );
  expect(() => assertValidNonNegativeNumber(Infinity, "test")).toThrow(
    /test: value must be a finite number/,
  );
  expect(() => assertValidNonNegativeNumber(-Infinity, "test")).toThrow(
    /test: value must be a finite number/,
  );
});

test("assertValidNonNegativeNumber: should throw for values exceeding safe integer range", () => {
  expect(() => assertValidNonNegativeNumber(Number.MAX_SAFE_INTEGER + 1, "test")).toThrow(
    /test: value exceeds maximum safe integer range/,
  );
  expect(() => assertValidNonNegativeNumber(-Number.MAX_SAFE_INTEGER - 1, "test")).toThrow(
    /test: value exceeds maximum safe integer range/,
  );
});

test("assertValidNonNegativeNumber: should not throw for non-negative values", () => {
  expect(() => assertValidNonNegativeNumber(0, "test")).not.toThrow();
  expect(() => assertValidNonNegativeNumber(0.1, "test")).not.toThrow();
  expect(() => assertValidNonNegativeNumber(1, "test")).not.toThrow();
  expect(() => assertValidNonNegativeNumber(123.456, "test")).not.toThrow();
  expect(() => assertValidNonNegativeNumber(1000, "test")).not.toThrow();
  expect(() => assertValidNonNegativeNumber(Number.MAX_SAFE_INTEGER, "test")).not.toThrow();
});
