import { test } from "uvu";
import * as assert from "uvu/assert";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("addEventTransition: common: should throw error for invalid duration values", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  assert.throws(
    () => machine.addEventTransition("test", { from, to, duration: NaN }),
    /value must be a finite number/,
  );
  assert.throws(
    () => machine.addEventTransition("test", { from, to, duration: Infinity }),
    /value must be a finite number/,
  );
  assert.throws(
    () => machine.addEventTransition("test", { from, to, duration: -Infinity }),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      machine.addEventTransition("test", {
        from,
        to,
        duration: Number.MAX_SAFE_INTEGER + 1,
      }),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () =>
      machine.addEventTransition("test", {
        from,
        to,
        duration: -Number.MAX_SAFE_INTEGER - 1,
      }),
    /value exceeds maximum safe integer range/,
  );
});

test("addEventTransition: common: should throw error when adding duplicate transition without from state", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const transition = { to, duration: 0.25 };

  machine.addEventTransition(event, transition);

  assert.throws(
    () => machine.addEventTransition(event, transition),
    /already exists/,
  );
});

test("addEventTransition: common: should throw error when adding duplicate transition with from state", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const transition = { from, to, duration: 0.25 };

  machine.addEventTransition(event, transition);

  assert.throws(
    () => machine.addEventTransition(event, transition),
    /already exists/,
  );
});

test("addEventTransition: common: should throw error when creating self-loop transition", () => {
  const from = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  assert.throws(
    () =>
      machine.addEventTransition("test", { from, to: from, duration: 0.25 }),
    /loop/,
  );
});

test.run();
