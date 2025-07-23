import type { AnimationAction } from "three";
import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
import {
  assertEqualWithTolerance,
  lerpAngular,
} from "./miscellaneous/miscellaneous";
import { buildMockPolarAction } from "./mocks/buildMockAction";
import { buildMockAnimationAction } from "./mocks/buildMockAnimationAction";
import { PolarBlendTreeProxy } from "./proxies/PolarBlendTreeProxy";

test("constructor: should throw error when fewer than 2 actions provided", () => {
  assert.throws(
    () => new PolarBlendTreeProxy([buildMockPolarAction(1, 0)]),
    "Need at least 2 actions",
  );
});

test("constructor: should throw error when action duration is less than or equal to zero", () => {
  assert.throws(() => {
    new PolarBlendTreeProxy([
      buildMockPolarAction(1, -1, LoopRepeat, 1),
      buildMockPolarAction(1, 0, LoopRepeat, 0),
      buildMockPolarAction(1, 1, LoopRepeat, 1),
    ]);
  }, "value must be greater or equal to");

  assert.throws(() => {
    new PolarBlendTreeProxy(
      [
        buildMockPolarAction(1, -1, LoopRepeat, 1),
        buildMockPolarAction(1, 1, LoopRepeat, 1),
      ],
      buildMockAnimationAction(1, LoopRepeat, 0),
    );
  }, "value must be greater or equal to");
});

test("constructor: should throw error for invalid linear action values", () => {
  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(NaN, 1),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(Infinity, 1),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(-Infinity, 1),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(Number.MAX_SAFE_INTEGER + 1, 1),
      ]),
    /value exceeds maximum safe integer range/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(-Number.MAX_SAFE_INTEGER - 1, 1),
      ]),
    /value exceeds maximum safe integer range/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(1, NaN),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(1, Infinity),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(1, -Infinity),
      ]),
    /value must be a finite number/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(1, Number.MAX_SAFE_INTEGER + 1),
      ]),
    /value exceeds maximum safe integer range/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(1, -Number.MAX_SAFE_INTEGER - 1),
      ]),
    /value exceeds maximum safe integer range/,
  );
});

test("constructor: should throw error when multiple actions have same value", () => {
  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(0.5, 0),
        buildMockPolarAction(0.5, 0),
        buildMockPolarAction(0.5, 0),
      ]),
    /Duplicate coordinates found/,
  );
});

test("constructor: should throw error when only one ray", () => {
  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(0.5, 0),
        buildMockPolarAction(1, 0),
      ]),
    /At least two rays are required/,
  );
  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(0.5, 0),
        buildMockPolarAction(0.75, 0),
        buildMockPolarAction(1, 0),
      ]),
    /At least two rays are required/,
  );
});

test("constructor: should throw error when anchors do not form a valid grid", () => {
  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(0.5, -1),
        buildMockPolarAction(1, 1),
      ]),
    /valid grid/,
  );
});

