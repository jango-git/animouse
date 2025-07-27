import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("constructor: should set initial state influence to 1", () => {
  const tree = new AnimationTreeProxy();
  new AnimationMachineProxy(tree, MIXER);

  assertEqualWithTolerance(tree.influence, 1, "tree influence");
});

test("constructor: should fire ENTER event on initial state", () => {
  const tree = new AnimationTreeProxy();

  let isEventFired = false;
  tree.on(StateEvent.ENTER, () => {
    isEventFired = true;
  });

  new AnimationMachineProxy(tree, MIXER);

  assert.ok(isEventFired, "ENTER event should be fired for initial state");
});

test("constructor: should set current state to initial state", () => {
  const tree = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(tree, MIXER);

  assert.equal(
    machine.currentState,
    tree,
    "current state should be the initial state",
  );
});

test.run();
