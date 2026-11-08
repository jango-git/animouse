import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { expect, test } from "vitest";
import { AnimationStateEvent } from "../../src/miscellaneous/AnimationStateEvent";
import { buildMockLinearAction } from "../mocks/buildMockAction";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";

test("events: should emit ENTER/EXIT events", () => {
  const tree = new LinearBlendTreeProxy([buildMockLinearAction(0), buildMockLinearAction(1)]);

  let enterEventFired = false;
  let enterState: any = null;

  let exitEventFired = false;
  let exitState: any = null;

  tree.on(AnimationStateEvent.ENTER, (state) => {
    enterEventFired = true;
    enterState = state;
  });

  expect(enterEventFired, "ENTER event should not be fired initially").toEqual(false);
  tree.invokeOnEnter();
  expect(enterEventFired, "ENTER event should be fired after invoking onEnter").toEqual(true);
  expect(enterState, "ENTER event should provide the state").toEqual(tree);

  tree.on(AnimationStateEvent.EXIT, (state) => {
    exitEventFired = true;
    exitState = state;
  });

  expect(exitEventFired, "EXIT event should not be fired initially").toEqual(false);
  tree.invokeOnExit();
  expect(exitEventFired, "EXIT event should be fired after invoking onExit").toEqual(true);
  expect(exitState, "EXIT event should provide the state").toEqual(tree);
});

test("events: should emit FINISH event for LoopOnce animations", () => {
  const loopOnceAction = buildMockLinearAction(0, LoopOnce);

  const tree = new LinearBlendTreeProxy([loopOnceAction, buildMockLinearAction(1)]);
  tree.invokeSetInfluence(1);

  let finishEventFired = false;
  let iterateEventFired = false;

  tree.on(AnimationStateEvent.FINISH, () => {
    finishEventFired = true;
  });

  tree.on(AnimationStateEvent.ITERATE, () => {
    iterateEventFired = true;
  });

  const step = 1;
  tree.invokeOnTick(step);
  MIXER.update(step);

  expect(finishEventFired, "FINISH event should fire for LoopOnce animations").toBeTruthy();
  expect(iterateEventFired, "ITERATE event should not fire for LoopOnce animations").toBeFalsy();
});

test("events: should emit ITERATE event for LoopRepeat animations", () => {
  const loopRepeatAction = buildMockLinearAction(0, LoopRepeat);

  const tree = new LinearBlendTreeProxy([loopRepeatAction, buildMockLinearAction(1)]);
  tree.invokeSetInfluence(1);

  let finishEventFired = false;
  let iterateEventFired = false;

  tree.on(AnimationStateEvent.FINISH, () => {
    finishEventFired = true;
  });

  tree.on(AnimationStateEvent.ITERATE, () => {
    iterateEventFired = true;
  });

  const step = 1;
  tree.invokeOnTick(step);
  MIXER.update(step);

  expect(iterateEventFired, "ITERATE event should fire for looped animations").toBeTruthy();
  expect(finishEventFired, "FINISH event should not fire for looped animations").toBeFalsy();
});

test("events: should emit ITERATE event for LoopPingPong animations", () => {
  const loopPingPongAction = buildMockLinearAction(0, LoopPingPong);

  const tree = new LinearBlendTreeProxy([loopPingPongAction, buildMockLinearAction(1)]);
  tree.invokeSetInfluence(1);

  let finishEventFired = false;
  let iterateEventFired = false;

  tree.on(AnimationStateEvent.FINISH, () => {
    finishEventFired = true;
  });

  tree.on(AnimationStateEvent.ITERATE, () => {
    iterateEventFired = true;
  });

  const step = 1;
  tree.invokeOnTick(step);
  MIXER.update(step);

  expect(iterateEventFired, "ITERATE event should fire for ping-pong animations").toBeTruthy();
  expect(finishEventFired, "FINISH event should not fire for ping-pong animations").toBeFalsy();
});

test("events: should prevent duplicate iteration events", () => {
  const one = buildMockLinearAction(0, LoopOnce);
  const two = buildMockLinearAction(1, LoopOnce);

  one.action.clampWhenFinished = true;
  two.action.clampWhenFinished = true;

  const tree = new LinearBlendTreeProxy([one, two]);
  tree.invokeSetInfluence(1);

  let eventCount = 0;
  tree.on(AnimationStateEvent.FINISH, () => {
    eventCount += 1;
  });

  const step = 1;
  tree.invokeOnTick(step);
  MIXER.update(step);

  tree.invokeOnTick(step);
  MIXER.update(step);

  expect(eventCount, "Iteration event should only fire once per animation cycle").toEqual(1);
});

test("events: should start animation and emit PLAY when influence becomes positive", () => {
  const action = buildMockLinearAction(0);
  const tree = new LinearBlendTreeProxy([action, buildMockLinearAction(1)]);

  let playEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  tree.on(AnimationStateEvent.PLAY, (action, state) => {
    playEventFired = true;
    eventAction = action;
    eventState = state;
  });

  tree.invokeSetInfluence(0.5);

  expect(playEventFired, "PLAY event should be emitted").toBeTruthy();
  expect(eventAction, "Event should include the animation action").toEqual(action.action);
  expect(eventState, "Event should include the clip state").toEqual(tree);
  expect(action.action.weight).toEqual(0.5);
  expect(action.action.isRunning(), "Animation should be playing").toBeTruthy();
});

test("events: should stop animation and emit STOP when influence becomes zero", () => {
  const action = buildMockLinearAction(0);
  const tree = new LinearBlendTreeProxy([action, buildMockLinearAction(1)]);

  tree.invokeSetInfluence(0.8);
  action.action.time = 0.3;

  let stopEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  tree.on(AnimationStateEvent.STOP, (action, state) => {
    stopEventFired = true;
    eventAction = action;
    eventState = state;
  });

  tree.invokeSetInfluence(0);

  expect(stopEventFired, "STOP event should be emitted").toBeTruthy();
  expect(eventAction, "Event should include the animation action").toEqual(action.action);
  expect(eventState, "Event should include the clip state").toEqual(tree);
  expect(action.action.weight).toEqual(0);
  expect(action.action.isRunning(), "Animation should be stopped").toBeFalsy();
});
