import type { AnimationAction } from "three";
import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import { buildMockLinearAction } from "../mocks/buildMockAction";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";

test("events: should emit ENTER/EXIT events", () => {
  const blendTree = new LinearBlendTreeProxy([
    buildMockLinearAction(0),
    buildMockLinearAction(1),
  ]);

  let enterEventFired = false;
  let enterState: any = null;

  let exitEventFired = false;
  let exitState: any = null;

  blendTree.on(StateEvent.ENTER, (state) => {
    enterEventFired = true;
    enterState = state;
  });

  assert.equal(
    enterEventFired,
    false,
    "ENTER event should not be fired initially",
  );
  blendTree.invokeOnEnter();
  assert.equal(
    enterEventFired,
    true,
    "ENTER event should be fired after invoking onEnter",
  );
  assert.equal(enterState, blendTree, "ENTER event should provide the state");

  blendTree.on(StateEvent.EXIT, (state) => {
    exitEventFired = true;
    exitState = state;
  });

  assert.equal(
    exitEventFired,
    false,
    "EXIT event should not be fired initially",
  );
  blendTree.invokeOnExit();
  assert.equal(
    exitEventFired,
    true,
    "EXIT event should be fired after invoking onExit",
  );
  assert.equal(exitState, blendTree, "EXIT event should provide the state");
});

test("events: should emit correct FINISH/ITERATE event based on animation loop mode", () => {
  const loopOnceAction = buildMockLinearAction(0, LoopOnce);
  const loopRepeatAction = buildMockLinearAction(0.5, LoopRepeat);
  const loopPingPongAction = buildMockLinearAction(1, LoopPingPong);

  const blendTree = new LinearBlendTreeProxy([
    loopOnceAction,
    loopRepeatAction,
    loopPingPongAction,
  ]);

  let loopOnceFinishEventFired = false;
  let loopOnceIterateEventFired = false;

  let loopRepeatFinishEventFired = false;
  let loopRepeatIterateEventFired = false;

  let loopPingPongFinishEventFired = false;
  let loopPingPongIterateEventFired = false;

  blendTree.on(StateEvent.FINISH, (action: AnimationAction) => {
    if (action.loop === LoopOnce) {
      loopOnceFinishEventFired = true;
    } else if (action.loop === LoopRepeat) {
      loopRepeatFinishEventFired = true;
    } else {
      loopPingPongFinishEventFired = true;
    }
  });

  blendTree.on(StateEvent.ITERATE, (action: AnimationAction) => {
    if (action.loop === LoopOnce) {
      loopOnceIterateEventFired = true;
    } else if (action.loop === LoopRepeat) {
      loopRepeatIterateEventFired = true;
    } else {
      loopPingPongIterateEventFired = true;
    }
  });

  loopOnceAction.action.time = 1;
  loopRepeatAction.action.time = 0;
  loopPingPongAction.action.time = 0;
  blendTree.invokeOnTick();

  loopOnceAction.action.time = 0;
  loopRepeatAction.action.time = 1;
  loopPingPongAction.action.time = 0;
  blendTree.invokeOnTick();

  loopOnceAction.action.time = 0;
  loopRepeatAction.action.time = 0;
  loopPingPongAction.action.time = 1;
  blendTree.invokeOnTick();

  assert.ok(
    loopOnceFinishEventFired,
    "FINISH event should fire for LoopOnce animations",
  );
  assert.not.ok(
    loopOnceIterateEventFired,
    "ITERATE event should not fire for LoopOnce animations",
  );

  assert.ok(
    loopRepeatIterateEventFired,
    "ITERATE event should fire for looped animations",
  );
  assert.not.ok(
    loopRepeatFinishEventFired,
    "FINISH event should not fire for looped animations",
  );

  assert.ok(
    loopPingPongIterateEventFired,
    "ITERATE event should fire for ping-pong animations",
  );
  assert.not.ok(
    loopPingPongFinishEventFired,
    "FINISH event should not fire for ping-pong animations",
  );
});

test("events: should prevent duplicate iteration events", () => {
  const action = buildMockLinearAction(0);
  const blendTree = new LinearBlendTreeProxy([
    action,
    buildMockLinearAction(1),
  ]);

  let eventCount = 0;
  blendTree.on(StateEvent.ITERATE, () => {
    eventCount += 1;
  });

  action.action.time = 1.0;
  blendTree.invokeOnTick();
  blendTree.invokeOnTick();

  assert.equal(
    eventCount,
    1,
    "Iteration event should only fire once per animation cycle",
  );
});

test("events: should start animation and emit PLAY when influence becomes positive", () => {
  const mockAction = buildMockLinearAction(0);
  const blendTree = new LinearBlendTreeProxy([
    mockAction,
    buildMockLinearAction(1),
  ]);

  let playEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  blendTree.on(StateEvent.PLAY, (action, state) => {
    playEventFired = true;
    eventAction = action;
    eventState = state;
  });

  blendTree.invokeSetInfluence(0.5);

  assert.ok(playEventFired, "PLAY event should be emitted");
  assert.equal(
    eventAction,
    mockAction.action,
    "Event should include the animation action",
  );
  assert.equal(eventState, blendTree, "Event should include the clip state");
  assert.equal(mockAction.action.weight, 0.5);
  assert.ok(mockAction.action.isRunning(), "Animation should be playing");
});

test("events: should stop animation and emit STOP when influence becomes zero", () => {
  const mockAction = buildMockLinearAction(0);
  const blendTree = new LinearBlendTreeProxy([
    mockAction,
    buildMockLinearAction(1),
  ]);

  blendTree.invokeSetInfluence(0.8);
  mockAction.action.time = 0.3;

  let stopEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  blendTree.on(StateEvent.STOP, (action, state) => {
    stopEventFired = true;
    eventAction = action;
    eventState = state;
  });

  blendTree.invokeSetInfluence(0);

  assert.ok(stopEventFired, "STOP event should be emitted");
  assert.equal(
    eventAction,
    mockAction.action,
    "Event should include the animation action",
  );
  assert.equal(eventState, blendTree, "Event should include the clip state");
  assert.equal(mockAction.action.weight, 0);
  assert.not.ok(mockAction.action.isRunning(), "Animation should be stopped");
});

test.run();
