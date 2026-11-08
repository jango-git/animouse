import { expect, test } from "vitest";
import { isAzimuthBetween } from "../../src/miscellaneous/math";

test("isAzimuthBetween: should detect azimuth within normal range", () => {
  expect(isAzimuthBetween(Math.PI / 2, 0, Math.PI)).toBeTruthy();
  expect(isAzimuthBetween(0, 0, Math.PI)).toBeTruthy();
  expect(isAzimuthBetween(Math.PI, 0, Math.PI)).toBeTruthy();
  expect(isAzimuthBetween((3 * Math.PI) / 2, 0, Math.PI)).toBeFalsy();
});

test("isAzimuthBetween: should detect azimuth within wrapped range around 0", () => {
  expect(isAzimuthBetween(0, (3 * Math.PI) / 2, Math.PI / 2)).toBeTruthy();
  expect(isAzimuthBetween(Math.PI / 4, (3 * Math.PI) / 2, Math.PI / 2)).toBeTruthy();
  expect(isAzimuthBetween((7 * Math.PI) / 4, (3 * Math.PI) / 2, Math.PI / 2)).toBeTruthy();
  expect(isAzimuthBetween(Math.PI, (3 * Math.PI) / 2, Math.PI / 2)).toBeFalsy();
});

test("isAzimuthBetween: should handle edge cases for azimuth range detection", () => {
  expect(isAzimuthBetween(0, 0, 0)).toBeTruthy();
  expect(isAzimuthBetween(Math.PI, Math.PI, Math.PI)).toBeTruthy();
});
