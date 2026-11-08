import type { AnimationAction } from "three";
import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { expect, test } from "vitest";
import { AnimationStateEvent } from "../../src/miscellaneous/AnimationStateEvent";
import { buildMockPolarAction } from "../mocks/buildMockAction";
import { buildMockAnimationAction, MIXER } from "../mocks/buildMockAnimationAction";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

test("events: should emit ENTER/EXIT events", () => {
  const tree = new PolarBlendTreeProxy([buildMockPolarAction(1, -1), buildMockPolarAction(1, 1)]);

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

test("events: should emit correct FINISH/ITERATE event based on animation loop mode", () => {
  const loopOnceAction = buildMockPolarAction(1, -1, LoopOnce);
  const loopRepeatAction = buildMockPolarAction(1, 0, LoopRepeat);
  const loopPingPongAction = buildMockPolarAction(1, 1, LoopPingPong);

  const tree = new PolarBlendTreeProxy([loopOnceAction, loopRepeatAction, loopPingPongAction]);
  tree.invokeSetInfluence(1.0);

  let loopOnceFinishEventFired = false;
  let loopOnceIterateEventFired = false;

  let loopRepeatFinishEventFired = false;
  let loopRepeatIterateEventFired = false;

  let loopPingPongFinishEventFired = false;
  let loopPingPongIterateEventFired = false;

  tree.on(AnimationStateEvent.FINISH, (action: AnimationAction) => {
    if (action.loop === LoopOnce) {
      loopOnceFinishEventFired = true;
    } else if (action.loop === LoopRepeat) {
      loopRepeatFinishEventFired = true;
    } else {
      loopPingPongFinishEventFired = true;
    }
  });

  tree.on(AnimationStateEvent.ITERATE, (action: AnimationAction) => {
    if (action.loop === LoopOnce) {
      loopOnceIterateEventFired = true;
    } else if (action.loop === LoopRepeat) {
      loopRepeatIterateEventFired = true;
    } else {
      loopPingPongIterateEventFired = true;
    }
  });

  const step = 1;
  tree.setBlend(-1, 1);
  tree.invokeOnTick(step);
  MIXER.update(step);
  tree.setBlend(0, 1);
  tree.invokeOnTick(step);
  MIXER.update(step);
  tree.setBlend(1, 1);
  tree.invokeOnTick(step);
  MIXER.update(step);

  expect(loopOnceFinishEventFired, "FINISH event should fire for LoopOnce animations").toBeTruthy();
  expect(
    loopOnceIterateEventFired,
    "ITERATE event should not fire for LoopOnce animations",
  ).toBeFalsy();

  expect(
    loopRepeatIterateEventFired,
    "ITERATE event should fire for looped animations",
  ).toBeTruthy();
  expect(
    loopRepeatFinishEventFired,
    "FINISH event should not fire for looped animations",
  ).toBeFalsy();

  expect(
    loopPingPongIterateEventFired,
    "ITERATE event should fire for ping-pong animations",
  ).toBeTruthy();
  expect(
    loopPingPongFinishEventFired,
    "FINISH event should not fire for ping-pong animations",
  ).toBeFalsy();
});

test("events: should prevent duplicate iteration events", () => {
  const action = buildMockPolarAction(1, -1, LoopOnce);
  action.action.clampWhenFinished = true;
  const tree = new PolarBlendTreeProxy([action, buildMockPolarAction(1, 1)]);
  tree.invokeSetInfluence(1.0);

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
  const action = buildMockAnimationAction(1, LoopOnce);
  const tree = new PolarBlendTreeProxy(
    [buildMockPolarAction(1, -1), buildMockPolarAction(1, 1)],
    action,
  );

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
  expect(eventAction, "Event should include the animation action").toEqual(action);
  expect(eventState, "Event should include the clip state").toEqual(tree);
  expect(action.weight).toEqual(0.5);
  expect(action.isRunning(), "Animation should be playing").toBeTruthy();
});

test("events: should stop animation and emit STOP when influence becomes zero", () => {
  const action = buildMockAnimationAction(1);
  const tree = new PolarBlendTreeProxy(
    [buildMockPolarAction(1, -1), buildMockPolarAction(1, 1)],
    action,
  );

  tree.invokeSetInfluence(0.8);
  action.time = 0.3;

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
  expect(eventAction, "Event should include the animation action").toEqual(action);
  expect(eventState, "Event should include the clip state").toEqual(tree);
  expect(action.weight).toEqual(0);
  expect(action.isRunning(), "Animation should be stopped").toBeFalsy();
});
