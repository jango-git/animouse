import { test } from "uvu";
import * as assert from "uvu/assert";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("addAutomaticTransition: common: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0;
  machine.addAutomaticTransition(from, { to, duration });
  from.invokeIterateEvent();
  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test("addAutomaticTransition: common: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0;
  machine.addAutomaticTransition(from, { to, duration });
  from.invokeFinishEvent();
  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test("addAutomaticTransition: common: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0.25;
  machine.addAutomaticTransition(from, { to, duration });
  from.invokeIterateEvent();
  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test("addAutomaticTransition: common: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0.25;
  machine.addAutomaticTransition(from, { to, duration });
  from.invokeFinishEvent();
  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test.run();
