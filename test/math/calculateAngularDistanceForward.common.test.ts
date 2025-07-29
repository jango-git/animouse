import { test } from "uvu";
import * as assert from "uvu/assert";
import { calculateAngularDistanceForward } from "../../src/mescellaneous/math";

test("calculateAngularDistanceForward: should throw for 'from' value", () => {
  assert.throws(
    () => calculateAngularDistanceForward(NaN, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(Infinity, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(-Infinity, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(Number.MAX_SAFE_INTEGER + 1, 0),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(-Number.MAX_SAFE_INTEGER - 1, 0),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(-0.1, Math.PI),
    /azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(Math.PI * 2 + 0.1, 0),
    /azimuth must be between 0 and 2π radians/,
  );
});

test("calculateAngularDistanceForward: should throw for 'to' value", () => {
  assert.throws(
    () => calculateAngularDistanceForward(0, NaN),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(0, Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(0, -Infinity),
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
    () => calculateAngularDistanceForward(Math.PI, -0.1),
    /azimuth must be between 0 and 2π radians/,
  );
  assert.throws(
    () => calculateAngularDistanceForward(0, Math.PI * 2 + 0.1),
    /azimuth must be between 0 and 2π radians/,
  );
});

test.run();
