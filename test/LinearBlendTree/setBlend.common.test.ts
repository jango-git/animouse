import { test } from "uvu";
import * as assert from "uvu/assert";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { buildMockLinearAction } from "../mocks/buildMockAction";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";

test("setBlend: should throw error for invalid blend values", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);
  const tree = new LinearBlendTreeProxy([action1, action2]);

  assert.throws(() => tree.setBlend(NaN), /value must be a finite number/);
  assert.throws(() => tree.setBlend(Infinity), /value must be a finite number/);
  assert.throws(
    () => tree.setBlend(-Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => tree.setBlend(Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => tree.setBlend(-Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
});

test("setBlend: should skip update when blend value unchanged", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);
  const tree = new LinearBlendTreeProxy([action1, action2]);
  tree.invokeSetInfluence(1);

  const value = 0.5;

  tree.setBlend(value);
  const initialWeight1 = action1.action.weight;
  const initialWeight2 = action2.action.weight;

  tree.setBlend(value);

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
