import { expect, test } from "vitest";
import { calculateAngularDistanceForward } from "../../src/miscellaneous/math";

test("calculateAngularDistanceForward: should throw for 'from' value", () => {
  expect(() => calculateAngularDistanceForward(NaN, 0)).toThrow(/value must be a finite number/);
  expect(() => calculateAngularDistanceForward(Infinity, 0)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateAngularDistanceForward(-Infinity, 0)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateAngularDistanceForward(Number.MAX_SAFE_INTEGER + 1, 0)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => calculateAngularDistanceForward(-Number.MAX_SAFE_INTEGER - 1, 0)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => calculateAngularDistanceForward(-0.1, Math.PI)).toThrow(
    /azimuth must be between 0 and 2π radians/,
  );
  expect(() => calculateAngularDistanceForward(Math.PI * 2 + 0.1, 0)).toThrow(
    /azimuth must be between 0 and 2π radians/,
  );
});

test("calculateAngularDistanceForward: should throw for 'to' value", () => {
  expect(() => calculateAngularDistanceForward(0, NaN)).toThrow(/value must be a finite number/);
  expect(() => calculateAngularDistanceForward(0, Infinity)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateAngularDistanceForward(0, -Infinity)).toThrow(
    /value must be a finite number/,
  );
  expect(() => calculateAngularDistanceForward(0, Number.MAX_SAFE_INTEGER + 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => calculateAngularDistanceForward(0, -Number.MAX_SAFE_INTEGER - 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => calculateAngularDistanceForward(Math.PI, -0.1)).toThrow(
    /azimuth must be between 0 and 2π radians/,
  );
  expect(() => calculateAngularDistanceForward(0, Math.PI * 2 + 0.1)).toThrow(
    /azimuth must be between 0 and 2π radians/,
  );
});
