import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("constructor: ...", () => {
  const tree = new AnimationTreeProxy();
  new AnimationMachineProxy(tree, MIXER);

  assertEqualWithTolerance(tree.influence, 1);
});

test("constructor: ...", () => {
  const tree = new AnimationTreeProxy();

  let isEventFired = false;
  tree.on(StateEvent.ENTER, () => {
    isEventFired = true;
  });

  new AnimationMachineProxy(tree, MIXER);

  assert.ok(isEventFired, "...");
});

test("constructor: ...", () => {
  const tree = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(tree, MIXER);

  assert.equal(machine.currentState, tree, "...");
});

test.run();
