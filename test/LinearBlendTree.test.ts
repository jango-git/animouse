import type { AnimationAction } from "three";
import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
import { assertEqualWithTolerance } from "./miscellaneous/miscellaneous";
import { buildMockLinearAction } from "./mocks/buildMockAction";
import { LinearBlendTreeProxy } from "./proxies/LinearBlendTreeProxy";

test("constructor: should throw error when fewer than 2 actions provided", () => {
  assert.throws(
    () => new LinearBlendTreeProxy([buildMockLinearAction(0)]),
    "Need at least 2 actions",
  );
});

test("constructor: should throw error when action has non-finite value", () => {
  assert.throws(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(NaN),
        buildMockLinearAction(0),
        buildMockLinearAction(NaN),
      ]),
    /non-finite value/,
  );

  assert.throws(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(0),
        buildMockLinearAction(Infinity),
      ]),
    /non-finite value/,
  );

  assert.throws(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(-Infinity),
        buildMockLinearAction(0),
      ]),
    /non-finite value/,
  );
});

test("constructor: should throw error when action has value outside safe range", () => {
  assert.throws(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(Number.MAX_SAFE_INTEGER + 1),
        buildMockLinearAction(0),
        buildMockLinearAction(-(Number.MAX_SAFE_INTEGER + 1)),
      ]),
    /outside safe range/,
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

test("constructor: should sort actions by value ascending", () => {
  // Create actions in unsorted order: 10, -5, 0
  const action1 = buildMockLinearAction(10);
  const action2 = buildMockLinearAction(-5);
  const action3 = buildMockLinearAction(0);

  const blendTree = new LinearBlendTreeProxy([action1, action2, action3]);
  blendTree.invokeSetInfluence(1);

  // Test by checking blend behavior - should clamp to sorted range
  blendTree.setBlend(-10); // Should clamp to -5 (minimum after sorting)

  // If sorted correctly (-5, 0, 10), action2 should have weight 1
  assertEqualWithTolerance(
    action1.action.weight,
    0,
    "action1 (value 10) should have weight 0 when blend is at minimum",
  );
  assertEqualWithTolerance(
    action2.action.weight,
    1,
    "action2 (value -5) should have weight 1 when blend clamps to minimum",
  );
  assertEqualWithTolerance(
    action3.action.weight,
    0,
    "action3 (value 0) should have weight 0 when blend is at minimum",
  );
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

test("setBlend: should interpolate correctly between two adjacent actions", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);
  const blendTree = new LinearBlendTreeProxy([action1, action2]);

  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(0.3); // 30% between action1 and action2

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

test("setBlend: should give full weight to action when blend exactly matches its value", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(0.5);
  const action3 = buildMockLinearAction(1);

  const blendTree = new LinearBlendTreeProxy([action1, action2, action3]);
  blendTree.invokeSetInfluence(1);

  // Test exact match with first action (boundary case)
  blendTree.setBlend(0);
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
  blendTree.setBlend(0.5);
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
  blendTree.setBlend(1);
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

test("setBlend: should skip update when blend value unchanged", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);
  const blendTree = new LinearBlendTreeProxy([action1, action2]);
  blendTree.invokeSetInfluence(1);

  const value = 0.5;

  // Set initial blend value
  blendTree.setBlend(value);
  const initialWeight1 = action1.action.weight;
  const initialWeight2 = action2.action.weight;

  // Set same value again - should be optimized to skip update
  blendTree.setBlend(value);

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

test("setBlend: should update weights when blend changes", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);
  const blendTree = new LinearBlendTreeProxy([action1, action2]);
  blendTree.invokeSetInfluence(1);

  // Set initial blend value
  blendTree.setBlend(0.3);
  const weight1First = action1.action.weight;
  const weight2First = action2.action.weight;

  // Change blend value
  blendTree.setBlend(0.7);
  const weight1Second = action1.action.weight;
  const weight2Second = action2.action.weight;

  // Weights should have changed when blend value changes
  assert.not.equal(weight1First, weight1Second, "action1 weight should change");
  assert.not.equal(weight2First, weight2Second, "action2 weight should change");
});

test("setBlend: should work with negative and arbitrary values", () => {
  // Test with actions at various arbitrary values including negatives
  const actions = [
    buildMockLinearAction(-10),
    buildMockLinearAction(0),
    buildMockLinearAction(15),
    buildMockLinearAction(100),
  ];

  const blendTree = new LinearBlendTreeProxy(actions);
  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(7.5); // Between 0 and 15

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

test("setBlend: should handle exact value matching with negative values", () => {
  const action1 = buildMockLinearAction(-10);
  const action2 = buildMockLinearAction(-5);
  const action3 = buildMockLinearAction(0);
  const action4 = buildMockLinearAction(5);

  const blendTree = new LinearBlendTreeProxy([
    action1,
    action2,
    action3,
    action4,
  ]);
  blendTree.invokeSetInfluence(1);

  // Test exact match with negative value
  blendTree.setBlend(-5);
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

test("setBlend: should handle exact value matching with arbitrary decimal values", () => {
  const action1 = buildMockLinearAction(1.234);
  const action2 = buildMockLinearAction(5.678);
  const action3 = buildMockLinearAction(9.999);

  const blendTree = new LinearBlendTreeProxy([action1, action2, action3]);
  blendTree.invokeSetInfluence(1);

  // Test exact match with decimal value
  blendTree.setBlend(5.678);
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

test("setBlend: should handle exact value matching with many actions", () => {
  // Test with many actions to stress-test binary search algorithm
  const actions = [
    buildMockLinearAction(0),
    buildMockLinearAction(10),
    buildMockLinearAction(20),
    buildMockLinearAction(30),
    buildMockLinearAction(40),
    buildMockLinearAction(50),
  ];

  const blendTree = new LinearBlendTreeProxy(actions);
  blendTree.invokeSetInfluence(1);

  // Test exact match with middle action in larger set (tests binary search)
  blendTree.setBlend(30);

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

test("setBlend: should transition from exact match to interpolation correctly", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);
  const action3 = buildMockLinearAction(2);

  const blendTree = new LinearBlendTreeProxy([action1, action2, action3]);
  blendTree.invokeSetInfluence(1);

  // Start with exact match at middle action
  blendTree.setBlend(1);
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
  blendTree.setBlend(1.3); // 30% between actions 2 and 3
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
  blendTree.setBlend(2);
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

test.run();
