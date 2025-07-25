import { test } from "uvu";
import * as assert from "uvu/assert";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { buildMockPolarAction } from "../mocks/buildMockAction";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

test("setBlend: should throw error for invalid blend values", () => {
  const action1 = buildMockPolarAction(1, -1);
  const action2 = buildMockPolarAction(1, 1);
  const tree = new PolarBlendTreeProxy([action1, action2]);

  assert.throws(() => tree.setBlend(NaN, 1), /value must be a finite number/);
  assert.throws(
    () => tree.setBlend(Infinity, 1),
    /value must be a finite number/,
  );
  assert.throws(
    () => tree.setBlend(-Infinity, 1),
    /value must be a finite number/,
  );
  assert.throws(
    () => tree.setBlend(Number.MAX_SAFE_INTEGER + 1, 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => tree.setBlend(-Number.MAX_SAFE_INTEGER - 1, 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(() => tree.setBlend(1, NaN), /value must be a finite number/);
  assert.throws(
    () => tree.setBlend(1, Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => tree.setBlend(1, -Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => tree.setBlend(1, Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => tree.setBlend(1, -Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
});

test("setBlend: should skip update when blend value unchanged", () => {
  const action1 = buildMockPolarAction(1, 0);
  const action2 = buildMockPolarAction(1, 1);
  const tree = new PolarBlendTreeProxy([action1, action2]);
  tree.invokeSetInfluence(1);

  const value = 0.5;

  tree.setBlend(value, 1);
  const initialWeight1 = action1.action.weight;
  const initialWeight2 = action2.action.weight;

  tree.setBlend(value, 1);

  assertEqualWithTolerance(
    action1.action.weight,
    initialWeight1,
    "action1 weight should remain unchanged",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    initialWeight2,
    "action2 weight should remain unchanged",
  );
});

test.run();
