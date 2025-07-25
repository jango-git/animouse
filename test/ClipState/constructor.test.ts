import { LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { buildMockAnimationAction } from "../mocks/buildMockAnimationAction";
import { ClipStateProxy } from "../proxies/ClipStateProxy";

test("constructor: should throw error when action duration is less than or equal to zero", () => {
  const mockAction = buildMockAnimationAction(1, LoopRepeat, 0);

  assert.throws(() => {
    new ClipStateProxy(mockAction);
  }, "Action duration must be greater than zero");
});

test("constructor: should initialize ClipState to stopped state", () => {
  const mockAction = buildMockAnimationAction(1, LoopRepeat, 2.5);
  mockAction.time = 0.15;
  const clipState = new ClipStateProxy(mockAction);

  assert.equal(mockAction.time, 0);
  assert.equal(mockAction.weight, 0);
  assert.equal(mockAction.isRunning(), false);
  assert.equal(clipState.influence, 0);
});

test.run();
