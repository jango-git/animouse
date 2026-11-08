import { expect, test } from "vitest";
import { AnimationStateEvent } from "../../src/miscellaneous/AnimationStateEvent";
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
  tree.on(AnimationStateEvent.ENTER, () => {
    isEventFired = true;
  });

  new AnimationMachineProxy(tree, MIXER);

  expect(isEventFired, "ENTER event should be fired for initial state").toBeTruthy();
});

test("constructor: should set current state to initial state", () => {
  const tree = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(tree, MIXER);

  expect(machine.currentState, "current state should be the initial state").toEqual(tree);
});
