import { test } from "uvu";
import * as assert from "uvu/assert";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("setInfluence: should throw error for invalid influence values", () => {
  const tree = new AnimationTreeProxy();

  assert.throws(() => {
    tree.invokeSetInfluence(NaN);
  }, /value must be a finite number/);
  assert.throws(() => {
    tree.invokeSetInfluence(Infinity);
  }, /value must be a finite number/);
  assert.throws(() => {
    tree.invokeSetInfluence(-Infinity);
  }, /value must be a finite number/);
  assert.throws(() => {
    tree.invokeSetInfluence(Number.MAX_SAFE_INTEGER + 1);
  }, /value exceeds maximum safe integer range/);
  assert.throws(() => {
    tree.invokeSetInfluence(-Number.MAX_SAFE_INTEGER - 1);
  }, /value exceeds maximum safe integer range/);
  assert.throws(() => {
    tree.invokeSetInfluence(-0.1);
  }, /value must be between 0 and 1/);
  assert.throws(() => {
    tree.invokeSetInfluence(1.1);
  }, /value must be between 0 and 1/);
});

test("setInfluence: should update influence from zero to positive value", () => {
  const tree = new AnimationTreeProxy();

  const initialInfluence = 0;
  tree.invokeSetInfluence(initialInfluence);
  assert.equal(tree.influence, initialInfluence);

  const newInfluence = 0.75;
  tree.invokeSetInfluence(newInfluence);

  assert.equal(tree.influence, newInfluence);
  assert.ok(
    tree.updateAnchorsInfluenceCallCount > 0,
    "updateAnchorsInfluence should be called",
  );
});

test("setInfluence: should update influence from positive value to zero", () => {
  const tree = new AnimationTreeProxy();

  const initialInfluence = 0.25;
  tree.invokeSetInfluence(initialInfluence);
  assert.equal(tree.influence, initialInfluence);

  const newInfluence = 0;
  tree.invokeSetInfluence(newInfluence);

  assert.equal(tree.influence, newInfluence);
  assert.ok(
    tree.updateAnchorsInfluenceCallCount > 0,
    "updateAnchorsInfluence should be called",
  );
});

test("setInfluence: should update influence from positive value to positive value", () => {
  const tree = new AnimationTreeProxy();

  const initialInfluence = 0.25;
  tree.invokeSetInfluence(initialInfluence);
  assert.equal(tree.influence, initialInfluence);

  const newInfluence = 0.75;
  tree.invokeSetInfluence(newInfluence);

  assert.equal(tree.influence, newInfluence);
  assert.ok(
    tree.updateAnchorsInfluenceCallCount > 0,
    "updateAnchorsInfluence should be called",
  );
});

test("setInfluence: should not update anchors influence when influence value is unchanged", () => {
  const tree = new AnimationTreeProxy();
  const influence = 0.5;

  tree.invokeSetInfluence(influence);
  const initialCount = tree.updateAnchorsInfluenceCallCount;
  tree.invokeSetInfluence(influence);

  assert.equal(
    tree.updateAnchorsInfluenceCallCount,
    initialCount,
    "updateAnchorsInfluence should not be called for unchanged influence",
  );
});

test.run();
