import { test } from "uvu";
import * as assert from "uvu/assert";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("handleEvent: ...", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const duration = 0.25;
  machine.addEventTransition(event, {
    from,
    to,
    duration,
  });
  const result = machine.handleEvent(event);

  assert.equal(result, true, "...");
});

test("handleEvent: ...", () => {
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
  const result = machine.handleEvent(event);

  assert.equal(result, true, "...");
});

test("handleEvent: ...", () => {
  const from = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
  const result = machine.handleEvent(event);

  assert.equal(result, false, "...");
});

test("handleEvent: ...", () => {
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
  const result = machine.handleEvent(event);

  assert.equal(result, false, "...");
});

test("handleEvent: should pass multiple user data parameters to condition function", () => {
  const from = new AnimationTreeProxy();
  const to = new AnimationTreeProxy();
  const machine = new AnimationMachineProxy(from, MIXER);

  const event = "test";
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
  let receivedEvent: any = null;
  let receivedUserData0: any = null;
  let receivedUserData1: any = null;
  let receivedUserData2: any = null;
  let receivedUserData3: any = null;
  let receivedUserData4: any = null;
  let receivedUserData5: any = null;
  let receivedUserData6: any = null;

  machine.addEventTransition(event, {
    from,
    to,
    duration,
    condition: (
      from,
      to,
      event,
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
      receivedEvent = event;
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
  machine.handleEvent(
    event,
    userData0,
    userData1,
    userData2,
    userData3,
    userData4,
    userData5,
    userData6,
  );

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
    receivedEvent,
    event,
    "condition should receive correct event name",
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
