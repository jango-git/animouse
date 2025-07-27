import { test } from "uvu";
import * as assert from "uvu/assert";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("update: should throw error for invalid delta time values", () => {
  const from = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  assert.throws(() => machine.update(NaN), /value must be a finite number/);
  assert.throws(
    () => machine.update(Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => machine.update(-Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => machine.update(Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => machine.update(-Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
});

test.run();
