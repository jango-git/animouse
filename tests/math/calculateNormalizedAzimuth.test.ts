import { expect, test } from "vitest";
import { calculateNormalizedAzimuth } from "../../src/miscellaneous/math";

test("calculateNormalizedAzimuth: should normalize values correctly", () => {
  expect(calculateNormalizedAzimuth(0)).toEqual(0);
  expect(calculateNormalizedAzimuth(Math.PI)).toEqual(Math.PI);
  expect(calculateNormalizedAzimuth(2 * Math.PI)).toEqual(0);
  expect(calculateNormalizedAzimuth(Math.PI / 2)).toEqual(Math.PI / 2);
  expect(calculateNormalizedAzimuth(-Math.PI)).toEqual(Math.PI);
  // Negative inputs may normalize to -0, which is the same azimuth as +0: compare by value,
  // not by Object.is as toEqual does
  expect(calculateNormalizedAzimuth(-0) === 0).toBe(true);
  expect(calculateNormalizedAzimuth(-2 * Math.PI) === 0).toBe(true);
  expect(calculateNormalizedAzimuth(-Math.PI / 2)).toEqual(Math.PI * 1.5);
});
