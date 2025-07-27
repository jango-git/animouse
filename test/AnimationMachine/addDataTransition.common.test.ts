import { test } from "uvu";
import * as assert from "uvu/assert";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("addDataTransition: common: should throw error for invalid duration values", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  assert.throws(
    () =>
      machine.addDataTransition(from, {
        to,
        data: [{}],
        condition: () => true,
        duration: NaN,
      }),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      machine.addDataTransition(from, {
        to,
        data: [{}],
        condition: () => true,
        duration: Infinity,
      }),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      machine.addDataTransition(from, {
        to,
        data: [{}],
        condition: () => true,
        duration: -Infinity,
      }),
    /value must be a finite number/,
  );
  assert.throws(
    () =>
      machine.addDataTransition(from, {
        to,
        data: [{}],
        condition: () => true,
        duration: Number.MAX_SAFE_INTEGER + 1,
      }),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () =>
      machine.addDataTransition(from, {
        to,
        data: [{}],
        condition: () => true,
        duration: -Number.MAX_SAFE_INTEGER - 1,
      }),
    /value exceeds maximum safe integer range/,
  );
});

test("addDataTransition: common: should throw error when adding duplicate transition", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const transition = {
    to,
    data: [{}],
    condition: (): boolean => true,
    duration: 0.25,
  };

  machine.addDataTransition(from, transition);

  assert.throws(
    () => machine.addDataTransition(from, transition),
    /already exists/,
  );
});

test("addEventTransition: common: should throw error when creating self-loop transition", () => {
  const from = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  assert.throws(
    () =>
      machine.addDataTransition(from, {
        to: from,
        duration: 0.25,
        condition: () => true,
      }),
    /loop/,
  );
});

test.run();
