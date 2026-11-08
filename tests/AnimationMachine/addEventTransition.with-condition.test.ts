import { expect, test } from "vitest";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("addEventTransition: with condition: should transition when condition returns true with zero duration", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0;

  machine.addEventTransition(event, { to, duration, condition: () => true });
  machine.handleEvent(event);

  expect(machine.currentState, "current state should be 'to' after event").toEqual(to);

  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  expect(machine.currentState, "current state should be 'to' after transition").toEqual(to);
});

test("addEventTransition: with condition: should transition when condition returns true after full duration", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0.25;

  machine.addEventTransition(event, { to, duration, condition: () => true });
  machine.handleEvent(event);

  expect(machine.currentState, "current state should be 'to' after event").toEqual(to);

  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  expect(machine.currentState, "current state should be 'to' after transition").toEqual(to);
});

test("addEventTransition: with condition: should transition when condition returns true with zero duration and explicit from state", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0;

  machine.addEventTransition(event, {
    from,
    to,
    duration,
    condition: () => true,
  });
  machine.handleEvent(event);

  expect(machine.currentState, "current state should be 'to' after event").toEqual(to);

  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  expect(machine.currentState, "current state should be 'to' after transition").toEqual(to);
});

test("addEventTransition: with condition: should transition when condition returns true after full duration with explicit from state", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0.25;

  machine.addEventTransition(event, {
    from,
    to,
    duration,
    condition: () => true,
  });
  machine.handleEvent(event);

  expect(machine.currentState, "current state should be 'to' after event").toEqual(to);

  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  expect(machine.currentState, "current state should be 'to' after transition").toEqual(to);
});

test("addEventTransition: with condition: should have equal influence at half duration when condition returns true", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0.25;

  machine.addEventTransition(event, {
    from,
    to,
    duration,
    condition: () => true,
  });
  machine.handleEvent(event);

  expect(machine.currentState, "current state should be 'to' after event").toEqual(to);

  machine.update(duration / 2);

  assertEqualWithTolerance(from.influence, 0.5, "from state influence");
  assertEqualWithTolerance(to.influence, 0.5, "to state influence");
  expect(machine.currentState, "current state should be 'to' after transition").toEqual(to);
});

test("addEventTransition: with condition: should not transition when condition returns false", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0.25;

  machine.addEventTransition(event, {
    from,
    to,
    duration,
    condition: () => false,
  });
  machine.handleEvent(event);

  expect(machine.currentState, "current state should be 'from' after event").toEqual(from);

  machine.update(duration);

  assertEqualWithTolerance(from.influence, 1, "from state influence");
  assertEqualWithTolerance(to.influence, 0, "to state influence");
  expect(
    machine.currentState,
    "current state should remain 'from' when condition is false",
  ).toEqual(from);
});

test("addEventTransition: with condition: should pass correct parameters to condition function", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0.25;
  const userData0 = 24;
  const userData1 = 42;

  let conditionCalled = false;
  let receivedFromState: any = null;
  let receivedToState: any = null;
  let receivedEvent: any = null;
  let receivedUserData0: any = null;
  let receivedUserData1: any = null;

  machine.addEventTransition(event, {
    from,
    to,
    duration,
    condition: (from, to, event, userData0, userData1) => {
      conditionCalled = true;
      receivedFromState = from;
      receivedToState = to;
      receivedEvent = event;
      receivedUserData0 = userData0;
      receivedUserData1 = userData1;
      return true;
    },
  });
  machine.handleEvent(event, userData0, userData1);

  expect(conditionCalled, "condition function should be called").toBeTruthy();
  expect(receivedFromState, "condition should receive correct from state").toEqual(from);
  expect(receivedToState, "condition should receive correct to state").toEqual(to);
  expect(receivedEvent, "condition should receive correct event name").toEqual(event);
  expect(receivedUserData0, "condition should receive correct user data").toEqual(userData0);
  expect(receivedUserData1, "condition should receive correct user data").toEqual(userData1);
});
