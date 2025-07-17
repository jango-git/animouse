import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
import { buildMockAnimationAction } from "./mocks/buildMockAnimationAction";
import { ClipStateProxy } from "./proxies/ClipStateProxy";

test("should throw error when anchor's weight is greater than 1", () => {
  const mockAction = buildMockAnimationAction(1, LoopRepeat, 0);

  assert.throws(() => {
    new ClipStateProxy(mockAction);
  }, "Action duration must be greater than zero");
});

test("should initialize ClipState with correct properties from AnimationAction", () => {
  const mockAction = buildMockAnimationAction(1, LoopRepeat, 2.5);
  mockAction.time = 0.15;
  const clipState = new ClipStateProxy(mockAction);

  assert.equal(mockAction.time, 0);
  assert.equal(mockAction.weight, 0);
  assert.equal(mockAction.isRunning(), false);
  assert.equal(clipState.influence, 0);
});

test("should configure iteration event type based on animation loop mode", () => {
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

test("should start animation and emit PLAY when influence becomes positive", () => {
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

test("should stop animation and emit STOP when influence becomes zero", () => {
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

test("should update animation weight for positive influence changes", () => {
  const mockAction = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(0.3);
  assert.equal(mockAction.weight, 0.3);

  clipState.invokeSetInfluence(0.7);
  assert.equal(mockAction.weight, 0.7);

  assert.ok(mockAction.isRunning(), "Animation should remain playing");
});

test("should ignore unchanged influence values", () => {
  const mockAction = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(0.5);
  const initialWeight = mockAction.weight;

  let someEventFired = false;
  clipState.on(StateEvent.PLAY, () => {
    someEventFired = true;
  });

  clipState.on(StateEvent.STOP, () => {
    someEventFired = true;
  });

  // Set same influence again
  clipState.invokeSetInfluence(0.5);

  assert.equal(mockAction.weight, initialWeight);
  assert.not.ok(
    someEventFired,
    "No events should be fired for unchanged influence",
  );
});

test("should detect animation restart and emit iteration event", () => {
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

test("should prevent duplicate iteration events for same completion", () => {
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

test("should update internal tracking state on each tick", () => {
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

test.run();
