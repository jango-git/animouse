import { LoopRepeat } from "three";
import { expect, test } from "vitest";
import { buildMockAnimationAction } from "../mocks/buildMockAnimationAction";
import { ClipStateProxy } from "../proxies/ClipStateProxy";

test("setInfluence: should throw error for invalid blend values", () => {
  const action = buildMockAnimationAction(1, LoopRepeat, 2.5);
  const clipState = new ClipStateProxy(action);

  expect(() => clipState.invokeSetInfluence(NaN)).toThrow(/value must be a finite number/);
  expect(() => clipState.invokeSetInfluence(Infinity)).toThrow(/value must be a finite number/);
  expect(() => clipState.invokeSetInfluence(-Infinity)).toThrow(/value must be a finite number/);
  expect(() => clipState.invokeSetInfluence(Number.MAX_SAFE_INTEGER + 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => clipState.invokeSetInfluence(-Number.MAX_SAFE_INTEGER - 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => clipState.invokeSetInfluence(-0.1)).toThrow(/value must be between 0 and 1/);
  expect(() => clipState.invokeSetInfluence(1.1)).toThrow(/value must be between 0 and 1/);
});
