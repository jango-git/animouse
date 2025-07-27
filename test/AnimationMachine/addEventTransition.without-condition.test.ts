import { test } from "uvu";
import * as assert from "uvu/assert";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("addEventTransition: without condition: should transition with zero duration", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0;

  machine.addEventTransition(event, { to, duration });
  machine.handleEvent(event);

  assert.equal(
    machine.currentState,
    to,
    "current state should be 'to' after event",
  );

  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test("addEventTransition: without condition: should transition completely after full duration", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0.25;

  machine.addEventTransition(event, { to, duration });
  machine.handleEvent(event);

  assert.equal(
    machine.currentState,
    to,
    "current state should be 'to' after event",
  );

  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test("addEventTransition: without condition: should transition immediately with zero duration and explicit from state", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0;

  machine.addEventTransition(event, { from, to, duration });
  machine.handleEvent(event);

  assert.equal(
    machine.currentState,
    to,
    "current state should be 'to' after event",
  );

  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test("addEventTransition: without condition: should transition completely after full duration with explicit from state", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0.25;

  machine.addEventTransition(event, { from, to, duration });
  machine.handleEvent(event);

  assert.equal(
    machine.currentState,
    to,
    "current state should be 'to' after event",
  );

  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test("addEventTransition: without condition: should have equal influence at half duration", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0.25;

  machine.addEventTransition(event, { from, to, duration });
  machine.handleEvent(event);

  assert.equal(
    machine.currentState,
    to,
    "current state should be 'to' after event",
  );

  machine.update(duration / 2);

  assertEqualWithTolerance(from.influence, 0.5, "from state influence");
  assertEqualWithTolerance(to.influence, 0.5, "to state influence");
  assert.equal(machine.currentState, to, "...");
});

test.run();
