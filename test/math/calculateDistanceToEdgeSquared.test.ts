import { test } from "uvu";
import { calculateDistanceToEdgeSquared } from "../../src/mescellaneous/math";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";

test("calculateDistanceToEdgeSquared: should return zero distance for point on edge", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];

  assertEqualWithTolerance(
    calculateDistanceToEdgeSquared(edge, 5, 0),
    0,
    "value",
  );
  assertEqualWithTolerance(
    calculateDistanceToEdgeSquared(edge, 0, 0),
    0,
    "value",
  );
  assertEqualWithTolerance(
    calculateDistanceToEdgeSquared(edge, 10, 0),
    0,
    "value",
  );
});

test("calculateDistanceToEdgeSquared: should calculate distance for point perpendicular to edge", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];

  assertEqualWithTolerance(
    calculateDistanceToEdgeSquared(edge, 5, 3),
    9,
    "value",
  );
  assertEqualWithTolerance(
    calculateDistanceToEdgeSquared(edge, 5, -4),
    16,
    "value",
  );
});

test("calculateDistanceToEdgeSquared: should calculate distance to nearest endpoint when point is beyond edge", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];

  assertEqualWithTolerance(
    calculateDistanceToEdgeSquared(edge, -5, 0),
    25,
    "value",
  );
  assertEqualWithTolerance(
    calculateDistanceToEdgeSquared(edge, 15, 0),
    25,
    "value",
  );
  assertEqualWithTolerance(
    calculateDistanceToEdgeSquared(edge, -3, 4),
    25,
    "value",
  );
});

test("calculateDistanceToEdgeSquared: should calculate distance for diagonal edge correctly", () => {
  const edge: [{ x: number; y: number }, { x: number; y: number }] = [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
  ];

  const midX = 1.5;
  const midY = 2;
  assertEqualWithTolerance(
    calculateDistanceToEdgeSquared(edge, midX, midY),
    0,
    "value",
  );
});

test.run();
