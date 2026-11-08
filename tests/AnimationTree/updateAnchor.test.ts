import { expect, test } from "vitest";
import { AnimationStateEvent } from "../../src/miscellaneous/AnimationStateEvent";
import { buildMockAnchor } from "../mocks/buildMockAnchor";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("updateAnchor: should throw error for invalid blend values", () => {
  const tree = new AnimationTreeProxy();
  const anchor = buildMockAnchor(0.5, 1);

  expect(() => {
    tree.invokeUpdateAnchor(anchor, NaN);
  }).toThrow(/value must be a finite number/);
  expect(() => {
    tree.invokeUpdateAnchor(anchor, Infinity);
  }).toThrow(/value must be a finite number/);
  expect(() => {
    tree.invokeUpdateAnchor(anchor, -Infinity);
  }).toThrow(/value must be a finite number/);
  expect(() => {
    tree.invokeUpdateAnchor(anchor, Number.MAX_SAFE_INTEGER + 1);
  }).toThrow(/value exceeds maximum safe integer range/);
  expect(() => {
    tree.invokeUpdateAnchor(anchor, -Number.MAX_SAFE_INTEGER - 1);
  }).toThrow(/value exceeds maximum safe integer range/);
  expect(() => {
    tree.invokeUpdateAnchor(anchor, -0.1);
  }).toThrow(/value must be between 0 and 1/);
  expect(() => {
    tree.invokeUpdateAnchor(anchor, 1.1);
  }).toThrow(/value must be between 0 and 1/);
});

test("updateAnchor: should update anchor's weight from zero to positive value", () => {
  const tree = new AnimationTreeProxy();
  const anchor = buildMockAnchor(0, 1);

  const value = 0.25;
  tree.invokeUpdateAnchor(anchor, value);
  expect(anchor.weight === value, "Should set anchor weight").toBeTruthy();
});

test("updateAnchor: should update anchor's weight from positive value to zero", () => {
  const tree = new AnimationTreeProxy();
  const anchor = buildMockAnchor(0.75, 1);

  const value = 0;
  tree.invokeUpdateAnchor(anchor, value);
  expect(anchor.weight === value, "Should set anchor weight").toBeTruthy();
});

test("updateAnchor: should update anchor's weight from positive value to positive value", () => {
  const tree = new AnimationTreeProxy();
  const anchor = buildMockAnchor(0.75, 1);

  const value = 0.25;
  tree.invokeUpdateAnchor(anchor, value);
  expect(anchor.weight === value, "Should set anchor weight").toBeTruthy();
});

test("updateAnchor: should update weight without play/stop when animation is already running", () => {
  const anchor = buildMockAnchor(0.5, 0);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(1);

  tree.invokeUpdateAnchor(anchor, 0.5);
  const initialPlayingState = anchor.action.isRunning();

  let anyEventFired = false;
  tree.on(AnimationStateEvent.PLAY, () => {
    anyEventFired = true;
  });
  tree.on(AnimationStateEvent.STOP, () => {
    anyEventFired = true;
  });

  tree.invokeUpdateAnchor(anchor, 0.75);
  expect(anchor.action.isRunning(), "Playing state should remain unchanged").toEqual(
    initialPlayingState,
  );
  expect(anyEventFired, "No play/stop events should be fired for weight updates").toBeFalsy();
});

test("updateAnchor: should use anchor's current weight when weight parameter is not provided", () => {
  const defaultAnchorWeight = 0.631;
  const anchor = buildMockAnchor(defaultAnchorWeight, 1);
  const tree = new AnimationTreeProxy();

  tree.invokeSetInfluence(1);
  tree.invokeUpdateAnchor(anchor);

  expect(anchor.weight, "Anchor weight should remain unchanged").toEqual(defaultAnchorWeight);
});

test("updateAnchor: should handle combined zero weight correctly", () => {
  const defaultAnchorWeight = 0.8;
  const anchor = buildMockAnchor(defaultAnchorWeight, 1);
  const tree = new AnimationTreeProxy();

  tree.invokeSetInfluence(0);
  tree.invokeUpdateAnchor(anchor, defaultAnchorWeight);

  expect(anchor.action.weight, "Combined weight should be zero when influence is zero").toEqual(0);
  expect(anchor.weight, "Anchor weight should be set to provided weight").toEqual(
    defaultAnchorWeight,
  );
});

test("updateAnchor: should handle combined maximum weight correctly", () => {
  const anchor = buildMockAnchor(1, 1);
  const tree = new AnimationTreeProxy();

  tree.invokeSetInfluence(1.0);
  tree.invokeUpdateAnchor(anchor, 1.0);

  expect(
    anchor.action.weight,
    "Combined weight should be 1.0 when both influence and weight are 1.0",
  ).toEqual(1.0);
  expect(anchor.weight).toEqual(1.0);
});
