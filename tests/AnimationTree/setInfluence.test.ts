import { expect, test } from "vitest";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("setInfluence: should throw error for invalid influence values", () => {
  const tree = new AnimationTreeProxy();

  expect(() => {
    tree.invokeSetInfluence(NaN);
  }).toThrow(/value must be a finite number/);
  expect(() => {
    tree.invokeSetInfluence(Infinity);
  }).toThrow(/value must be a finite number/);
  expect(() => {
    tree.invokeSetInfluence(-Infinity);
  }).toThrow(/value must be a finite number/);
  expect(() => {
    tree.invokeSetInfluence(Number.MAX_SAFE_INTEGER + 1);
  }).toThrow(/value exceeds maximum safe integer range/);
  expect(() => {
    tree.invokeSetInfluence(-Number.MAX_SAFE_INTEGER - 1);
  }).toThrow(/value exceeds maximum safe integer range/);
  expect(() => {
    tree.invokeSetInfluence(-0.1);
  }).toThrow(/value must be between 0 and 1/);
  expect(() => {
    tree.invokeSetInfluence(1.1);
  }).toThrow(/value must be between 0 and 1/);
});

test("setInfluence: should update influence from zero to positive value", () => {
  const tree = new AnimationTreeProxy();

  const initialInfluence = 0;
  tree.invokeSetInfluence(initialInfluence);
  expect(tree.influence).toEqual(initialInfluence);

  const newInfluence = 0.75;
  tree.invokeSetInfluence(newInfluence);

  expect(tree.influence).toEqual(newInfluence);
  expect(
    tree.updateAnchorsInfluenceCallCount > 0,
    "updateAnchorsInfluence should be called",
  ).toBeTruthy();
});

test("setInfluence: should update influence from positive value to zero", () => {
  const tree = new AnimationTreeProxy();

  const initialInfluence = 0.25;
  tree.invokeSetInfluence(initialInfluence);
  expect(tree.influence).toEqual(initialInfluence);

  const newInfluence = 0;
  tree.invokeSetInfluence(newInfluence);

  expect(tree.influence).toEqual(newInfluence);
  expect(
    tree.updateAnchorsInfluenceCallCount > 0,
    "updateAnchorsInfluence should be called",
  ).toBeTruthy();
});

test("setInfluence: should update influence from positive value to positive value", () => {
  const tree = new AnimationTreeProxy();

  const initialInfluence = 0.25;
  tree.invokeSetInfluence(initialInfluence);
  expect(tree.influence).toEqual(initialInfluence);

  const newInfluence = 0.75;
  tree.invokeSetInfluence(newInfluence);

  expect(tree.influence).toEqual(newInfluence);
  expect(
    tree.updateAnchorsInfluenceCallCount > 0,
    "updateAnchorsInfluence should be called",
  ).toBeTruthy();
});

test("setInfluence: should not update anchors influence when influence value is unchanged", () => {
  const tree = new AnimationTreeProxy();
  const influence = 0.5;

  tree.invokeSetInfluence(influence);
  const initialCount = tree.updateAnchorsInfluenceCallCount;
  tree.invokeSetInfluence(influence);

  expect(
    tree.updateAnchorsInfluenceCallCount,
    "updateAnchorsInfluence should not be called for unchanged influence",
  ).toEqual(initialCount);
});
