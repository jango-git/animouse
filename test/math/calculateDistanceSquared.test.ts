import { test } from "uvu";
import { calculateDistanceSquared } from "../../src/mescellaneous/math";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";

test("calculateDistanceSquared: should calculate squared distance for basic cases", () => {
  assertEqualWithTolerance(calculateDistanceSquared(0, 0, 0, 0), 0, "value");
  assertEqualWithTolerance(calculateDistanceSquared(0, 0, 3, 4), 25, "value");
  assertEqualWithTolerance(calculateDistanceSquared(1, 1, 4, 5), 25, "value");
});

test("calculateDistanceSquared: should calculate squared distance with negative coordinates", () => {
  assertEqualWithTolerance(calculateDistanceSquared(-1, -1, 2, 3), 25, "value");
  assertEqualWithTolerance(calculateDistanceSquared(0, 0, -3, -4), 25, "value");
});

test("calculateDistanceSquared: should return zero for distance between same point", () => {
  assertEqualWithTolerance(calculateDistanceSquared(5, 7, 5, 7), 0, "value");
});

test.run();
