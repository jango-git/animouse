import { test } from "uvu";
import * as assert from "uvu/assert";
import { EPSILON, PI2 } from "../src/mescellaneous/assertions";
import {
  calculateAngularDistanceForward,
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

test("calculateNormalizedAzimuth: should normalize values correctly", () => {
  assert.equal(calculateNormalizedAzimuth(0), 0);
  assert.equal(calculateNormalizedAzimuth(Math.PI), Math.PI);
  assert.equal(calculateNormalizedAzimuth(2 * Math.PI), 0);
  assert.equal(calculateNormalizedAzimuth(Math.PI / 2), Math.PI / 2);
  assert.equal(calculateNormalizedAzimuth(-0), 0);
  assert.equal(calculateNormalizedAzimuth(-Math.PI), Math.PI);
  assert.equal(calculateNormalizedAzimuth(-2 * Math.PI), 0);
  assert.equal(calculateNormalizedAzimuth(-Math.PI / 2), Math.PI * 1.5);
});

test("calculateNormalizedAzimuth: should throw for invalid azimuth values", () => {
  assert.throws(
    () => calculateNormalizedAzimuth(NaN),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateNormalizedAzimuth(Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateNormalizedAzimuth(-Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateNormalizedAzimuth(Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => calculateNormalizedAzimuth(-Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
});

test("calculateAngularDistanceForward: should calculate forward distance for basic cases", () => {
  assert.equal(calculateAngularDistanceForward(0, Math.PI), Math.PI);
  assert.equal(calculateAngularDistanceForward(0, 2 * Math.PI), 2 * Math.PI);
  assert.equal(calculateAngularDistanceForward(Math.PI, 0), Math.PI);
});

test("calculateAngularDistanceForward: should throw for invalid azimuth values", () => {
  assert.throws(
    () => calculateAngularDistanceForward(NaN, Math.PI),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(0, Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(0, Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(0, -Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(-0.1, Math.PI),
    /azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(0, 2 * Math.PI + 0.1),
    /azimuth must be between 0 and 2π radians/,
  );
});

test("calculateAngularDistanceForward: should calculate forward distance wrapping around", () => {
  const result = calculateAngularDistanceForward(2 * Math.PI - 0.1, 0.1);
  assert.ok(Math.abs(0.2 - result) < EPSILON);
});

test("calculateAngularDistanceForward: should return zero for identical azimuth values", () => {
  assert.equal(calculateAngularDistanceForward(Math.PI, Math.PI), 0);
  assert.equal(calculateAngularDistanceForward(0, 0), 0);
});

test("calculateAngularDistanceForward: should calculate quarter circle distances correctly", () => {
  assert.equal(calculateAngularDistanceForward(0, Math.PI / 2), Math.PI / 2);
  assert.equal(
    calculateAngularDistanceForward(Math.PI / 2, Math.PI),
    Math.PI / 2,
  );
  assert.equal(
    calculateAngularDistanceForward(Math.PI, (3 * Math.PI) / 2),
    Math.PI / 2,
  );
});

test("calculateAngularDistanceForward: should always go forward even if shorter backward", () => {
  assert.equal(
    calculateAngularDistanceForward(0, (3 * Math.PI) / 2),
    (3 * Math.PI) / 2,
  );
  assert.equal(
    calculateAngularDistanceForward(Math.PI, Math.PI / 2),
    (3 * Math.PI) / 2,
  );
});

test("isAzimuthBetween: should detect azimuth within normal range", () => {
  assert.ok(isAzimuthBetween(Math.PI / 2, 0, Math.PI));
  assert.ok(isAzimuthBetween(0, 0, Math.PI));
  assert.ok(isAzimuthBetween(Math.PI, 0, Math.PI));
  assert.not.ok(isAzimuthBetween((3 * Math.PI) / 2, 0, Math.PI));
});

test("isAzimuthBetween: should throw for invalid azimuth values", () => {
  assert.throws(
    () => isAzimuthBetween(-0.1, 0, Math.PI),
    /azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => isAzimuthBetween(Math.PI, -0.1, Math.PI),
    /azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => isAzimuthBetween(Math.PI, 0, 2 * Math.PI + 0.1),
    /azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => isAzimuthBetween(NaN, 0, Math.PI),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(Math.PI, Infinity, Math.PI),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(Math.PI, 0, -Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => isAzimuthBetween(0, Number.MAX_SAFE_INTEGER + 1, 0),
    /value exceeds maximum safe integer range/,
  );
});

test("isAzimuthBetween: should detect azimuth within wrapped range around 0", () => {
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

test("calculateDistanceSquared: should throw for invalid coordinate values", () => {
  assert.throws(
    () => calculateDistanceSquared(NaN, 0, 3, 4),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(0, Infinity, 3, 4),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(0, 0, -Infinity, 4),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateDistanceSquared(0, 0, 3, Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
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

  assert.equal(calculateDistanceToEdgeSquared(edge, 5, 0), 0);
  assert.equal(calculateDistanceToEdgeSquared(edge, 0, 0), 0);
  assert.equal(calculateDistanceToEdgeSquared(edge, 10, 0), 0);
});

test("calculateDistanceToEdgeSquared: should throw for invalid coordinate values", () => {
  const validEdge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];

  const invalidEdge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: NaN, y: 0 },
    { x: 10, y: 0 },
  ];

  assert.throws(
    () => calculateDistanceToEdgeSquared(invalidEdge, 5, 0),
    /value must be a finite number/,
  );

  assert.throws(
    () => calculateDistanceToEdgeSquared(validEdge, Infinity, 0),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      calculateDistanceToEdgeSquared(validEdge, 5, Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
});

test("calculateDistanceToEdgeSquared: should calculate distance for point perpendicular to edge", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];

  assert.equal(calculateDistanceToEdgeSquared(edge, 5, 3), 9);
  assert.equal(calculateDistanceToEdgeSquared(edge, 5, -4), 16);
});

test("calculateDistanceToEdgeSquared: should calculate distance to nearest endpoint when point is beyond edge", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];

  assert.equal(calculateDistanceToEdgeSquared(edge, -5, 0), 25);
  assert.equal(calculateDistanceToEdgeSquared(edge, 15, 0), 25);
  assert.equal(calculateDistanceToEdgeSquared(edge, -3, 4), 25);
});

test("calculateDistanceToEdgeSquared: should calculate distance for diagonal edge correctly", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
  ];

  const midX = 1.5;
  const midY = 2;
  assert.equal(calculateDistanceToEdgeSquared(edge, midX, midY), 0);
});

test.run();
