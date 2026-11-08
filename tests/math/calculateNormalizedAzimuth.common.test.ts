import { expect, test } from "vitest";
import { calculateNormalizedAzimuth } from "../../src/miscellaneous/math";

test("calculateNormalizedAzimuth: should throw for invalid azimuth values", () => {
  expect(() => calculateNormalizedAzimuth(NaN)).toThrow(/value must be a finite number/);
  expect(() => calculateNormalizedAzimuth(Infinity)).toThrow(/value must be a finite number/);
  expect(() => calculateNormalizedAzimuth(-Infinity)).toThrow(/value must be a finite number/);
  expect(() => calculateNormalizedAzimuth(Number.MAX_SAFE_INTEGER + 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => calculateNormalizedAzimuth(-Number.MAX_SAFE_INTEGER - 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
});
