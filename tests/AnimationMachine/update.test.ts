import { expect, test } from "vitest";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("update: should throw error for invalid delta time values", () => {
  const from = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  expect(() => machine.update(NaN)).toThrow(/value must be a finite number/);
  expect(() => machine.update(Infinity)).toThrow(/value must be a finite number/);
  expect(() => machine.update(-Infinity)).toThrow(/value must be a finite number/);
  expect(() => machine.update(Number.MAX_SAFE_INTEGER + 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
  expect(() => machine.update(-Number.MAX_SAFE_INTEGER - 1)).toThrow(
    /value exceeds maximum safe integer range/,
  );
});
