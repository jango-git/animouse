import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
import { buildMockAnimationAction } from "./mocks/buildMockAnimationAction";
import { ClipStateProxy } from "./proxies/ClipStateProxy";

// Constructor tests
test("should initialize anchor with correct properties from AnimationAction", () => {
  const mockAction = buildMockAnimationAction(LoopRepeat, 2.5);
  const clipState = new ClipStateProxy(mockAction);

  assert.equal(mockAction.time, 0);
  assert.equal(mockAction.weight, 0);
  assert.equal(clipState.influence, 0);
});

test("should configure iteration event type based on animation loop mode", () => {
  const loopOnceAction = buildMockAnimationAction(LoopOnce, 1.0);
  const loopRepeatAction = buildMockAnimationAction(LoopRepeat, 1.0);

  const loopOnceState = new ClipStateProxy(loopOnceAction);
  const loopRepeatState = new ClipStateProxy(loopRepeatAction);

  let finishEventFired = false;
  let iterateEventFired = false;

  loopOnceState.on(StateEvent.FINISH, () => {
    finishEventFired = true;
  });

  loopRepeatState.on(StateEvent.ITERATE, () => {
    iterateEventFired = true;
  });

  // Set positive influence to start animations
  loopOnceState.invokeSetInfluence(1.0);
  loopRepeatState.invokeSetInfluence(1.0);

  // Simulate animation completion by setting time to duration
  loopOnceAction.time = 1.0;
  loopRepeatAction.time = 1.0;

  loopOnceState.invokeOnTick();
  loopRepeatState.invokeOnTick();

  assert.ok(
    finishEventFired,
    "FINISH event should fire for LoopOnce animations",
  );
  assert.ok(
    iterateEventFired,
    "ITERATE event should fire for looped animations",
  );
});

test("should reset AnimationAction to stopped state", () => {
  const mockAction = buildMockAnimationAction();
  mockAction.time = 0.5;
  mockAction.weight = 0.7;
  mockAction.play();

  new ClipStateProxy(mockAction);

  assert.equal(mockAction.time, 0);
  assert.equal(mockAction.weight, 0);
});

// Influence Management tests
test("should start animation and emit PLAY when influence becomes positive", () => {
  const mockAction = buildMockAnimationAction();
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
  const mockAction = buildMockAnimationAction();
  const clipState = new ClipStateProxy(mockAction);

  // Start animation first
  clipState.invokeSetInfluence(0.8);
  mockAction.time = 0.3; // Simulate some progress

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
  const mockAction = buildMockAnimationAction();
  const clipState = new ClipStateProxy(mockAction);

  // Start animation
  clipState.invokeSetInfluence(0.3);
  assert.equal(mockAction.weight, 0.3);

  // Change influence
  clipState.invokeSetInfluence(0.7);
  assert.equal(mockAction.weight, 0.7);

  // Should remain playing
  assert.ok(mockAction.isRunning(), "Animation should remain playing");
});

test("should ignore unchanged influence values", () => {
  const mockAction = buildMockAnimationAction();
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(0.5);
  const initialWeight = mockAction.weight;

  let eventFired = false;
  clipState.on(StateEvent.PLAY, () => {
    eventFired = true;
  });

  // Set same influence again
  clipState.invokeSetInfluence(0.5);

  assert.equal(mockAction.weight, initialWeight);
  assert.not.ok(
    eventFired,
    "No events should be fired for unchanged influence",
  );
});

// Animation Tracking tests
test("should emit appropriate iteration event when animation completes", () => {
  const mockAction = buildMockAnimationAction(LoopOnce, 1.0);
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(1.0);

  let eventFired = false;
  clipState.on(StateEvent.FINISH, () => {
    eventFired = true;
  });

  // Simulate animation reaching duration
  mockAction.time = 1.0;
  clipState.invokeOnTick();

  assert.ok(
    eventFired,
    "Iteration event should be emitted when animation completes",
  );
});

test("should detect animation restart and emit iteration event", () => {
  const mockAction = buildMockAnimationAction();
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(1.0);

  // Simulate animation progress
  mockAction.time = 0.8;
  clipState.invokeOnTick();

  let eventFired = false;
  clipState.on(StateEvent.ITERATE, () => {
    eventFired = true;
  });

  // Simulate restart (time goes backwards)
  mockAction.time = 0.1;
  clipState.invokeOnTick();

  assert.ok(
    eventFired,
    "Iteration event should be emitted when animation restarts",
  );
});

test("should prevent duplicate iteration events for same completion", () => {
  const mockAction = buildMockAnimationAction();
  const clipState = new ClipStateProxy(mockAction);

  clipState.invokeSetInfluence(1.0);

  let eventCount = 0;
  clipState.on(StateEvent.ITERATE, () => {
    eventCount++;
  });

  // Simulate animation completion
  mockAction.time = 1.0;
  clipState.invokeOnTick();
  clipState.invokeOnTick(); // Second tick at same time

  assert.equal(
    eventCount,
    1,
    "Iteration event should only fire once per completion",
  );
});

test("should update internal tracking state on each tick", () => {
  const mockAction = buildMockAnimationAction();
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

test("should configure ITERATE event for LoopPingPong animations", () => {
  const pingPongAction = buildMockAnimationAction(LoopPingPong);
  const clipState = new ClipStateProxy(pingPongAction);

  clipState.invokeSetInfluence(1.0);

  let eventFired = false;
  clipState.on(StateEvent.ITERATE, () => {
    eventFired = true;
  });

  // Simulate animation reaching duration
  pingPongAction.time = 1.0;
  clipState.invokeOnTick();

  assert.ok(
    eventFired,
    "ITERATE event should fire for LoopPingPong animations",
  );
});

test.run();
