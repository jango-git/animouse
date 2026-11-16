import type { AnimationAction } from "three";
import { LoopRepeat } from "three";
import { expect, test } from "vitest";

import type { AnimationState } from "../../src/states/AnimationState";
import { buildMockAnimationAction, MIXER } from "../mocks/buildMockAnimationAction";
import { ClipStateProxy } from "../proxies/ClipStateProxy";

function crossQuarter(state: ClipStateProxy, action: AnimationAction): void {
  action.time = 0.2;
  state.invokeOnTick(0.1);
}

test("timeEvents: should call the callback with the action and the state", () => {
  const action = buildMockAnimationAction(1, LoopRepeat, 1.0);
  const state = new ClipStateProxy(action);
  state.invokeSetInfluence(1.0);

  let receivedAction: AnimationAction | undefined;
  let receivedState: AnimationState | undefined;
  state.onTimeEvent(0.25, (eventAction, eventState) => {
    receivedAction = eventAction;
    receivedState = eventState;
  });

  crossQuarter(state, action);
  expect(receivedAction).toBe(action);
  expect(receivedState).toBe(state);
  MIXER.stopAllAction();
});

test("timeEvents: offTimeEvent should keep other callbacks at the same time", () => {
  const action = buildMockAnimationAction(1, LoopRepeat, 1.0);
  const state = new ClipStateProxy(action);
  state.invokeSetInfluence(1.0);

  let removedCalls = 0;
  let keptCalls = 0;
  const removed = (): void => {
    removedCalls++;
  };
  state.onTimeEvent(0.25, removed);
  state.onTimeEvent(0.25, () => {
    keptCalls++;
  });
  state.offTimeEvent(0.25, removed);

  crossQuarter(state, action);
  crossQuarter(state, action);
  expect(removedCalls).toEqual(0);
  expect(keptCalls).toEqual(2);
  MIXER.stopAllAction();
});

test("timeEvents: onceTimeEvent should fire once and allow offTimeEvent afterwards", () => {
  const action = buildMockAnimationAction(1, LoopRepeat, 1.0);
  const state = new ClipStateProxy(action);
  state.invokeSetInfluence(1.0);

  let calls = 0;
  const callback = (): void => {
    calls++;
  };
  state.onceTimeEvent(0.25, callback);

  crossQuarter(state, action);
  crossQuarter(state, action);
  expect(calls).toEqual(1);
  expect(() => state.offTimeEvent(0.25, callback)).not.toThrow();
  expect(() => state.offTimeEvent(0.5, callback)).not.toThrow();
  MIXER.stopAllAction();
});
