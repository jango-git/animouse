import { test } from "uvu";
import * as assert from "uvu/assert";
import { calculateNormalizedAzimuth } from "../../src/mescellaneous/math";

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

test.run();
