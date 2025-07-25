import { test } from "uvu";
import * as assert from "uvu/assert";
import { buildMockLinearAction } from "../mocks/buildMockAction";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";

test("setInfluence: should throw error for invalid influence values", () => {
  const tree = new LinearBlendTreeProxy([
    buildMockLinearAction(0),
    buildMockLinearAction(1),
  ]);

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

test.run();
