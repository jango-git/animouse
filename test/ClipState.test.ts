import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
import { buildMockAnimationAction } from "./mocks/buildMockAnimationAction";
import { ClipStateProxy } from "./proxies/ClipStateProxy";

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

test("events: should emit ENTER/EXIT events", () => {
  const mockAction = buildMockAnimationAction(1, LoopRepeat, 2.5);
  const blendTree = new ClipStateProxy(mockAction);

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
    "ENTER event should be fired after setting influence",
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
    "EXIT event should be fired after setting influence",
  );
  assert.equal(exitState, blendTree, "EXIT event should provide the state");
});

test("events: should emit correct FINISH/ITERATE event based on animation loop mode", () => {
  const loopOnceAction = buildMockAnimationAction(1, LoopOnce, 1.0);
  const loopRepeatAction = buildMockAnimationAction(1, LoopRepeat, 1.0);
  const loopPingPongAction = buildMockAnimationAction(1, LoopPingPong, 1.0);

  const loopOnceState = new ClipStateProxy(loopOnceAction);
  const loopRepeatState = new ClipStateProxy(loopRepeatAction);
  const loopPingPongState = new ClipStateProxy(loopPingPongAction);

  let loopOnceFinishEventFired = false;
  let loopOnceIterateEventFired = false;

  let loopRepeatFinishEventFired = false;
  let loopRepeatIterateEventFired = false;

  let loopPingPongFinishEventFired = false;
  let loopPingPongIterateEventFired = false;

  loopOnceState.on(StateEvent.FINISH, () => {
    loopOnceFinishEventFired = true;
  });

  loopOnceState.on(StateEvent.ITERATE, () => {
    loopOnceIterateEventFired = true;
  });

  loopRepeatState.on(StateEvent.FINISH, () => {
    loopRepeatFinishEventFired = true;
  });

  loopRepeatState.on(StateEvent.ITERATE, () => {
    loopRepeatIterateEventFired = true;
  });

  loopPingPongState.on(StateEvent.FINISH, () => {
    loopPingPongFinishEventFired = true;
  });

  loopPingPongState.on(StateEvent.ITERATE, () => {
    loopPingPongIterateEventFired = true;
  });

  loopOnceState.invokeSetInfluence(1.0);
  loopRepeatState.invokeSetInfluence(1.0);
  loopPingPongState.invokeSetInfluence(1.0);

  loopOnceAction.time = 1.0;
  loopRepeatAction.time = 1.0;
  loopPingPongAction.time = 1.0;

  loopOnceState.invokeOnTick();
  loopRepeatState.invokeOnTick();
  loopPingPongState.invokeOnTick();

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
  const mockAction = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(1.0);

  let eventCount = 0;
  clipState.on(StateEvent.ITERATE, () => {
    eventCount += 1;
  });

  // Simulate animation completion
  mockAction.time = 1.0;
  clipState.invokeOnTick();
  clipState.invokeOnTick();

  assert.equal(
    eventCount,
    1,
    "Iteration event should only fire once per completion",
  );
});

test("events: should start animation and emit PLAY when influence becomes positive", () => {
  const mockAction = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(mockAction);

  let playEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  clipState.on(StateEvent.PLAY, (action, state) => {
    playEventFired = true;
    eventAction = action;
    eventState = state;
  });

  clipState.invokeSetInfluence(0.5);

  assert.ok(playEventFired, "PLAY event should be emitted");
  assert.equal(
    eventAction,
    mockAction,
    "Event should include the animation action",
  );
  assert.equal(eventState, clipState, "Event should include the clip state");
  assert.equal(mockAction.weight, 0.5);
  assert.ok(mockAction.isRunning(), "Animation should be playing");
});

test("events: should stop animation and emit STOP when influence becomes zero", () => {
  const mockAction = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(0.8);
  mockAction.time = 0.3;

  let stopEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  clipState.on(StateEvent.STOP, (action, state) => {
    stopEventFired = true;
    eventAction = action;
    eventState = state;
  });

  clipState.invokeSetInfluence(0);

  assert.ok(stopEventFired, "STOP event should be emitted");
  assert.equal(
    eventAction,
    mockAction,
    "Event should include the animation action",
  );
  assert.equal(eventState, clipState, "Event should include the clip state");
  assert.equal(mockAction.weight, 0);
  assert.equal(mockAction.time, 0);
  assert.not.ok(mockAction.isRunning(), "Animation should be stopped");
});

test("events: should detect animation restart and emit iteration event", () => {
  const mockAction = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(1.0);

  mockAction.time = 0.8;
  clipState.invokeOnTick();

  let eventFired = false;
  clipState.on(StateEvent.ITERATE, () => {
    eventFired = true;
  });

  mockAction.time = 0.1;
  clipState.invokeOnTick();

  assert.ok(
    eventFired,
    "Iteration event should be emitted when animation restarts",
  );
});

test("events: should update internal tracking state on each tick", () => {
  const mockAction = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(1.0);

  // Simulate animation progress
  mockAction.time = 0.3;
  clipState.invokeOnTick();

  mockAction.time = 0.6;
  clipState.invokeOnTick();

  // Verify that animation can complete after partial progress
  let eventFired = false;
  clipState.once(StateEvent.ITERATE, () => {
    eventFired = true;
  });

  mockAction.time = 1.0;
  clipState.invokeOnTick();

  assert.ok(
    eventFired,
    "Should properly track state and fire events after partial progress",
  );

  // Reset flag test - go back below duration
  mockAction.time = 0.5;
  clipState.invokeOnTick();

  // Set up new event listener for second completion
  let secondEventFired = false;
  clipState.once(StateEvent.ITERATE, () => {
    secondEventFired = true;
  });

  // Now complete the animation again
  mockAction.time = 1.0;
  clipState.invokeOnTick();

  assert.ok(
    secondEventFired,
    "Should reset iteration flag and fire event again",
  );
});

test("events: should update animation weight for positive influence changes", () => {
  const mockAction = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(0.3);
  assert.equal(mockAction.weight, 0.3);

  clipState.invokeSetInfluence(0.7);
  assert.equal(mockAction.weight, 0.7);

  assert.ok(mockAction.isRunning(), "Animation should remain playing");
});

test.run();
