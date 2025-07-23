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

function testOuterRingBlending(
  blend: number,
  radius: number,
  action1Message: string,
  action2Message: string,
): void {
  const value1 = -Math.PI / 4;
  const value2 = Math.PI / 4;

  const action1 = buildMockPolarAction(1, value1);
  const action2 = buildMockPolarAction(1, value2);
  const blendTree = new PolarBlendTreeProxy([action1, action2]);

  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(blend, radius);

  const [weight2, weight1] = lerpAngular(blend, value2, value1);

  assertEqualWithTolerance(action1.action.weight, weight1, action1Message);
  assertEqualWithTolerance(action2.action.weight, weight2, action2Message);
}

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

test("setBlend: exact outer ring match: should blend at center point between two actions", () => {
  testOuterRingBlending(
    0,
    1,
    "action1 should have correct weight for center blend",
    "action2 should have correct weight for center blend",
  );
});

test("setBlend: exact outer ring match: should blend slightly towards second action", () => {
  testOuterRingBlending(
    0.1,
    1,
    "action1 should have reduced weight when blend moves towards action2",
    "action2 should have increased weight when blend moves towards action2",
  );
});

test("setBlend: exact outer ring match: should blend exactly at second action position", () => {
  testOuterRingBlending(
    Math.PI / 4,
    1,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
  );
});

test("setBlend: exact outer ring match: should blend past second action position", () => {
  testOuterRingBlending(
    Math.PI / 4 + 0.1,
    1,
    "action1 should have correct weight when blend exceeds action2 position",
    "action2 should have correct weight when blend exceeds its position",
  );
});

test("setBlend: exact outer ring match: should handle opposite direction blend", () => {
  testOuterRingBlending(
    Math.PI,
    1,
    "action1 should have correct weight for opposite direction blend",
    "action2 should have correct weight for opposite direction blend",
  );
});

test("setBlend: exact outer ring match: should blend exactly at first action position", () => {
  testOuterRingBlending(
    -Math.PI / 4,
    1,
    "action1 should have maximum weight when blend is at its position",
    "action2 should have minimal weight when blend is at action1 position",
  );
});

test("setBlend: exact outer ring match: should blend slightly past first action position", () => {
  testOuterRingBlending(
    -Math.PI / 4 + 0.1,
    1,
    "action1 should have correct weight when blend slightly exceeds its position",
    "action2 should have correct weight when blend slightly exceeds action1 position",
  );
});

test("setBlend: exact outer ring match: should skip update when blend value unchanged", () => {
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

test("setBlend: beyond outer ring: should blend at center point between two actions", () => {
  testOuterRingBlending(
    0,
    1.1,
    "action1 should have correct weight for center blend",
    "action2 should have correct weight for center blend",
  );
});

test("setBlend: beyond outer ring: should blend slightly towards second action", () => {
  testOuterRingBlending(
    0.1,
    1.1,
    "action1 should have reduced weight when blend moves towards action2",
    "action2 should have increased weight when blend moves towards action2",
  );
});

test("setBlend: beyond outer ring: should blend exactly at second action position", () => {
  testOuterRingBlending(
    Math.PI / 4,
    1.1,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
  );
});

test("setBlend: beyond outer ring: should blend past second action position", () => {
  testOuterRingBlending(
    Math.PI / 4 + 0.1,
    1.1,
    "action1 should have correct weight when blend exceeds action2 position",
    "action2 should have correct weight when blend exceeds its position",
  );
});

test("setBlend: beyond outer ring: should handle opposite direction blend", () => {
  testOuterRingBlending(
    Math.PI,
    1.1,
    "action1 should have correct weight for opposite direction blend",
    "action2 should have correct weight for opposite direction blend",
  );
});

test("setBlend: beyond outer ring: should blend exactly at first action position", () => {
  testOuterRingBlending(
    -Math.PI / 4,
    1.1,
    "action1 should have maximum weight when blend is at its position",
    "action2 should have minimal weight when blend is at action1 position",
  );
});

test("setBlend: beyond outer ring: should blend slightly past first action position", () => {
  testOuterRingBlending(
    -Math.PI / 4 + 0.1,
    1.1,
    "action1 should have correct weight when blend slightly exceeds its position",
    "action2 should have correct weight when blend slightly exceeds action1 position",
  );
});

// Tests with radius 0.9
test("setBlend: within outer ring: should blend at center point between two actions", () => {
  testOuterRingBlending(
    0,
    0.9,
    "action1 should have correct weight for center blend",
    "action2 should have correct weight for center blend",
  );
});

test("setBlend: within outer ring: should blend slightly towards second action", () => {
  testOuterRingBlending(
    0.1,
    0.9,
    "action1 should have reduced weight when blend moves towards action2",
    "action2 should have increased weight when blend moves towards action2",
  );
});

test("setBlend: within outer ring: should blend exactly at second action position", () => {
  testOuterRingBlending(
    Math.PI / 4,
    0.9,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
  );
});

test("setBlend: within outer ring: should blend past second action position", () => {
  testOuterRingBlending(
    Math.PI / 4 + 0.1,
    0.9,
    "action1 should have correct weight when blend exceeds action2 position",
    "action2 should have correct weight when blend exceeds its position",
  );
});

test("setBlend: within outer ring: should handle opposite direction blend", () => {
  testOuterRingBlending(
    Math.PI,
    0.9,
    "action1 should have correct weight for opposite direction blend",
    "action2 should have correct weight for opposite direction blend",
  );
});

test("setBlend: within outer ring: should blend exactly at first action position", () => {
  testOuterRingBlending(
    -Math.PI / 4,
    0.9,
    "action1 should have maximum weight when blend is at its position",
    "action2 should have minimal weight when blend is at action1 position",
  );
});

test("setBlend: within outer ring: should blend slightly past first action position", () => {
  testOuterRingBlending(
    -Math.PI / 4 + 0.1,
    0.9,
    "action1 should have correct weight when blend slightly exceeds its position",
    "action2 should have correct weight when blend slightly exceeds action1 position",
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
