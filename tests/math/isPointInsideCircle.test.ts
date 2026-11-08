import { expect, test } from "vitest";
import { isPointInsideCircle } from "../../src/miscellaneous/math";

test("isPointInsideCircle: should return true for point inside circle", () => {
  const center = { x: 0, y: 0 };
  const radiusSquared = 4;
  expect(
    isPointInsideCircle(center, radiusSquared, { x: 1, y: 1 }),
    "Point (1,1) should be inside circle with radius 2",
  ).toEqual(true);

  expect(
    isPointInsideCircle(center, radiusSquared, { x: 0, y: 0 }),
    "Point at center should be inside circle",
  ).toEqual(true);
});

test("isPointInsideCircle: should return false for point outside circle", () => {
  const center = { x: 0, y: 0 };
  const radiusSquared = 4;
  expect(
    isPointInsideCircle(center, radiusSquared, { x: 3, y: 0 }),
    "Point (3,0) should be outside circle with radius 2",
  ).toEqual(false);

  expect(
    isPointInsideCircle(center, radiusSquared, { x: 2, y: 2 }),
    "Point (2,2) should be outside circle with radius 2",
  ).toEqual(false);
});

test("isPointInsideCircle: should handle points exactly on circle boundary", () => {
  const center = { x: 0, y: 0 };
  const radiusSquared = 1;
  expect(
    isPointInsideCircle(center, radiusSquared, { x: 1, y: 0 }),
    "Point exactly on boundary should be outside due to EPSILON",
  ).toEqual(false);

  expect(
    isPointInsideCircle(center, radiusSquared, { x: 0, y: 1 }),
    "Point exactly on boundary should be outside due to EPSILON",
  ).toEqual(false);
});

test("isPointInsideCircle: should work with non-origin centers", () => {
  const center = { x: 5, y: 3 };
  const radiusSquared = 4;
  expect(
    isPointInsideCircle(center, radiusSquared, { x: 5.5, y: 3.5 }),
    "Point should be inside offset circle",
  ).toEqual(true);

  expect(
    isPointInsideCircle(center, radiusSquared, { x: 8, y: 3 }),
    "Point should be outside offset circle",
  ).toEqual(false);
});

test("isPointInsideCircle: should work with negative coordinates", () => {
  const center = { x: -2, y: -1 };
  const radiusSquared = 2.25;
  expect(
    isPointInsideCircle(center, radiusSquared, { x: -2.5, y: -1.5 }),
    "Point should be inside circle with negative center",
  ).toEqual(true);

  expect(
    isPointInsideCircle(center, radiusSquared, { x: -0.5, y: -1 }),
    "Point should be outside circle with negative center",
  ).toEqual(false);
});

test("isPointInsideCircle: should work with decimal coordinates", () => {
  const center = { x: 0.1, y: 0.2 };
  const radiusSquared = 0.25;
  expect(
    isPointInsideCircle(center, radiusSquared, { x: 0.2, y: 0.3 }),
    "Point should be inside circle with decimal coordinates",
  ).toEqual(true);

  expect(
    isPointInsideCircle(center, radiusSquared, { x: 0.7, y: 0.2 }),
    "Point should be outside circle with decimal coordinates",
  ).toEqual(false);
});
