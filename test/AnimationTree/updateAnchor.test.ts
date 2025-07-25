import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import { buildMockAnchor } from "../mocks/buildMockAnchor";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("updateAnchor: should throw error for invalid blend values", () => {
  const tree = new AnimationTreeProxy();
  const anchor = buildMockAnchor(0.5, 1);

  assert.throws(() => {
    tree.invokeUpdateAnchor(anchor, NaN);
  }, /value must be a finite number/);
  assert.throws(() => {
    tree.invokeUpdateAnchor(anchor, Infinity);
  }, /value must be a finite number/);
  assert.throws(() => {
    tree.invokeUpdateAnchor(anchor, -Infinity);
  }, /value must be a finite number/);
  assert.throws(() => {
    tree.invokeUpdateAnchor(anchor, Number.MAX_SAFE_INTEGER + 1);
  }, /value exceeds maximum safe integer range/);
  assert.throws(() => {
    tree.invokeUpdateAnchor(anchor, -Number.MAX_SAFE_INTEGER - 1);
  }, /value exceeds maximum safe integer range/);
  assert.throws(() => {
    tree.invokeUpdateAnchor(anchor, -0.1);
  }, /value must be between 0 and 1/);
  assert.throws(() => {
    tree.invokeUpdateAnchor(anchor, 1.1);
  }, /value must be between 0 and 1/);
});

test("updateAnchor: should update anchor's weight from zero to positive value", () => {
  const tree = new AnimationTreeProxy();
  const anchor = buildMockAnchor(0, 1);

  const value = 0.25;
  tree.invokeUpdateAnchor(anchor, value);
  assert.ok(anchor.weight === value, "Should set anchor weight");
});

test("updateAnchor: should update anchor's weight from positive value to zero", () => {
  const tree = new AnimationTreeProxy();
  const anchor = buildMockAnchor(0.75, 1);

  const value = 0;
  tree.invokeUpdateAnchor(anchor, value);
  assert.ok(anchor.weight === value, "Should set anchor weight");
});

test("updateAnchor: should update anchor's weight from positive value to positive value", () => {
  const tree = new AnimationTreeProxy();
  const anchor = buildMockAnchor(0.75, 1);

  const value = 0.25;
  tree.invokeUpdateAnchor(anchor, value);
  assert.ok(anchor.weight === value, "Should set anchor weight");
});

test("updateAnchor: should update weight without play/stop when animation is already running", () => {
  const anchor = buildMockAnchor(0.5, 0);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(1);

  tree.invokeUpdateAnchor(anchor, 0.5);
  const initialPlayingState = anchor.action.isRunning();

  let anyEventFired = false;
  tree.on(StateEvent.PLAY, () => {
    anyEventFired = true;
  });
  tree.on(StateEvent.STOP, () => {
    anyEventFired = true;
  });

  tree.invokeUpdateAnchor(anchor, 0.75);
  assert.equal(
    anchor.action.isRunning(),
    initialPlayingState,
    "Playing state should remain unchanged",
  );
  assert.not.ok(
    anyEventFired,
    "No play/stop events should be fired for weight updates",
  );
});

test("updateAnchor: should use anchor's current weight when weight parameter is not provided", () => {
  const defaultAnchorWeight = 0.631;
  const anchor = buildMockAnchor(defaultAnchorWeight, 1);
  const tree = new AnimationTreeProxy();

  tree.invokeSetInfluence(1);
  tree.invokeUpdateAnchor(anchor);

  assert.equal(
    anchor.weight,
    defaultAnchorWeight,
    "Anchor weight should remain unchanged",
  );
});

test("updateAnchor: should handle combined zero weight correctly", () => {
  const defaultAnchorWeight = 0.8;
  const anchor = buildMockAnchor(defaultAnchorWeight, 1);
  const tree = new AnimationTreeProxy();

  tree.invokeSetInfluence(0);
  tree.invokeUpdateAnchor(anchor, defaultAnchorWeight);

  assert.equal(
    anchor.action.weight,
    0,
    "Combined weight should be zero when influence is zero",
  );
  assert.equal(
    anchor.weight,
    defaultAnchorWeight,
    "Anchor weight should be set to provided weight",
  );
});

test("updateAnchor: should handle combined maximum weight correctly", () => {
  const anchor = buildMockAnchor(1, 1);
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

test.run();
