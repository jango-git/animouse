import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
import { buildMockAnchor } from "./mocks/buildMockAnchor";
import { AnimationTreeProxy } from "./proxies/AnimationTreeProxy";

test("should update influence when new value is different", () => {
  const tree = new AnimationTreeProxy();
  const value = 0.5;
  tree.invokeSetInfluence(value);

  assert.equal(tree.influence, value);
  assert.ok(
    tree.updateAnchorsInfluenceCallCount > 0,
    "updateAnchorsInfluence should be called",
  );
});

test("should not update influence when influence value is unchanged", () => {
  const tree = new AnimationTreeProxy();
  const value = 0.5;
  tree.invokeSetInfluence(value);
  const initialCount = tree.updateAnchorsInfluenceCallCount;
  tree.invokeSetInfluence(value);

  assert.equal(
    tree.updateAnchorsInfluenceCallCount,
    initialCount,
    "updateAnchorsInfluence should not be called for unchanged influence",
  );
});

test("should update influence from zero to positive value", () => {
  const tree = new AnimationTreeProxy();
  assert.equal(tree.influence, 0);

  const value = 1;
  tree.invokeSetInfluence(value);

  assert.equal(tree.influence, value);
  assert.ok(
    tree.updateAnchorsInfluenceCallCount > 0,
    "updateAnchorsInfluence should be called",
  );
});

test("should start animation when combined weight becomes positive", () => {
  const anchor = buildMockAnchor(0.5);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(0.8);

  let playEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  tree.on(StateEvent.PLAY, (action, state) => {
    playEventFired = true;
    eventAction = action;
    eventState = state;
  });

  tree.invokeUpdateAnchor(anchor, 0.5);

  const expectedWeight = 0.5 * 0.8; // weight * influence

  assert.ok(playEventFired, "PLAY event should be emitted");
  assert.equal(
    eventAction,
    anchor.action,
    "Event should include the animation action",
  );
  assert.equal(eventState, tree, "Event should include the animation tree");
  assert.equal(anchor.action.weight, expectedWeight);
  assert.equal(anchor.weight, 0.5);
  assert.equal(anchor.action.time, 0);
  assert.equal(anchor.previousTime, 0);
  assert.equal(anchor.hasFiredIterationEvent, false);
  assert.ok(anchor.action.isRunning(), "Animation should be playing");
});

test("should stop animation when combined weight becomes zero", () => {
  const anchor = buildMockAnchor(0.5);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(0.8);

  tree.invokeUpdateAnchor(anchor, 0.5);
  anchor.action.time = 0.3; // Simulate some progress

  let stopEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  tree.on(StateEvent.STOP, (action, state) => {
    stopEventFired = true;
    eventAction = action;
    eventState = state;
  });

  tree.invokeUpdateAnchor(anchor, 0); // Stop animation

  assert.ok(stopEventFired, "STOP event should be emitted");
  assert.equal(
    eventAction,
    anchor.action,
    "Event should include the animation action",
  );
  assert.equal(eventState, tree, "Event should include the animation tree");
  assert.equal(anchor.action.weight, 0);
  assert.equal(anchor.weight, 0);
  assert.equal(anchor.action.time, 0);
  assert.equal(anchor.previousTime, 0);
  assert.equal(anchor.hasFiredIterationEvent, false);
  assert.not.ok(anchor.action.isRunning(), "Animation should be stopped");
});

test("should update weight without play/stop when animation is already running", () => {
  const anchor = buildMockAnchor(0.5);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(0.8);

  // Start animation
  tree.invokeUpdateAnchor(anchor, 0.5);
  const initialPlayingState = anchor.action.isRunning();

  let eventFired = false;
  tree.on(StateEvent.PLAY, () => {
    eventFired = true;
  });
  tree.on(StateEvent.STOP, () => {
    eventFired = true;
  });

  // Update weight while running
  tree.invokeUpdateAnchor(anchor, 0.7);

  const expectedWeight = 0.7 * 0.8; // new weight * influence

  assert.equal(anchor.action.weight, expectedWeight);
  assert.equal(anchor.weight, 0.7);
  assert.equal(
    anchor.action.isRunning(),
    initialPlayingState,
    "Playing state should remain unchanged",
  );
  assert.not.ok(
    eventFired,
    "No play/stop events should be fired for weight updates",
  );
});

