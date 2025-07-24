import type { AnimationAction } from "three";
import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
import { assertEqualWithTolerance } from "./miscellaneous/miscellaneous";
import { buildMockFreeformAction } from "./mocks/buildMockAction";
import { FreeformBlendTreeProxy } from "./proxies/FreeformBlendTreeProxy";

test("constructor: should throw error when fewer than 2 actions provided", () => {
  assert.throws(
    () => new FreeformBlendTreeProxy([buildMockFreeformAction(0, 0)]),
    /at least 3/,
  );
});

test("constructor: should throw error when action duration is less than or equal to zero", () => {
  assert.throws(() => {
    new FreeformBlendTreeProxy([
      buildMockFreeformAction(0, 0, LoopRepeat, 1),
      buildMockFreeformAction(1, 0, LoopRepeat, 0),
      buildMockFreeformAction(0, 1, LoopRepeat, 1),
    ]);
  }, "Action duration must be greater than zero");
});

test("constructor: should throw error for invalid freeform action values", () => {
  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(NaN, 0),
        buildMockFreeformAction(1, 1),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(Infinity, 0),
        buildMockFreeformAction(1, 1),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(-Infinity, 0),
        buildMockFreeformAction(1, 1),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(Number.MAX_SAFE_INTEGER + 1, 0),
        buildMockFreeformAction(1, 1),
      ]),
    /value exceeds maximum safe integer range/,
  );

  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(-Number.MAX_SAFE_INTEGER - 1, 0),
        buildMockFreeformAction(1, 1),
      ]),
    /value exceeds maximum safe integer range/,
  );

  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(0, NaN),
        buildMockFreeformAction(1, 1),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(0, Infinity),
        buildMockFreeformAction(1, 1),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(0, -Infinity),
        buildMockFreeformAction(1, 1),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(0, Number.MAX_SAFE_INTEGER + 1),
        buildMockFreeformAction(1, 1),
      ]),
    /value exceeds maximum safe integer range/,
  );

  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(0, -Number.MAX_SAFE_INTEGER - 1),
        buildMockFreeformAction(1, 1),
      ]),
    /value exceeds maximum safe integer range/,
  );
});

test("constructor: should throw error when multiple actions have same value", () => {
  assert.throws(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0.5, 1),
        buildMockFreeformAction(0.5, 0),
        buildMockFreeformAction(0.5, 1),
      ]),
    /Duplicate coordinates found/,
  );
});

