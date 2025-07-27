import { test } from "uvu";
import * as assert from "uvu/assert";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("handleEvent: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const duration = 0.25;
  const userData0 = 24;
  const userData1 = NaN;
  const userData2 = undefined;
  const userData3 = null;
  const userData4 = {};
  const userData5 = "string";
  const userData6 = false;

  let conditionCalled = false;
  let receivedFromState: any = null;
  let receivedToState: any = null;
  let receivedUserData0: any = null;
  let receivedUserData1: any = null;
  let receivedUserData2: any = null;
  let receivedUserData3: any = null;
  let receivedUserData4: any = null;
  let receivedUserData5: any = null;
  let receivedUserData6: any = null;

  machine.addDataTransition(from, {
    to,
    duration,
    data: [
      userData0,
      userData1,
      userData2,
      userData3,
      userData4,
      userData5,
      userData6,
    ],
    condition: (
      from,
      to,
      userData0,
      userData1,
      userData2,
      userData3,
      userData4,
      userData5,
      userData6,
    ) => {
      conditionCalled = true;
      receivedFromState = from;
      receivedToState = to;
      receivedUserData0 = userData0;
      receivedUserData1 = userData1;
      receivedUserData2 = userData2;
      receivedUserData3 = userData3;
      receivedUserData4 = userData4;
      receivedUserData5 = userData5;
      receivedUserData6 = userData6;
      return true;
    },
  });
  machine.update(duration);

  assertEqualWithTolerance(from.influence, 0, "from state influence");
  assertEqualWithTolerance(to.influence, 1, "to state influence");
  assert.equal(machine.currentState, to, "...");
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
  assert.equal(
    receivedUserData2,
    userData2,
    "condition should receive correct user data",
  );
  assert.equal(
    receivedUserData3,
    userData3,
    "condition should receive correct user data",
  );
  assert.equal(
    receivedUserData4,
    userData4,
    "condition should receive correct user data",
  );
  assert.equal(
    receivedUserData5,
    userData5,
    "condition should receive correct user data",
  );
  assert.equal(
    receivedUserData6,
    userData6,
    "condition should receive correct user data",
  );
});

test.run();
