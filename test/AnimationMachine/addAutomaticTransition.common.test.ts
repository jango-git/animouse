import { test } from "uvu";
import * as assert from "uvu/assert";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("addAutomaticTransition: common: should throw error for invalid duration values", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  assert.throws(
    () => machine.addAutomaticTransition(from, { to, duration: NaN }),
    /value must be a finite number/,
  );
  assert.throws(
    () => machine.addAutomaticTransition(from, { to, duration: Infinity }),
    /value must be a finite number/,
  );
  assert.throws(
    () => machine.addAutomaticTransition(from, { to, duration: -Infinity }),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      machine.addAutomaticTransition(from, {
        to,
        duration: Number.MAX_SAFE_INTEGER + 1,
      }),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () =>
      machine.addAutomaticTransition(from, {
        to,
        duration: -Number.MAX_SAFE_INTEGER - 1,
      }),
    /value exceeds maximum safe integer range/,
  );
});

test("addAutomaticTransition: common: should throw error when adding duplicate transition", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const transition = { to, duration: 0.25 };
  machine.addAutomaticTransition(from, transition);

  assert.throws(
    () => machine.addAutomaticTransition(from, transition),
    /already exists/,
  );
});

test("addAutomaticTransition: common: should throw error when creating self-loop transition", () => {
  const from = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  assert.throws(
    () => machine.addAutomaticTransition(from, { to: from, duration: 0.25 }),
    /loop/,
  );
});

test.run();
