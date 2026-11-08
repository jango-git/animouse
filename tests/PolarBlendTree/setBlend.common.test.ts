import { expect, test } from "vitest";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { buildMockPolarAction } from "../mocks/buildMockAction";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

test("setBlend: should throw error for invalid blend values", () => {
  const action1 = buildMockPolarAction(1, -1);
  const action2 = buildMockPolarAction(1, 1);
  const tree = new PolarBlendTreeProxy([action1, action2]);

  expect(() => tree.setBlend(NaN, 1)).toThrow(/value must be a finite number/);
  expect(() => tree.setBlend(Infinity, 1)).toThrow(/value must be a finite number/);
  expect(() => tree.setBlend(-Infinity, 1)).toThrow(/value must be a finite number/);
  expect(() => tree.setBlend(Number.MAX_SAFE_INTEGER + 1, 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => tree.setBlend(-Number.MAX_SAFE_INTEGER - 1, 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => tree.setBlend(1, NaN)).toThrow(/value must be a finite number/);
  expect(() => tree.setBlend(1, Infinity)).toThrow(/value must be a finite number/);
  expect(() => tree.setBlend(1, -Infinity)).toThrow(/value must be a finite number/);
  expect(() => tree.setBlend(1, Number.MAX_SAFE_INTEGER + 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => tree.setBlend(1, -Number.MAX_SAFE_INTEGER - 1)).toThrow(
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

  assertEqualWithTolerance(action1.action.weight, initialWeight1, "action1 weight");
  assertEqualWithTolerance(action2.action.weight, initialWeight2, "action2 weight");
});
