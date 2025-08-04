import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { AnimationStateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import { buildMockLinearAction } from "../mocks/buildMockAction";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";

test("events: should emit ENTER/EXIT events", () => {
  const tree = new LinearBlendTreeProxy([
    buildMockLinearAction(0),
    buildMockLinearAction(1),
  ]);

  let enterEventFired = false;
  let enterState: any = null;

  let exitEventFired = false;
  let exitState: any = null;

  tree.on(AnimationStateEvent.ENTER, (state) => {
    enterEventFired = true;
    enterState = state;
  });

  assert.equal(
    enterEventFired,
    false,
    "ENTER event should not be fired initially",
  );
  tree.invokeOnEnter();
  assert.equal(
    enterEventFired,
    true,
    "ENTER event should be fired after invoking onEnter",
  );
  assert.equal(enterState, tree, "ENTER event should provide the state");

  tree.on(AnimationStateEvent.EXIT, (state) => {
    exitEventFired = true;
    exitState = state;
  });

  assert.equal(
    exitEventFired,
    false,
    "EXIT event should not be fired initially",
  );
  tree.invokeOnExit();
  assert.equal(
    exitEventFired,
    true,
    "EXIT event should be fired after invoking onExit",
  );
  assert.equal(exitState, tree, "EXIT event should provide the state");
});

test("events: should emit FINISH event for LoopOnce animations", () => {
  const loopOnceAction = buildMockLinearAction(0, LoopOnce);

  const tree = new LinearBlendTreeProxy([
    loopOnceAction,
    buildMockLinearAction(1),
  ]);
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

  assert.ok(
    finishEventFired,
    "FINISH event should fire for LoopOnce animations",
  );
  assert.not.ok(
    iterateEventFired,
    "ITERATE event should not fire for LoopOnce animations",
  );
});

test("events: should emit ITERATE event for LoopRepeat animations", () => {
  const loopRepeatAction = buildMockLinearAction(0, LoopRepeat);

  const tree = new LinearBlendTreeProxy([
    loopRepeatAction,
    buildMockLinearAction(1),
  ]);
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

  assert.ok(
    iterateEventFired,
    "ITERATE event should fire for looped animations",
  );
  assert.not.ok(
    finishEventFired,
    "FINISH event should not fire for looped animations",
  );
});

test("events: should emit ITERATE event for LoopPingPong animations", () => {
  const loopPingPongAction = buildMockLinearAction(0, LoopPingPong);

  const tree = new LinearBlendTreeProxy([
    loopPingPongAction,
    buildMockLinearAction(1),
  ]);
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

  assert.ok(
    iterateEventFired,
    "ITERATE event should fire for ping-pong animations",
  );
  assert.not.ok(
    finishEventFired,
    "FINISH event should not fire for ping-pong animations",
  );
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

  assert.equal(
    eventCount,
    1,
    "Iteration event should only fire once per animation cycle",
  );
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

  assert.ok(playEventFired, "PLAY event should be emitted");
  assert.equal(
    eventAction,
    action.action,
    "Event should include the animation action",
  );
  assert.equal(eventState, tree, "Event should include the clip state");
  assert.equal(action.action.weight, 0.5);
  assert.ok(action.action.isRunning(), "Animation should be playing");
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

  assert.ok(stopEventFired, "STOP event should be emitted");
  assert.equal(
    eventAction,
    action.action,
    "Event should include the animation action",
  );
  assert.equal(eventState, tree, "Event should include the clip state");
  assert.equal(action.action.weight, 0);
  assert.not.ok(action.action.isRunning(), "Animation should be stopped");
});

test.run();