test("constructor: should initialize actions to stopped state", () => {
  const action1 = buildMockFreeformAction(0, 1);
  const action2 = buildMockFreeformAction(1, 0);
  const action3 = buildMockFreeformAction(0, 0);

  action1.action.play();
  action2.action.play();
  action3.action.play();

  action1.action.time = 0.5;
  action1.action.weight = 0.7;
  action2.action.time = 0.3;
  action2.action.weight = 0.4;
  action3.action.time = 0.2;
  action3.action.weight = 0.6;

  new FreeformBlendTreeProxy([action1, action2, action3]);

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

test("setInfluence: should throw error for invalid influence values", () => {
  const tree = new FreeformBlendTreeProxy([
    buildMockFreeformAction(0, 1),
    buildMockFreeformAction(1, 0),
    buildMockFreeformAction(0, 0),
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
  const action1 = buildMockFreeformAction(0, 0);
  const action2 = buildMockFreeformAction(1, 0);
  const action3 = buildMockFreeformAction(0, 1);
  const blendTree = new FreeformBlendTreeProxy([action1, action2, action3]);

  assert.throws(
    () => blendTree.setBlend(NaN, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(Infinity, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(-Infinity, 0),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(Number.MAX_SAFE_INTEGER + 1, 0),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => blendTree.setBlend(-Number.MAX_SAFE_INTEGER - 1, 0),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => blendTree.setBlend(0, NaN),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(0, Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(0, -Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(0, Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => blendTree.setBlend(0, -Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
});

test("setBlend: should skip update when blend value unchanged", () => {
  const action1 = buildMockFreeformAction(0, 0);
  const action2 = buildMockFreeformAction(1, 0);
  const action3 = buildMockFreeformAction(0, 1);
  const blendTree = new FreeformBlendTreeProxy([action1, action2, action3]);
  blendTree.invokeSetInfluence(1);

  const x = 0.5;
  const y = 1;

  blendTree.setBlend(x, y);
  const initialWeight1 = action1.action.weight;
  const initialWeight2 = action2.action.weight;
  const initialWeight3 = action3.action.weight;

  blendTree.setBlend(x, y);

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
  assertEqualWithTolerance(
    action3.action.weight,
    initialWeight3,
    "action3 weight should remain unchanged",
  );
});

// test("setBlend: three actions: beyond left: should clamp to leftmost action", () => {
//   testLinearBlending(
//     -2,
//     "left action should have weight 1",
//     "center action should have weight 0",
//     "right action should have weight 0",
//   );
// });

// test("setBlend: three actions: exact left: should give full weight to leftmost action", () => {
//   testLinearBlending(
//     -1,
//     "left action should have weight 1",
//     "center action should have weight 0",
//     "right action should have weight 0",
//   );
// });

// test("setBlend: three actions: between left and center: should interpolate between left and center actions", () => {
//   testLinearBlending(
//     -0.5,
//     "left action should have weight 0.5",
//     "center action should have weight 0.5",
//     "right action should have weight 0",
//   );
// });

// test("setBlend: three actions: exact center: should give full weight to center action", () => {
//   testLinearBlending(
//     0,
//     "left action should have weight 0",
//     "center action should have weight 1",
//     "right action should have weight 0",
//   );
// });

// test("setBlend: three actions: between center and right: should interpolate between center and right actions", () => {
//   testLinearBlending(
//     0.5,
//     "left action should have weight 0",
//     "center action should have weight 0.5",
//     "right action should have weight 0.5",
//   );
// });

// test("setBlend: three actions: exact right: should give full weight to rightmost action", () => {
//   testLinearBlending(
//     1,
//     "left action should have weight 0",
//     "center action should have weight 0",
//     "right action should have weight 1",
//   );
// });

// test("setBlend: three actions: beyond right: should clamp to rightmost action", () => {
//   testLinearBlending(
//     2,
//     "left action should have weight 0",
//     "center action should have weight 0",
//     "right action should have weight 1",
//   );
// });

test("events: should emit ENTER/EXIT events", () => {
  const action1 = buildMockFreeformAction(0, 1);
  const action2 = buildMockFreeformAction(1, 0);
  const action3 = buildMockFreeformAction(0, 0);

  const blendTree = new FreeformBlendTreeProxy([action1, action2, action3]);

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
    "ENTER event should be fired after invoking onEnter",
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
    "EXIT event should be fired after invoking onExit",
  );
  assert.equal(exitState, blendTree, "EXIT event should provide the state");
});

test("events: should emit correct FINISH/ITERATE event based on animation loop mode", () => {
  const loopOnceAction = buildMockFreeformAction(0, 0, LoopOnce);
  const loopRepeatAction = buildMockFreeformAction(0, 1, LoopRepeat);
  const loopPingPongAction = buildMockFreeformAction(1, 0, LoopPingPong);

  const blendTree = new FreeformBlendTreeProxy([
    loopOnceAction,
    loopRepeatAction,
    loopPingPongAction,
  ]);

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

  loopOnceAction.action.time = 1;
  loopRepeatAction.action.time = 0;
  loopPingPongAction.action.time = 0;
  blendTree.invokeOnTick();

  loopOnceAction.action.time = 0;
  loopRepeatAction.action.time = 1;
  loopPingPongAction.action.time = 0;
  blendTree.invokeOnTick();

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
  const action = buildMockFreeformAction(0, 0);
  const blendTree = new FreeformBlendTreeProxy([
    action,
    buildMockFreeformAction(1, 0),
    buildMockFreeformAction(0, 1),
  ]);

  let eventCount = 0;
  blendTree.on(StateEvent.ITERATE, () => {
    eventCount += 1;
  });

  action.action.time = 1.0;
  blendTree.invokeOnTick();
  blendTree.invokeOnTick();

  assert.equal(
    eventCount,
    1,
    "Iteration event should only fire once per animation cycle",
  );
});

test("events: should start animation and emit PLAY when influence becomes positive", () => {
  const mockAction = buildMockFreeformAction(0, 0);
  const blendTree = new FreeformBlendTreeProxy([
    mockAction,
    buildMockFreeformAction(1, 0),
    buildMockFreeformAction(0, 1),
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
  const mockAction = buildMockFreeformAction(0, 0);
  const blendTree = new FreeformBlendTreeProxy([
    mockAction,
    buildMockFreeformAction(1, 0),
    buildMockFreeformAction(0, 1),
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
