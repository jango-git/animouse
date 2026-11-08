import { LoopRepeat } from "three";
import { expect, test } from "vitest";
import { buildMockAnimationAction } from "../mocks/buildMockAnimationAction";
import { ClipStateProxy } from "../proxies/ClipStateProxy";

test("constructor: should throw error when action duration is less than or equal to zero", () => {
  const action = buildMockAnimationAction(1, LoopRepeat, 0);

  expect(() => {
    new ClipStateProxy(action);
  }, "Action duration must be greater than zero").toThrow();
});

test("constructor: should initialize ClipState to stopped state", () => {
  const action = buildMockAnimationAction(1, LoopRepeat, 2.5);
  action.time = 0.15;
  const clipState = new ClipStateProxy(action);

  expect(action.time).toEqual(0);
  expect(action.weight).toEqual(0);
  expect(action.isRunning()).toEqual(false);
  expect(clipState.influence).toEqual(0);
});