test("constructor: should initialize actions to stopped state", () => {
  const action1 = buildMockPolarAction(1, -1);
  const action2 = buildMockPolarAction(1, 1);
  const central = buildMockAnimationAction(1);

  action1.action.play();
  action2.action.play();
  central.play();

  // Set initial non-zero values to verify they get reset
  action1.action.time = 0.5;
  action1.action.weight = 0.7;
  action2.action.time = 0.3;
  action2.action.weight = 0.4;
  central.time = 0.1;
  central.weight = 0.5;

  new PolarBlendTreeProxy([action1, action2], central);

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

test("setBlend: should throw error for invalid blend values", () => {
  const action1 = buildMockPolarAction(1, -1);
  const action2 = buildMockPolarAction(1, 1);
  const blendTree = new PolarBlendTreeProxy([action1, action2]);

  assert.throws(
    () => blendTree.setBlend(NaN, 1),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(Infinity, 1),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(-Infinity, 1),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(Number.MAX_SAFE_INTEGER + 1, 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => blendTree.setBlend(-Number.MAX_SAFE_INTEGER - 1, 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => blendTree.setBlend(1, NaN),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(1, Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(1, -Infinity),
    /value must be a finite number/,
  );
  assert.throws(
    () => blendTree.setBlend(1, Number.MAX_SAFE_INTEGER + 1),
    /value exceeds maximum safe integer range/,
  );
  assert.throws(
    () => blendTree.setBlend(1, -Number.MAX_SAFE_INTEGER - 1),
    /value exceeds maximum safe integer range/,
  );
});

test("setBlend: outer ring: should update weights when blend changes", () => {
  const action1 = buildMockPolarAction(1, 0);
  const action2 = buildMockPolarAction(1, 1);
  const blendTree = new PolarBlendTreeProxy([action1, action2]);
  blendTree.invokeSetInfluence(1);

  // Set initial blend value
  blendTree.setBlend(0.3, 1);
  const weight1First = action1.action.weight;
  const weight2First = action2.action.weight;

  // Change blend value
  blendTree.setBlend(0.7, 1);
  const weight1Second = action1.action.weight;
  const weight2Second = action2.action.weight;

  // Weights should have changed when blend value changes
  assert.not.equal(weight1First, weight1Second, "action1 weight should change");
  assert.not.equal(weight2First, weight2Second, "action2 weight should change");
});

test("setBlend: outer ring: should give full weight to action when blend exactly matches its value", () => {
  const action1 = buildMockPolarAction(1, 0);
  const action2 = buildMockPolarAction(1, 0.5);
  const action3 = buildMockPolarAction(1, 1);

  const blendTree = new PolarBlendTreeProxy([action1, action2, action3]);
  blendTree.invokeSetInfluence(1);

  // Test exact match with first action (boundary case)
  blendTree.setBlend(0, 1);
  assertEqualWithTolerance(
    action1.action.weight,
    1,
    "First action should have weight 1 when blend matches its value",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    0,
    "Other actions should have weight 0",
  );
  assertEqualWithTolerance(
    action3.action.weight,
    0,
    "Other actions should have weight 0",
  );

  // Test exact match with middle action
  blendTree.setBlend(0.5, 1);
  assertEqualWithTolerance(
    action1.action.weight,
    0,
    "Other actions should have weight 0",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    1,
    "Middle action should have weight 1 when blend matches its value",
  );
  assertEqualWithTolerance(
    action3.action.weight,
    0,
    "Other actions should have weight 0",
  );

  // Test exact match with last action (boundary case)
  blendTree.setBlend(1, 1);
  assertEqualWithTolerance(
    action1.action.weight,
    0,
    "Other actions should have weight 0",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    0,
    "Other actions should have weight 0",
  );
  assertEqualWithTolerance(
    action3.action.weight,
    1,
    "Last action should have weight 1 when blend matches its value",
  );
});

test("setBlend: outer ring: should interpolate correctly between two actions", () => {
  const action1 = buildMockPolarAction(1, 0);
  const action2 = buildMockPolarAction(1, 1);
  const blendTree = new PolarBlendTreeProxy([action1, action2]);

  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(0.3, 1); // 30% between action1 and action2

  // Linear interpolation: action1 gets (1 - 0.3) = 0.7, action2 gets 0.3
  assertEqualWithTolerance(
    action1.action.weight,
    0.7,
    "action1 should have 70% weight",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    0.3,
    "action2 should have 30% weight",
  );
});

test("setBlend: outer ring: should interpolate correctly between two actions backward", () => {
  const action1Value = -0.5;
  const action2Value = 0.5;
  const blendValue = -0.6;

  const action1 = buildMockPolarAction(1, action1Value);
  const action2 = buildMockPolarAction(1, action2Value);
  const blendTree = new PolarBlendTreeProxy([action1, action2]);

  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(blendValue, 1);

  const [action2Weight, action1Weight] = lerpAngular(
    blendValue,
    action2Value,
    action1Value,
  );

  assertEqualWithTolerance(
    action1.action.weight,
    action1Weight,
    "action1 should have ...",
  );

  assertEqualWithTolerance(
    action2.action.weight,
    action2Weight,
    "action2 should have ...",
  );
});

test("setBlend: outer ring: should skip update when blend value unchanged", () => {
  const action1 = buildMockPolarAction(1, 0);
  const action2 = buildMockPolarAction(1, 1);
  const blendTree = new PolarBlendTreeProxy([action1, action2]);
  blendTree.invokeSetInfluence(1);

  const value = 0.5;

  // Set initial blend value
  blendTree.setBlend(value, 1);
  const initialWeight1 = action1.action.weight;
  const initialWeight2 = action2.action.weight;

  // Set same value again - should be optimized to skip update
  blendTree.setBlend(value, 1);

  // Weights should remain unchanged (optimization working)
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

test("setBlend: outer ring: should work with negative and arbitrary values", () => {
  // Test with actions at various arbitrary values including negatives
  const actions = [
    buildMockPolarAction(1, -10),
    buildMockPolarAction(1, 0),
    buildMockPolarAction(1, 15),
    buildMockPolarAction(1, 100),
  ];

  const blendTree = new PolarBlendTreeProxy(actions);
  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(7.5, 1); // Between 0 and 15

  // Should interpolate between actions at 0 and 15 (7.5 is 50% between them)
  assertEqualWithTolerance(
    actions[1].action.weight,
    (7.5 - 0) / (15 - 0),
    "action at 0 should have 50% weight",
  );
  assertEqualWithTolerance(
    actions[2].action.weight,
    0.5,
    "action at 15 should have 50% weight",
  );
});

test("setBlend: outer ring: should handle exact value matching with negative values", () => {
  const action1 = buildMockPolarAction(1, -10);
  const action2 = buildMockPolarAction(1, -5);
  const action3 = buildMockPolarAction(1, 0);
  const action4 = buildMockPolarAction(1, 5);

  const blendTree = new PolarBlendTreeProxy([
    action1,
    action2,
    action3,
    action4,
  ]);
  blendTree.invokeSetInfluence(1);

  // Test exact match with negative value
  blendTree.setBlend(-5, 1);
  assertEqualWithTolerance(
    action1.action.weight,
    0,
    "Other actions should have weight 0",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    1,
    "Action with matching negative value should have weight 1",
  );
  assertEqualWithTolerance(
    action3.action.weight,
    0,
    "Other actions should have weight 0",
  );
  assertEqualWithTolerance(
    action4.action.weight,
    0,
    "Other actions should have weight 0",
  );
});

test("setBlend: outer ring: should handle exact value matching with arbitrary decimal values", () => {
  const action1 = buildMockPolarAction(1, 1.234);
  const action2 = buildMockPolarAction(1, 5.678);
  const action3 = buildMockPolarAction(1, 9.999);

  const blendTree = new PolarBlendTreeProxy([action1, action2, action3]);
  blendTree.invokeSetInfluence(1);

  // Test exact match with decimal value
  blendTree.setBlend(5.678, 1);
  assertEqualWithTolerance(
    action1.action.weight,
    0,
    "Other actions should have weight 0",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    1,
    "Action with matching decimal value should have weight 1",
  );
  assertEqualWithTolerance(
    action3.action.weight,
    0,
    "Other actions should have weight 0",
  );
});

test("setBlend: outer ring: should handle exact value matching with many actions", () => {
  // Test with many actions to stress-test binary search algorithm
  const actions = [
    buildMockPolarAction(1, 0),
    buildMockPolarAction(1, 10),
    buildMockPolarAction(1, 20),
    buildMockPolarAction(1, 30),
    buildMockPolarAction(1, 40),
    buildMockPolarAction(1, 50),
  ];

  const blendTree = new PolarBlendTreeProxy(actions);
  blendTree.invokeSetInfluence(1);

  // Test exact match with middle action in larger set (tests binary search)
  blendTree.setBlend(30, 1);

  for (let i = 0; i < actions.length; i++) {
    if (i === 3) {
      // Action with value 30 should have full weight
      assertEqualWithTolerance(
        actions[i].action.weight,
        1,
        `Action at index ${i} should have weight 1 when blend matches its value`,
      );
    } else {
      // All other actions should have zero weight
      assertEqualWithTolerance(
        actions[i].action.weight,
        0,
        `Action at index ${i} should have weight 0 when blend doesn't match its value`,
      );
    }
  }
});

test("setBlend: outer ring: should transition from exact match to interpolation correctly", () => {
  const action1 = buildMockPolarAction(1, 0);
  const action2 = buildMockPolarAction(1, 1);
  const action3 = buildMockPolarAction(1, 2);

  const blendTree = new PolarBlendTreeProxy([action1, action2, action3]);
  blendTree.invokeSetInfluence(1);

  // Start with exact match at middle action
  blendTree.setBlend(1, 1);
  assertEqualWithTolerance(
    action1.action.weight,
    0,
    "First action should be 0 at exact match",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    1,
    "Middle action should be 1 at exact match",
  );
  assertEqualWithTolerance(
    action3.action.weight,
    0,
    "Third action should be 0 at exact match",
  );

  // Move slightly off exact match - should interpolate between action2 and action3
  blendTree.setBlend(1.3, 1); // 30% between actions 2 and 3
  assertEqualWithTolerance(
    action1.action.weight,
    0,
    "First action should remain 0 (outside interpolation range)",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    0.7,
    "Second action should interpolate: 1 - 0.3 = 0.7",
  );
  assertEqualWithTolerance(
    action3.action.weight,
    0.3,
    "Third action should interpolate: 0.3",
  );

  // Move back to exact match at last action
  blendTree.setBlend(2, 1);
  assertEqualWithTolerance(
    action1.action.weight,
    0,
    "First action should be 0 at exact match",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    0,
    "Second action should be 0 at exact match",
  );
  assertEqualWithTolerance(
    action3.action.weight,
    1,
    "Third action should be 1 at exact match",
  );
});

test("events: should emit ENTER/EXIT events", () => {
  const blendTree = new PolarBlendTreeProxy([
    buildMockPolarAction(1, -1),
    buildMockPolarAction(1, 1),
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
  const loopOnceAction = buildMockPolarAction(1, -1, LoopOnce);
  const loopRepeatAction = buildMockPolarAction(1, 0, LoopRepeat);
  const loopPingPongAction = buildMockPolarAction(1, 1, LoopPingPong);

  const blendTree = new PolarBlendTreeProxy([
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
  const action = buildMockPolarAction(1, -1);
  const blendTree = new PolarBlendTreeProxy([
    action,
    buildMockPolarAction(1, 1),
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
  const action = buildMockAnimationAction(1);
  const blendTree = new PolarBlendTreeProxy(
    [buildMockPolarAction(1, -1), buildMockPolarAction(1, 1)],
    action,
  );

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
    action,
    "Event should include the animation action",
  );
  assert.equal(eventState, blendTree, "Event should include the clip state");
  assert.equal(action.weight, 0.5);
  assert.ok(action.isRunning(), "Animation should be playing");
});

test("events: should stop animation and emit STOP when influence becomes zero", () => {
  const action = buildMockAnimationAction(1);
  const blendTree = new PolarBlendTreeProxy(
    [buildMockPolarAction(1, -1), buildMockPolarAction(1, 1)],
    action,
  );

  blendTree.invokeSetInfluence(0.8);
  action.time = 0.3;

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
    action,
    "Event should include the animation action",
  );
  assert.equal(eventState, blendTree, "Event should include the clip state");
  assert.equal(action.weight, 0);
  assert.not.ok(action.isRunning(), "Animation should be stopped");
});

test.run();
