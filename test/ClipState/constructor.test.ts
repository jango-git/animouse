import { LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { buildMockAnimationAction } from "../mocks/buildMockAnimationAction";
import { ClipStateProxy } from "../proxies/ClipStateProxy";

test("constructor: should throw error when action duration is less than or equal to zero", () => {
  const action = buildMockAnimationAction(1, LoopRepeat, 0);

  assert.throws(() => {
    new ClipStateProxy(action);
  }, "Action duration must be greater than zero");
});

test("constructor: should initialize ClipState to stopped state", () => {
  const action = buildMockAnimationAction(1, LoopRepeat, 2.5);
  action.time = 0.15;
  const clipState = new ClipStateProxy(action);

  assert.equal(action.time, 0);
  assert.equal(action.weight, 0);
  assert.equal(action.isRunning(), false);
  assert.equal(clipState.influence, 0);
});

test.run();