test("should skip update when combined weight equals current action weight", () => {
  const anchor = buildMockAnchor(0.5);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(0.8);

  // Set initial state
  const combinedWeight = 0.5 * 0.8;
  anchor.action.weight = combinedWeight;
  const initialWeight = anchor.weight;

  let eventFired = false;
  tree.on(StateEvent.PLAY, () => {
    eventFired = true;
  });
  tree.on(StateEvent.STOP, () => {
    eventFired = true;
  });

  tree.invokeUpdateAnchor(anchor, 0.5); // Same combined weight

  assert.equal(
    anchor.action.weight,
    combinedWeight,
    "Action weight should remain unchanged",
  );
  assert.equal(
    anchor.weight,
    initialWeight,
    "Anchor weight should remain unchanged",
  );
  assert.not.ok(
    eventFired,
    "No events should be fired when weight is unchanged",
  );
});

test("should use anchor's current weight when weight parameter is not provided", () => {
  const anchor = buildMockAnchor(0.6);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(0.5);

  tree.invokeUpdateAnchor(anchor); // No weight parameter

  const expectedWeight = 0.6 * 0.5; // anchor.weight * influence

  assert.equal(anchor.action.weight, expectedWeight);
  assert.equal(anchor.weight, 0.6, "Anchor weight should remain unchanged");
});

test("should handle zero influence correctly", () => {
  const anchor = buildMockAnchor(0.8);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(0);

  tree.invokeUpdateAnchor(anchor, 0.8);

  assert.equal(
    anchor.action.weight,
    0,
    "Combined weight should be zero when influence is zero",
  );
  assert.equal(
    anchor.weight,
    0.8,
    "Anchor weight should be set to provided weight",
  );
});

test("should handle maximum values correctly", () => {
  const anchor = buildMockAnchor(1);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(1.0);

  tree.invokeUpdateAnchor(anchor, 1.0);

  assert.equal(
    anchor.action.weight,
    1.0,
    "Combined weight should be 1.0 when both influence and weight are 1.0",
  );
  assert.equal(anchor.weight, 1.0);
});

// Integration tests
test("should properly combine influence and weight calculations", () => {
  const anchor1 = buildMockAnchor(0.3);
  const anchor2 = buildMockAnchor(0.7);
  const tree = new AnimationTreeProxy();

  tree.invokeSetInfluence(0.6);

  assert.equal(
    anchor1.action.weight,
    0.3 * 0.6,
    "First anchor should have correct combined weight",
  );
  assert.equal(
    anchor2.action.weight,
    0.7 * 0.6,
    "Second anchor should have correct combined weight",
  );
});

test("should handle multiple anchor updates with different weights", () => {
  const anchor1 = buildMockAnchor();
  const anchor2 = buildMockAnchor();
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(0.8);

  let playEventCount = 0;
  tree.on(StateEvent.PLAY, () => {
    playEventCount++;
  });

  tree.invokeUpdateAnchor(anchor1, 0.4);
  tree.invokeUpdateAnchor(anchor2, 0.6);

  assert.equal(playEventCount, 2, "PLAY event should fire for each anchor");
  assert.equal(anchor1.action.weight, 0.4 * 0.8);
  assert.equal(anchor2.action.weight, 0.6 * 0.8);
});

test("should emit events with correct parameters", () => {
  const anchor = buildMockAnchor();
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(0.7);

  let playAction: any = null;
  let playState: any = null;
  let stopAction: any = null;
  let stopState: any = null;

  tree.on(StateEvent.PLAY, (action, state) => {
    playAction = action;
    playState = state;
  });

  tree.on(StateEvent.STOP, (action, state) => {
    stopAction = action;
    stopState = state;
  });

  // Start animation
  tree.invokeUpdateAnchor(anchor, 0.5);

  assert.equal(
    playAction,
    anchor.action,
    "PLAY event should pass correct action",
  );
  assert.equal(playState, tree, "PLAY event should pass correct state");

  // Stop animation
  tree.invokeUpdateAnchor(anchor, 0);

  assert.equal(
    stopAction,
    anchor.action,
    "STOP event should pass correct action",
  );
  assert.equal(stopState, tree, "STOP event should pass correct state");
});

test.run();
