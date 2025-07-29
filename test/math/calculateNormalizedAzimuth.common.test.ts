import { test } from "uvu";
import * as assert from "uvu/assert";
import { calculateNormalizedAzimuth } from "../../src/mescellaneous/math";

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

test.run();
