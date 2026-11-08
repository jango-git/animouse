import { expect, test } from "vitest";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("addDataTransition: common: should throw error for invalid duration values", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  expect(() =>
    machine.addDataTransition(from, {
      to,
      data: [{}],
      condition: () => true,
      duration: NaN,
    }),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    machine.addDataTransition(from, {
      to,
      data: [{}],
      condition: () => true,
      duration: Infinity,
    }),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    machine.addDataTransition(from, {
      to,
      data: [{}],
      condition: () => true,
      duration: -Infinity,
    }),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    machine.addDataTransition(from, {
      to,
      data: [{}],
      condition: () => true,
      duration: Number.MAX_SAFE_INTEGER + 1,
    }),
  ).toThrow(/value exceeds maximum safe integer range/);
  expect(() =>
    machine.addDataTransition(from, {
      to,
      data: [{}],
      condition: () => true,
      duration: -Number.MAX_SAFE_INTEGER - 1,
    }),
  ).toThrow(/value exceeds maximum safe integer range/);
});

test("addEventTransition: common: should throw error when creating self-loop transition", () => {
  const from = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  expect(() =>
    machine.addDataTransition(from, {
      to: from,
      duration: 0.25,
      condition: () => true,
    }),
  ).toThrow(/loop/);
});
