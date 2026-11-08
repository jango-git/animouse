import { expect, test } from "vitest";
import { isAzimuthBetween } from "../../src/miscellaneous/math";

test("isAzimuthBetween: should throw for 'value' value", () => {
  expect(() => isAzimuthBetween(NaN, 0, Math.PI)).toThrow(/value must be a finite number/);
  expect(() => isAzimuthBetween(Infinity, 0, Math.PI)).toThrow(/value must be a finite number/);
  expect(() => isAzimuthBetween(-Infinity, 0, Math.PI)).toThrow(/value must be a finite number/);
  expect(() => isAzimuthBetween(Number.MAX_SAFE_INTEGER + 1, 0, Math.PI)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => isAzimuthBetween(-Number.MAX_SAFE_INTEGER - 1, 0, Math.PI)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => isAzimuthBetween(-0.1, 0, Math.PI)).toThrow(
    /azimuth must be between 0 and 2π radians/,
  );
  expect(() => isAzimuthBetween(Math.PI * 2 + 0.1, 0, Math.PI)).toThrow(
    /azimuth must be between 0 and 2π radians/,
  );
});

test("isAzimuthBetween: should throw for 'from' value", () => {
  expect(() => isAzimuthBetween(0, NaN, Math.PI)).toThrow(/value must be a finite number/);
  expect(() => isAzimuthBetween(0, Infinity, Math.PI)).toThrow(/value must be a finite number/);
  expect(() => isAzimuthBetween(0, -Infinity, Math.PI)).toThrow(/value must be a finite number/);
  expect(() => isAzimuthBetween(0, Number.MAX_SAFE_INTEGER + 1, Math.PI)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => isAzimuthBetween(0, -Number.MAX_SAFE_INTEGER - 1, Math.PI)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => isAzimuthBetween(0, -0.1, Math.PI)).toThrow(
    /azimuth must be between 0 and 2π radians/,
  );
  expect(() => isAzimuthBetween(0, Math.PI * 2 + 0.1, Math.PI)).toThrow(
    /azimuth must be between 0 and 2π radians/,
  );
});

test("isAzimuthBetween: should throw for 'to' value", () => {
  expect(() => isAzimuthBetween(0, 0, NaN)).toThrow(/value must be a finite number/);
  expect(() => isAzimuthBetween(0, 0, Infinity)).toThrow(/value must be a finite number/);
  expect(() => isAzimuthBetween(0, 0, -Infinity)).toThrow(/value must be a finite number/);
  expect(() => isAzimuthBetween(0, 0, Number.MAX_SAFE_INTEGER + 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => isAzimuthBetween(0, 0, -Number.MAX_SAFE_INTEGER - 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => isAzimuthBetween(0, 0, -0.1)).toThrow(/azimuth must be between 0 and 2π radians/);
  expect(() => isAzimuthBetween(0, 0, Math.PI * 2 + 0.1)).toThrow(
    /azimuth must be between 0 and 2π radians/,
  );
});
