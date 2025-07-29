import { test } from "uvu";
import { calculateAngularDistanceForward } from "../../src/mescellaneous/math";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";

test("calculateAngularDistanceForward: should calculate forward distance for basic cases", () => {
  assertEqualWithTolerance(
    calculateAngularDistanceForward(0, Math.PI),
    Math.PI,
    "value",
  );
  assertEqualWithTolerance(
    calculateAngularDistanceForward(0, 2 * Math.PI),
    2 * Math.PI,
    "value",
  );
  assertEqualWithTolerance(
    calculateAngularDistanceForward(Math.PI, 0),
    Math.PI,
    "value",
  );
});

test("calculateAngularDistanceForward: should calculate forward distance wrapping around", () => {
  assertEqualWithTolerance(
    calculateAngularDistanceForward(Math.PI * 2 - 0.1, 0.1),
    0.2,
    "value",
  );
});

test("calculateAngularDistanceForward: should return zero for identical azimuth values", () => {
  assertEqualWithTolerance(
    calculateAngularDistanceForward(Math.PI, Math.PI),
    0,
    "value",
  );
  assertEqualWithTolerance(calculateAngularDistanceForward(0, 0), 0, "value");
});

test("calculateAngularDistanceForward: should calculate quarter circle distances correctly", () => {
  assertEqualWithTolerance(
    calculateAngularDistanceForward(0, Math.PI / 2),
    Math.PI / 2,
    "value",
  );
  assertEqualWithTolerance(
    calculateAngularDistanceForward(Math.PI / 2, Math.PI),
    Math.PI / 2,
    "value",
  );
  assertEqualWithTolerance(
    calculateAngularDistanceForward(Math.PI, (3 * Math.PI) / 2),
    Math.PI / 2,
    "value",
  );
});

test("calculateAngularDistanceForward: should always go forward even if shorter backward", () => {
  assertEqualWithTolerance(
    calculateAngularDistanceForward(0, (3 * Math.PI) / 2),
    (3 * Math.PI) / 2,
    "value",
  );
  assertEqualWithTolerance(
    calculateAngularDistanceForward(Math.PI, Math.PI / 2),
    (3 * Math.PI) / 2,
    "value",
  );
});

test.run();
