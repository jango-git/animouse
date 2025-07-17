import { test } from "uvu";
import * as assert from "uvu/assert";
import {
  EPSILON,
  PI2,
  calculateAngularDistance,
  calculateDistanceSquared,
  calculateDistanceToEdgeSquared,
  calculateNormalizedAzimuth,
  isAzimuthBetween,
} from "../src/mescellaneous/miscellaneous";

test("constants: should have PI2 equal to 2π", () => {
  assert.equal(PI2, Math.PI * 2);
});

test("constants: should have EPSILON equal to 1e-6", () => {
  assert.equal(EPSILON, 1e-6);
});

test("calculateNormalizedAzimuth: should normalize positive azimuth values correctly", () => {
  assert.equal(calculateNormalizedAzimuth(0), 0);
  assert.equal(calculateNormalizedAzimuth(Math.PI), Math.PI);
  assert.equal(calculateNormalizedAzimuth(PI2), 0);
  assert.equal(calculateNormalizedAzimuth(Math.PI / 2), Math.PI / 2);
});

test("calculateNormalizedAzimuth: should normalize negative azimuth values to positive range", () => {
  assert.equal(calculateNormalizedAzimuth(-Math.PI), Math.PI);
  assert.equal(calculateNormalizedAzimuth(-PI2), 0);
  assert.equal(calculateNormalizedAzimuth(-Math.PI / 2), (3 * Math.PI) / 2);
});

test("calculateNormalizedAzimuth: should normalize azimuth values greater than 2π", () => {
  assert.equal(calculateNormalizedAzimuth(3 * Math.PI), Math.PI);
  assert.equal(calculateNormalizedAzimuth(4 * Math.PI), 0);
  assert.equal(calculateNormalizedAzimuth(5 * Math.PI), Math.PI);
});

test("calculateAngularDistance: should calculate angular distance for basic cases", () => {
  assert.equal(calculateAngularDistance(0, Math.PI), Math.PI);
  assert.equal(calculateAngularDistance(0, PI2), 0);
  assert.equal(calculateAngularDistance(Math.PI, 0), Math.PI);
});

test("calculateAngularDistance: should calculate shortest angular distance around circle", () => {
  // Should choose shorter path around circle
  const result = calculateAngularDistance(0.1, PI2 - 0.1);
  assert.ok(Math.abs(0.2 - result) < EPSILON);
});

test("calculateAngularDistance: should return zero for identical azimuth values", () => {
  assert.equal(calculateAngularDistance(Math.PI, Math.PI), 0);
  assert.equal(calculateAngularDistance(0, 0), 0);
});

test("calculateAngularDistance: should calculate quarter circle distances correctly", () => {
  assert.equal(calculateAngularDistance(0, Math.PI / 2), Math.PI / 2);
  assert.equal(calculateAngularDistance(Math.PI / 2, Math.PI), Math.PI / 2);
});

test("isAzimuthBetween: should detect azimuth within normal range", () => {
  assert.ok(isAzimuthBetween(Math.PI / 2, 0, Math.PI));
  assert.ok(isAzimuthBetween(0, 0, Math.PI));
  assert.ok(isAzimuthBetween(Math.PI, 0, Math.PI));
  assert.not.ok(isAzimuthBetween((3 * Math.PI) / 2, 0, Math.PI));
});

test("isAzimuthBetween: should detect azimuth within wrapped range around 0", () => {
  // Range wraps around 0
  assert.ok(isAzimuthBetween(0, (3 * Math.PI) / 2, Math.PI / 2));
  assert.ok(isAzimuthBetween(Math.PI / 4, (3 * Math.PI) / 2, Math.PI / 2));
  assert.ok(
    isAzimuthBetween((7 * Math.PI) / 4, (3 * Math.PI) / 2, Math.PI / 2),
  );
  assert.not.ok(isAzimuthBetween(Math.PI, (3 * Math.PI) / 2, Math.PI / 2));
});

test("isAzimuthBetween: should handle edge cases for azimuth range detection", () => {
  assert.ok(isAzimuthBetween(0, 0, 0));
  assert.ok(isAzimuthBetween(Math.PI, Math.PI, Math.PI));
});

test("calculateDistanceSquared: should calculate squared distance for basic cases", () => {
  assert.equal(calculateDistanceSquared(0, 0, 0, 0), 0);
  assert.equal(calculateDistanceSquared(0, 0, 3, 4), 25);
  assert.equal(calculateDistanceSquared(1, 1, 4, 5), 25);
});

test("calculateDistanceSquared: should calculate squared distance with negative coordinates", () => {
  assert.equal(calculateDistanceSquared(-1, -1, 2, 3), 25);
  assert.equal(calculateDistanceSquared(0, 0, -3, -4), 25);
});

test("calculateDistanceSquared: should return zero for distance between same point", () => {
  assert.equal(calculateDistanceSquared(5, 7, 5, 7), 0);
});

test("calculateDistanceToEdgeSquared: should return zero distance for point on edge", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];

  // Point on the edge
  assert.equal(calculateDistanceToEdgeSquared(edge, 5, 0), 0);

  // Point at start of edge
  assert.equal(calculateDistanceToEdgeSquared(edge, 0, 0), 0);

  // Point at end of edge
  assert.equal(calculateDistanceToEdgeSquared(edge, 10, 0), 0);
});

test("calculateDistanceToEdgeSquared: should calculate distance for point perpendicular to edge", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];

  // Point directly above middle of edge
  assert.equal(calculateDistanceToEdgeSquared(edge, 5, 3), 9);

  // Point directly below middle of edge
  assert.equal(calculateDistanceToEdgeSquared(edge, 5, -4), 16);
});

test("calculateDistanceToEdgeSquared: should calculate distance to nearest endpoint when point is beyond edge", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];

  // Point beyond start of edge
  assert.equal(calculateDistanceToEdgeSquared(edge, -5, 0), 25);

  // Point beyond end of edge
  assert.equal(calculateDistanceToEdgeSquared(edge, 15, 0), 25);

  // Point diagonally beyond start
  assert.equal(calculateDistanceToEdgeSquared(edge, -3, 4), 25);
});

test("calculateDistanceToEdgeSquared: should calculate distance for diagonal edge correctly", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
  ];

  // Point at midpoint of diagonal edge
  const midX = 1.5;
  const midY = 2;
  assert.equal(calculateDistanceToEdgeSquared(edge, midX, midY), 0);
});

test.run();
