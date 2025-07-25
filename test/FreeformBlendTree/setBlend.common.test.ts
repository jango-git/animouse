import { test } from "uvu";
import * as assert from "uvu/assert";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { buildMockFreeformAction } from "../mocks/buildMockAction";
import { FreeformBlendTreeProxy } from "../proxies/FreeformBlendTreeProxy";

test("setBlend: should throw error for invalid blend values", () => {
  const aAction = buildMockFreeformAction(0, 0);
  const bAction = buildMockFreeformAction(0, 1);
  const cAction = buildMockFreeformAction(1, 0);
  const tree = new FreeformBlendTreeProxy([aAction, bAction, cAction]);

  assert.throws(() => tree.setBlend(NaN, 0), /value must be a finite number/);
  assert.throws(
    () => tree.setBlend(Infinity, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => tree.setBlend(-Infinity, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => tree.setBlend(Number.MAX_SAFE_INTEGER + 1, 0),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => tree.setBlend(-Number.MAX_SAFE_INTEGER - 1, 0),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(() => tree.setBlend(0, NaN), /value must be a finite number/);
  assert.throws(
    () => tree.setBlend(0, Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => tree.setBlend(0, -Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => tree.setBlend(0, Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => tree.setBlend(0, -Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
});

test("setBlend: should skip update when blend value unchanged", () => {
  const aAction = buildMockFreeformAction(0, 0);
  const bAction = buildMockFreeformAction(0, 1);
  const cAction = buildMockFreeformAction(1, 0);
  const tree = new FreeformBlendTreeProxy([aAction, bAction, cAction]);
  tree.invokeSetInfluence(1);

  const x = 0.5;
  const y = 1;

  tree.setBlend(x, y);
  const initialWeight1 = aAction.action.weight;
  const initialWeight2 = bAction.action.weight;
  const initialWeight3 = cAction.action.weight;
  tree.setBlend(x, y);

  assertEqualWithTolerance(
    aAction.action.weight,
    initialWeight1,
    "aAction weight should remain unchanged",
  );
  assertEqualWithTolerance(
    bAction.action.weight,
    initialWeight2,
    "bAction weight should remain unchanged",
  );
  assertEqualWithTolerance(
    cAction.action.weight,
    initialWeight3,
    "cAction weight should remain unchanged",
  );
});

test.run();
