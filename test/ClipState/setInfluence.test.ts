import { LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { buildMockAnimationAction } from "../mocks/buildMockAnimationAction";
import { ClipStateProxy } from "../proxies/ClipStateProxy";

test("setInluence: should throw error for invalid blend values", () => {
  const action = buildMockAnimationAction(1, LoopRepeat, 2.5);
  const clipState = new ClipStateProxy(action);

  assert.throws(
    () => clipState.invokeSetInfluence(NaN),
    /value must be a finite number/,
  );
  assert.throws(
    () => clipState.invokeSetInfluence(Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => clipState.invokeSetInfluence(-Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => clipState.invokeSetInfluence(Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => clipState.invokeSetInfluence(-Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => clipState.invokeSetInfluence(-0.1),
    /value must be between 0 and 1/,
  );
  assert.throws(
    () => clipState.invokeSetInfluence(1.1),
    /value must be between 0 and 1/,
  );
});

test.run();
