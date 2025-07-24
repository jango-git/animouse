import type { AnimationAction } from "three";
import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
import {
  assertEqualWithTolerance,
  lerpLinear,
} from "./miscellaneous/miscellaneous";
import { buildMockLinearAction } from "./mocks/buildMockAction";
import { LinearBlendTreeProxy } from "./proxies/LinearBlendTreeProxy";

function testLinearBlending(
  value: number,
  lMessage: string,
  cMessage: string,
  rMessage: string,
): void {
  const lValue = -1;
  const cValue = 0;
  const rValue = 1;

  const lAction = buildMockLinearAction(lValue);
  const cAction = buildMockLinearAction(cValue);
  const rAction = buildMockLinearAction(rValue);

  const blendTree = new LinearBlendTreeProxy([lAction, cAction, rAction]);
  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(value);

  const clampedValue = Math.min(Math.max(value, lValue), rValue);

  let lWeight = 0;
  let cWeight = 0;
  let rWeight = 0;

  if (value <= cValue) {
    const [oneWeight, twoWeight] = lerpLinear(clampedValue, lValue, cValue);
    lWeight = oneWeight;
    cWeight = twoWeight;
    rWeight = 0;
  } else {
    const [oneWeight, twoWeight] = lerpLinear(clampedValue, cValue, rValue);
    lWeight = 0;
    cWeight = oneWeight;
    rWeight = twoWeight;
  }

  assertEqualWithTolerance(lAction.action.weight, lWeight, lMessage);
  assertEqualWithTolerance(cAction.action.weight, cWeight, cMessage);
  assertEqualWithTolerance(rAction.action.weight, rWeight, rMessage);
  assertEqualWithTolerance(
    lAction.action.weight + rAction.action.weight + cAction.action.weight,
    1,
    "Sum of weights should equal 1",
  );
}

test("constructor: should throw error when fewer than 2 actions provided", () => {
  assert.throws(
    () => new LinearBlendTreeProxy([buildMockLinearAction(0)]),
    "Need at least 2 actions",
  );
});

test("constructor: should throw error when action duration is less than or equal to zero", () => {
  assert.throws(() => {
    new LinearBlendTreeProxy([
      buildMockLinearAction(1, LoopRepeat, 1),
      buildMockLinearAction(1, LoopRepeat, 0),
      buildMockLinearAction(1, LoopRepeat, 1),
    ]);
  }, "Action duration must be greater than zero");
});

test("constructor: should throw error for invalid linear action values", () => {
  assert.throws(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(0),
        buildMockLinearAction(NaN),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(0),
        buildMockLinearAction(Infinity),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(0),
        buildMockLinearAction(-Infinity),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(0),
        buildMockLinearAction(Number.MAX_SAFE_INTEGER + 1),
      ]),
    /value exceeds maximum safe integer range/,
  );

  assert.throws(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(0),
        buildMockLinearAction(-Number.MAX_SAFE_INTEGER - 1),
      ]),
    /value exceeds maximum safe integer range/,
  );
});

test("constructor: should throw error when multiple actions have same value", () => {
  assert.throws(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(0.5),
        buildMockLinearAction(0.5),
      ]),
    /Duplicate value found/,
  );
});

test("constructor: should initialize actions to stopped state", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);

  action1.action.play();
  action2.action.play();

  // Set initial non-zero values to verify they get reset
  action1.action.time = 0.5;
  action1.action.weight = 0.7;
  action2.action.time = 0.3;
  action2.action.weight = 0.4;

  new LinearBlendTreeProxy([action1, action2]);

  // Constructor should reset all actions to stopped state
  assertEqualWithTolerance(
    action1.action.time,
    0,
    "action1 should have time 0",
  );
  assertEqualWithTolerance(
    action1.action.weight,
    0,
    "action1 should have weight 0",
  );
  assert.equal(
    action1.action.isRunning(),
    false,
    "action1 should not be running",
  );
  assertEqualWithTolerance(
    action2.action.time,
    0,
    "action2 should have time 0",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    0,
    "action2 should have weight 0",
  );
  assert.equal(
    action2.action.isRunning(),
    false,
    "action2 should not be running",
  );
});

