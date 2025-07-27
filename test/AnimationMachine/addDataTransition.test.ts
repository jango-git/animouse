import { test } from "uvu";
import * as assert from "uvu/assert";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("addDataTransition: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0;
  machine.addDataTransition(from, { to, duration, condition: () => true });
  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test("addDataTransition: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0.25;
  machine.addDataTransition(from, { to, duration, condition: () => true });
  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test("addDataTransition: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0.25;
  machine.addDataTransition(from, { to, duration, condition: () => true });
  machine.update(duration / 2);

  assertEqualWithTolerance(from.influence, 0.5, "from state influence");
  assertEqualWithTolerance(to.influence, 0.5, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test("addDataTransition: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0;
  machine.addDataTransition(from, { to, duration, condition: () => false });
  machine.update(duration);

  assertEqualWithTolerance(from.influence, 1, "from state influence");
  assertEqualWithTolerance(to.influence, 0, "to state influence");
  assert.equal(machine.currentState, from, "...");
});

test("addDataTransition: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0.25;
  machine.addDataTransition(from, { to, duration, condition: () => false });
  machine.update(duration);

  assertEqualWithTolerance(from.influence, 1, "from state influence");
  assertEqualWithTolerance(to.influence, 0, "to state influence");
  assert.equal(machine.currentState, from, "...");
});

test("addDataTransition: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0.25;
  machine.addDataTransition(from, { to, duration, condition: () => false });
  machine.update(duration / 2);

  assertEqualWithTolerance(from.influence, 1, "from state influence");
  assertEqualWithTolerance(to.influence, 0, "to state influence");
  assert.equal(machine.currentState, from, "...");
});

test("addEventTransition: condition: should pass correct parameters to condition function", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0.25;
  const userData0 = 24;
  const userData1 = 42;

  let conditionCalled = false;
  let receivedFromState: any = null;
  let receivedToState: any = null;
  let receivedUserData0: any = null;
  let receivedUserData1: any = null;

  machine.addDataTransition(from, {
    to,
    duration,
    data: [userData0, userData1],
    condition: (from, to, userData0, userData1) => {
      conditionCalled = true;
      receivedFromState = from;
      receivedToState = to;
      receivedUserData0 = userData0;
      receivedUserData1 = userData1;
      return true;
    },
  });
  machine.update(duration);

  assert.ok(conditionCalled, "condition function should be called");
  assert.equal(
    receivedFromState,
    from,
    "condition should receive correct from state",
  );
  assert.equal(
    receivedToState,
    to,
    "condition should receive correct to state",
  );
  assert.equal(
    receivedUserData0,
    userData0,
    "condition should receive correct user data",
  );
  assert.equal(
    receivedUserData1,
    userData1,
    "condition should receive correct user data",
  );
});

test.run();
