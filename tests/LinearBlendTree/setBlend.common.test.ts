import { expect, test } from "vitest";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { buildMockLinearAction } from "../mocks/buildMockAction";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";

test("setBlend: should throw error for invalid blend values", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);
  const tree = new LinearBlendTreeProxy([action1, action2]);

  expect(() => tree.setBlend(NaN)).toThrow(/value must be a finite number/);
  expect(() => tree.setBlend(Infinity)).toThrow(/value must be a finite number/);
  expect(() => tree.setBlend(-Infinity)).toThrow(/value must be a finite number/);
  expect(() => tree.setBlend(Number.MAX_SAFE_INTEGER + 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => tree.setBlend(-Number.MAX_SAFE_INTEGER - 1)).toThrow(
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

  assertEqualWithTolerance(action1.action.weight, initialWeight1, "action1 weight");
  assertEqualWithTolerance(action2.action.weight, initialWeight2, "action2 weight");
});