test("setInluence: should throw error for invalid influence values", () => {
  const tree = new LinearBlendTreeProxy([
    buildMockLinearAction(0),
    buildMockLinearAction(1),
  ]);

  assert.throws(() => {
    tree.invokeSetInfluence(NaN);
  }, /value must be a finite number/);
  assert.throws(() => {
    tree.invokeSetInfluence(Infinity);
  }, /value must be a finite number/);
  assert.throws(() => {
    tree.invokeSetInfluence(-Infinity);
  }, /value must be a finite number/);
  assert.throws(() => {
    tree.invokeSetInfluence(Number.MAX_SAFE_INTEGER + 1);
  }, /value exceeds maximum safe integer range/);
  assert.throws(() => {
    tree.invokeSetInfluence(-Number.MAX_SAFE_INTEGER - 1);
  }, /value exceeds maximum safe integer range/);
  assert.throws(() => {
    tree.invokeSetInfluence(-0.1);
  }, /value must be between 0 and 1/);
  assert.throws(() => {
    tree.invokeSetInfluence(1.1);
  }, /value must be between 0 and 1/);
});

test("setBlend: should throw error for invalid blend values", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);
  const blendTree = new LinearBlendTreeProxy([action1, action2]);

  assert.throws(() => blendTree.setBlend(NaN), /value must be a finite number/);
  assert.throws(
    () => blendTree.setBlend(Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(-Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => blendTree.setBlend(-Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
});

test("setBlend: should skip update when blend value unchanged", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);
  const blendTree = new LinearBlendTreeProxy([action1, action2]);
  blendTree.invokeSetInfluence(1);

  const value = 0.5;

  blendTree.setBlend(value);
  const initialWeight1 = action1.action.weight;
  const initialWeight2 = action2.action.weight;

  blendTree.setBlend(value);

  assertEqualWithTolerance(
    action1.action.weight,
    initialWeight1,
    "action1 weight should remain unchanged",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    initialWeight2,
    "action2 weight should remain unchanged",
  );
});

test("setBlend: three actions: beyond left: ...", () => {
  testLinearBlending(-2, "...l", "...c", "...r");
});

test("setBlend: three actions: exact left: ...", () => {
  testLinearBlending(-1, "...", "...", "...");
});

test("setBlend: three actions: between left and center: ...", () => {
  testLinearBlending(-0.5, "...", "...", "...");
});

test("setBlend: three actions: exact center: ...", () => {
  testLinearBlending(0, "...", "...", "...");
});

test("setBlend: three actions: between center and right: ...", () => {
  testLinearBlending(0.5, "...", "...", "...");
});

test("setBlend: three actions: exact right: ...", () => {
  testLinearBlending(1, "...", "...", "...");
});

test("setBlend: three actions: beyond right: ...", () => {
  testLinearBlending(2, "...", "...", "...");
});

test("events: should emit ENTER/EXIT events", () => {
  const blendTree = new LinearBlendTreeProxy([
    buildMockLinearAction(0),
    buildMockLinearAction(1),
  ]);

  let enterEventFired = false;
  let enterState: any = null;

  let exitEventFired = false;
  let exitState: any = null;

  blendTree.on(StateEvent.ENTER, (state) => {
    enterEventFired = true;
    enterState = state;
  });

  assert.equal(
    enterEventFired,
    false,
    "ENTER event should not be fired initially",
  );
  blendTree.invokeOnEnter();
  assert.equal(
    enterEventFired,
    true,
    "ENTER event should be fired after setting influence",
  );
  assert.equal(enterState, blendTree, "ENTER event should provide the state");

  blendTree.on(StateEvent.EXIT, (state) => {
    exitEventFired = true;
    exitState = state;
  });

  assert.equal(
    exitEventFired,
    false,
    "EXIT event should not be fired initially",
  );
  blendTree.invokeOnExit();
  assert.equal(
    exitEventFired,
    true,
    "EXIT event should be fired after setting influence",
  );
  assert.equal(exitState, blendTree, "EXIT event should provide the state");
});

