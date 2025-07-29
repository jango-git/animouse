import { test } from "uvu";
import * as assert from "uvu/assert";
import { isAzimuthBetween } from "../../src/mescellaneous/math";

test("isAzimuthBetween: should detect azimuth within normal range", () => {
  assert.ok(isAzimuthBetween(Math.PI / 2, 0, Math.PI));
  assert.ok(isAzimuthBetween(0, 0, Math.PI));
  assert.ok(isAzimuthBetween(Math.PI, 0, Math.PI));
  assert.not.ok(isAzimuthBetween((3 * Math.PI) / 2, 0, Math.PI));
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

test.run();
