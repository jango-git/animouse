import { test } from "uvu";
import * as assert from "uvu/assert";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { buildMockFreeformAction } from "../mocks/buildMockAction";
import { FreeformBlendTreeProxy } from "../proxies/FreeformBlendTreeProxy";

test("setBlend: should throw error for invalid blend values", () => {
  const action1 = buildMockFreeformAction(0, 0);
  const action2 = buildMockFreeformAction(1, 0);
  const action3 = buildMockFreeformAction(0, 1);
  const blendTree = new FreeformBlendTreeProxy([action1, action2, action3]);

  assert.throws(
    () => blendTree.setBlend(NaN, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(Infinity, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(-Infinity, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(Number.MAX_SAFE_INTEGER + 1, 0),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => blendTree.setBlend(-Number.MAX_SAFE_INTEGER - 1, 0),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => blendTree.setBlend(0, NaN),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(0, Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(0, -Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(0, Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => blendTree.setBlend(0, -Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
});

test("setBlend: should skip update when blend value unchanged", () => {
  const action1 = buildMockFreeformAction(0, 0);
  const action2 = buildMockFreeformAction(1, 0);
  const action3 = buildMockFreeformAction(0, 1);
  const blendTree = new FreeformBlendTreeProxy([action1, action2, action3]);
  blendTree.invokeSetInfluence(1);

  const x = 0.5;
  const y = 1;

  blendTree.setBlend(x, y);
  const initialWeight1 = action1.action.weight;
  const initialWeight2 = action2.action.weight;
  const initialWeight3 = action3.action.weight;

  blendTree.setBlend(x, y);

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
  assertEqualWithTolerance(
    action3.action.weight,
    initialWeight3,
    "action3 weight should remain unchanged",
  );
});

test.run();