test("events: should emit correct FINISH/ITERATE event based on animation loop mode", () => {
  const loopOnceAction = buildMockLinearAction(0, LoopOnce);
  const loopRepeatAction = buildMockLinearAction(0.5, LoopRepeat);
  const loopPingPongAction = buildMockLinearAction(1, LoopPingPong);

  const blendTree = new LinearBlendTreeProxy([
    loopOnceAction,
    loopRepeatAction,
    loopPingPongAction,
  ]);

  // Track which events fire for each loop mode
  let loopOnceFinishEventFired = false;
  let loopOnceIterateEventFired = false;

  let loopRepeatFinishEventFired = false;
  let loopRepeatIterateEventFired = false;

  let loopPingPongFinishEventFired = false;
  let loopPingPongIterateEventFired = false;

  blendTree.on(StateEvent.FINISH, (action: AnimationAction) => {
    if (action.loop === LoopOnce) {
      loopOnceFinishEventFired = true;
    } else if (action.loop === LoopRepeat) {
      loopRepeatFinishEventFired = true;
    } else {
      loopPingPongFinishEventFired = true;
    }
  });

  blendTree.on(StateEvent.ITERATE, (action: AnimationAction) => {
    if (action.loop === LoopOnce) {
      loopOnceIterateEventFired = true;
    } else if (action.loop === LoopRepeat) {
      loopRepeatIterateEventFired = true;
    } else {
      loopPingPongIterateEventFired = true;
    }
  });

  // Simulate LoopOnce action reaching end (time = duration)
  loopOnceAction.action.time = 1;
  loopRepeatAction.action.time = 0;
  loopPingPongAction.action.time = 0;
  blendTree.invokeOnTick();

  // Simulate LoopRepeat action reaching end (time = duration)
  loopOnceAction.action.time = 0;
  loopRepeatAction.action.time = 1;
  loopPingPongAction.action.time = 0;
  blendTree.invokeOnTick();

  // Simulate LoopPingPong action reaching end (time = duration)
  loopOnceAction.action.time = 0;
  loopRepeatAction.action.time = 0;
  loopPingPongAction.action.time = 1;
  blendTree.invokeOnTick();

  assert.ok(
    loopOnceFinishEventFired,
    "FINISH event should fire for LoopOnce animations",
  );
  assert.not.ok(
    loopOnceIterateEventFired,
    "ITERATE event should not fire for LoopOnce animations",
  );

  assert.ok(
    loopRepeatIterateEventFired,
    "ITERATE event should fire for looped animations",
  );
  assert.not.ok(
    loopRepeatFinishEventFired,
    "FINISH event should not fire for looped animations",
  );

  assert.ok(
    loopPingPongIterateEventFired,
    "ITERATE event should fire for ping-pong animations",
  );
  assert.not.ok(
    loopPingPongFinishEventFired,
    "FINISH event should not fire for ping-pong animations",
  );
});

test("events: should prevent duplicate iteration events", () => {
  const action = buildMockLinearAction(0);
  const blendTree = new LinearBlendTreeProxy([
    action,
    buildMockLinearAction(1),
  ]);

  let eventCount = 0;
  blendTree.on(StateEvent.ITERATE, () => {
    eventCount += 1;
  });

  action.action.time = 1.0;
  blendTree.invokeOnTick();
  blendTree.invokeOnTick();

  assert.equal(eventCount, 1);
});

test("events: should start animation and emit PLAY when influence becomes positive", () => {
  const mockAction = buildMockLinearAction(0);
  const blendTree = new LinearBlendTreeProxy([
    mockAction,
    buildMockLinearAction(1),
  ]);

  let playEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  blendTree.on(StateEvent.PLAY, (action, state) => {
    playEventFired = true;
    eventAction = action;
    eventState = state;
  });

  blendTree.invokeSetInfluence(0.5);

  assert.ok(playEventFired, "PLAY event should be emitted");
  assert.equal(
    eventAction,
    mockAction.action,
    "Event should include the animation action",
  );
  assert.equal(eventState, blendTree, "Event should include the clip state");
  assert.equal(mockAction.action.weight, 0.5);
  assert.ok(mockAction.action.isRunning(), "Animation should be playing");
});

test("events: should stop animation and emit STOP when influence becomes zero", () => {
  const mockAction = buildMockLinearAction(0);
  const blendTree = new LinearBlendTreeProxy([
    mockAction,
    buildMockLinearAction(1),
  ]);

  blendTree.invokeSetInfluence(0.8);
  mockAction.action.time = 0.3;

  let stopEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  blendTree.on(StateEvent.STOP, (action, state) => {
    stopEventFired = true;
    eventAction = action;
    eventState = state;
  });

  blendTree.invokeSetInfluence(0);

  assert.ok(stopEventFired, "STOP event should be emitted");
  assert.equal(
    eventAction,
    mockAction.action,
    "Event should include the animation action",
  );
  assert.equal(eventState, blendTree, "Event should include the clip state");
  assert.equal(mockAction.action.weight, 0);
  assert.not.ok(mockAction.action.isRunning(), "Animation should be stopped");
});

test.run();
