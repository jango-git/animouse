import { test } from "uvu";
import * as assert from "uvu/assert";
import { buildMockPolarAction } from "./mocks/buildMockAction";
import { PolarBlendTreeProxy } from "./proxies/PolarBlendTreeProxy";

function assertEqualWithTolerance(
  actual: number,
  expected: number,
  message?: string,
): void {
  const EPSILON = 1e-10;
  assert.ok(
    Math.abs(actual - expected) < EPSILON,
    message || `Expected ${expected}, got ${actual}`,
  );
}

test("constructor: should throw error when fewer than 2 actions provided", () => {
  assert.throws(
    () => new PolarBlendTreeProxy([buildMockPolarAction(1, 0)]),
    "Need at least 2 actions",
  );
});

test("constructor: should throw error when action has non-finite value", () => {
  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, NaN),
        buildMockPolarAction(NaN, 0),
        buildMockPolarAction(0, 0),
      ]),
    /non-finite value/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, Infinity),
        buildMockPolarAction(Infinity, 0),
      ]),
    /non-finite value/,
  );

  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, -Infinity),
        buildMockPolarAction(-Infinity, 0),
      ]),
    /non-finite value/,
  );
});

test("constructor: should throw error when action has value outside safe range", () => {
  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(Number.MAX_SAFE_INTEGER + 1, 0),
        buildMockPolarAction(0, 0),
        buildMockPolarAction(-(Number.MAX_SAFE_INTEGER + 1), 0),
      ]),
    /outside safe range/,
  );
  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, Number.MAX_SAFE_INTEGER + 1),
        buildMockPolarAction(0, 0),
        buildMockPolarAction(1, -(Number.MAX_SAFE_INTEGER + 1)),
      ]),
    /outside safe range/,
  );
});

test("constructor: should throw error when multiple actions have same value", () => {
  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(0.5, 0),
        buildMockPolarAction(0.5, 0),
      ]),
    /Duplicate value found/,
  );
});

test("constructor: should throw error when only two actions and they are collinear", () => {
  assert.throws(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(0.5, 0),
        buildMockPolarAction(1, 0),
      ]),
    /Duplicate value found/,
  );
});

test("constructor: should initialize actions to stopped state", () => {
  const action1 = buildMockPolarAction(1, 0);
  const action2 = buildMockPolarAction(0.5, 0);

  action1.action.play();
  action2.action.play();

  // Set initial non-zero values to verify they get reset
  action1.action.time = 0.5;
  action1.action.weight = 0.7;
  action2.action.time = 0.3;
  action2.action.weight = 0.4;

  new PolarBlendTreeProxy([action1, action2]);

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

// test("constructor: should sort actions by value ascending", () => {
//   // Create actions in unsorted order: 10, -5, 0
//   const action1 = buildMockLinearAction(10);
//   const action2 = buildMockLinearAction(-5);
//   const action3 = buildMockLinearAction(0);

//   const blendTree = new LinearBlendTreeProxy([action1, action2, action3]);
//   blendTree.invokeSetInfluence(1);

//   // Test by checking blend behavior - should clamp to sorted range
//   blendTree.setBlend(-10); // Should clamp to -5 (minimum after sorting)

//   // If sorted correctly (-5, 0, 10), action2 should have weight 1
//   assertEqualWithTolerance(
//     action1.action.weight,
//     0,
//     "action1 (value 10) should have weight 0 when blend is at minimum",
//   );
//   assertEqualWithTolerance(
//     action2.action.weight,
//     1,
//     "action2 (value -5) should have weight 1 when blend clamps to minimum",
//   );
//   assertEqualWithTolerance(
//     action3.action.weight,
//     0,
//     "action3 (value 0) should have weight 0 when blend is at minimum",
//   );
// });

// test("should throw error when action has non-finite radius", () => {
//   assert.throws(
//     () =>
//       new PolarBlendTree([
//         buildMockPolarAction(1, 0),
//         buildMockPolarAction(NaN, MathUtils.degToRad(90)),
//       ]),
//     /non-finite radius/,
//   );

//   assert.throws(
//     () =>
//       new PolarBlendTree([
//         buildMockPolarAction(1, 0),
//         buildMockPolarAction(Infinity, MathUtils.degToRad(90)),
//       ]),
//     /non-finite radius/,
//   );
// });

// test("should throw error when action has non-finite azimuth", () => {
//   assert.throws(
//     () =>
//       new PolarBlendTree([
//         buildMockPolarAction(1, 0),
//         buildMockPolarAction(1, NaN),
//       ]),
//     /non-finite azimuth/,
//   );

//   assert.throws(
//     () =>
//       new PolarBlendTree([
//         buildMockPolarAction(1, 0),
//         buildMockPolarAction(1, Infinity),
//       ]),
//     /non-finite azimuth/,
//   );
// });

// test("should throw error when action has negative radius", () => {
//   assert.throws(
//     () =>
//       new PolarBlendTree([
//         buildMockPolarAction(1, 0),
//         buildMockPolarAction(-1, MathUtils.degToRad(90)),
//       ]),
//     /negative radius/,
//   );
// });

// test("should throw error when multiple actions have same polar coordinates", () => {
//   assert.throws(
//     () =>
//       new PolarBlendTree([
//         buildMockPolarAction(1, MathUtils.degToRad(45)),
//         buildMockPolarAction(1, MathUtils.degToRad(45)),
//       ]),
//     /duplicate polar coordinates/,
//   );
// });

// test("should create successfully with minimum valid actions", () => {
//   const blendTree = new PolarBlendTree([
//     buildMockPolarAction(1, 0),
//     buildMockPolarAction(1, MathUtils.degToRad(90)),
//   ]);

//   assert.ok(blendTree);
// });

// test("should create successfully with center action", () => {
//   const centerAction = new MockAnimationAction() as any;
//   const blendTree = new PolarBlendTree(
//     [
//       buildMockPolarAction(1, 0),
//       buildMockPolarAction(1, MathUtils.degToRad(90)),
//     ],
//     centerAction,
//   );

//   assert.ok(blendTree);
// });

// test("should initialize all actions to stopped state", () => {
//   const action1 = buildMockPolarAction(1, 0);
//   const action2 = buildMockPolarAction(1, MathUtils.degToRad(90));
//   const centerAction = new MockAnimationAction() as any;

//   // Set some initial values
//   action1.action.time = 0.5;
//   action1.action.weight = 0.7;
//   action2.action.time = 0.3;
//   action2.action.weight = 0.4;
//   centerAction.time = 0.2;
//   centerAction.weight = 0.8;

//   new PolarBlendTree([action1, action2], centerAction);

//   assert.equal(action1.action.time, 0);
//   assert.equal(action1.action.weight, 0);
//   assert.equal(action2.action.time, 0);
//   assert.equal(action2.action.weight, 0);
//   assert.equal(centerAction.time, 0);
//   assert.equal(centerAction.weight, 0);
// });

// // setBlend tests
// test("should interpolate correctly between two actions", () => {
//   const action1 = buildMockPolarAction(1, 0); // North
//   const action2 = buildMockPolarAction(1, MathUtils.degToRad(90)); // East
//   const blendTree = new PolarBlendTree([action1, action2]);

//   // Set influence to 1 to see actual weights
//   (blendTree as any).setInfluenceInternal(1);

//   // Blend to 45 degrees (between the two actions)
//   blendTree.setBlend(1, MathUtils.degToRad(45));

//   // Should interpolate 50/50 between the two actions
//   assert.is(action1.action.weight, 0.5);
//   assert.is(action2.action.weight, 0.5);
// });

// test("should give 100% weight to exact coordinate matches", () => {
//   const action1 = buildMockPolarAction(1, 0);
//   const action2 = buildMockPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   // Blend to exact coordinates of action1
//   blendTree.setBlend(1, 0);

//   assert.is(action1.action.weight, 1);
//   assert.is(action2.action.weight, 0);
// });

// test("should blend with center action when radius is small", () => {
//   const action1 = buildMockPolarAction(2, 0);
//   const action2 = buildMockPolarAction(2, MathUtils.degToRad(90));
//   const centerAction = buildMockPolarAction(0, MathUtils.degToRad(45));
//   const blendTree = new PolarBlendTree([action1, action2], centerAction);

//   (blendTree as any).setInfluenceInternal(1);

//   // Blend to center (radius = 0)
//   blendTree.setBlend(0, 0);

//   // Center action should have full weight
//   assert.is(centerAction.weight, 1);
//   assert.is(action1.action.weight, 0);
//   assert.is(action2.action.weight, 0);
// });

// test("should clamp negative radius to zero", () => {
//   const action1 = buildMockPolarAction(1, 0);
//   const action2 = buildMockPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   // Set negative radius - should be clamped to 0
//   blendTree.setBlend(-1, 0);

//   // Should behave as if radius = 0
//   assert.ok(action1.action.weight >= 0);
//   assert.ok(action2.action.weight >= 0);
// });

// test("should normalize azimuth to [0, 2π) range", () => {
//   const action1 = buildMockPolarAction(1, 0);
//   const action2 = buildMockPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   // Use azimuth > 2π - should be normalized
//   blendTree.setBlend(1, MathUtils.degToRad(450)); // 450° = 90°

//   // Should behave as if azimuth = 90°
//   assert.is(action1.action.weight, 0);
//   assert.is(action2.action.weight, 1);
// });

// test("should skip update when blend coordinates are unchanged", () => {
//   const action1 = buildMockPolarAction(1, 0);
//   const action2 = buildMockPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   blendTree.setBlend(1, MathUtils.degToRad(45));
//   const initialWeight1 = action1.action.weight;
//   const initialWeight2 = action2.action.weight;

//   // Set same coordinates again
//   blendTree.setBlend(1, MathUtils.degToRad(45));

//   assert.equal(action1.action.weight, initialWeight1);
//   assert.equal(action2.action.weight, initialWeight2);
// });

// test("should update weights when blend coordinates change", () => {
//   const action1 = buildMockPolarAction(1, 0);
//   const action2 = buildMockPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   blendTree.setBlend(1, MathUtils.degToRad(30));
//   const firstWeight1 = action1.action.weight;
//   const firstWeight2 = action2.action.weight;

//   blendTree.setBlend(1, MathUtils.degToRad(60));
//   const secondWeight1 = action1.action.weight;
//   const secondWeight2 = action2.action.weight;

//   // Weights should have changed
//   assert.not.equal(firstWeight1, secondWeight1);
//   assert.not.equal(firstWeight2, secondWeight2);
// });

// // Event tests
// test("should emit PLAY events when actions start", () => {
//   const action1 = buildMockPolarAction(1, 0);
//   const action2 = buildMockPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   let playEventCount = 0;
//   let lastPlayAction: any = null;
//   let lastPlayState: any = null;

//   blendTree.on(StateEvent.PLAY, (action, state) => {
//     playEventCount++;
//     lastPlayAction = action;
//     lastPlayState = state;
//   });

//   blendTree.setBlend(1, MathUtils.degToRad(45));

//   assert.is(playEventCount, 2); // Both actions should start
//   assert.equal(lastPlayState, blendTree);
// });

// test("should emit STOP events when actions stop", () => {
//   const action1 = createPolarAction(1, 0);
//   const action2 = createPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   // Start both actions
//   blendTree.setBlend(1, MathUtils.degToRad(45));

//   let stopEventCount = 0;
//   let lastStopAction: any = null;
//   let lastStopState: any = null;

//   blendTree.on(StateEvent.STOP, (action, state) => {
//     stopEventCount++;
//     lastStopAction = action;
//     lastStopState = state;
//   });

//   // Move to exact coordinate of action1 (should stop action2)
//   blendTree.setBlend(1, 0);

//   assert.is(stopEventCount, 1); // action2 should stop
//   assert.equal(lastStopAction, action2.action);
//   assert.equal(lastStopState, blendTree);
// });

// test("should emit FINISH events for LoopOnce animations", () => {
//   const action1 = createPolarAction(1, 0, LoopOnce);
//   const action2 = createPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);
//   blendTree.setBlend(1, 0); // Start action1

//   let finishEventFired = false;
//   let finishAction: any = null;
//   let finishState: any = null;

//   blendTree.on(StateEvent.FINISH, (action, state) => {
//     finishEventFired = true;
//     finishAction = action;
//     finishState = state;
//   });

//   // Simulate animation completion
//   action1.action.time = 1.0;
//   (blendTree as any).onTickInternal();

//   assert.ok(finishEventFired);
//   assert.equal(finishAction, action1.action);
//   assert.equal(finishState, blendTree);
// });

// test("should emit ITERATE events for looped animations", () => {
//   const action1 = createPolarAction(1, 0, LoopRepeat);
//   const action2 = createPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);
//   blendTree.setBlend(1, 0); // Start action1

//   let iterateEventFired = false;
//   let iterateAction: any = null;
//   let iterateState: any = null;

//   blendTree.on(StateEvent.ITERATE, (action, state) => {
//     iterateEventFired = true;
//     iterateAction = action;
//     iterateState = state;
//   });

//   // Simulate animation completion
//   action1.action.time = 1.0;
//   (blendTree as any).onTickInternal();

//   assert.ok(iterateEventFired);
//   assert.equal(iterateAction, action1.action);
//   assert.equal(iterateState, blendTree);
// });

// // Influence integration tests
// test("should apply influence to polar weights", () => {
//   const action1 = createPolarAction(1, 0);
//   const action2 = createPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(0.5); // 50% influence

//   blendTree.setBlend(1, MathUtils.degToRad(45));

//   // Base weights would be 0.5 each, with 50% influence should be 0.25 each
//   assert.is(action1.action.weight, 0.25);
//   assert.is(action2.action.weight, 0.25);
// });

// test("should update all active weights when influence changes", () => {
//   const action1 = createPolarAction(1, 0);
//   const action2 = createPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);
//   blendTree.setBlend(1, MathUtils.degToRad(45));

//   const initialWeight1 = action1.action.weight;
//   const initialWeight2 = action2.action.weight;

//   (blendTree as any).setInfluenceInternal(0.5);

//   // Weights should be halved
//   assert.is(action1.action.weight, initialWeight1 * 0.5);
//   assert.is(action2.action.weight, initialWeight2 * 0.5);
// });

// // Mathematical correctness tests
// test("should preserve weight sum equal to influence", () => {
//   const actions = [
//     createPolarAction(1, 0),
//     createPolarAction(1, MathUtils.degToRad(90)),
//     createPolarAction(1, MathUtils.degToRad(180)),
//     createPolarAction(1, MathUtils.degToRad(270)),
//   ];
//   const blendTree = new PolarBlendTree(actions);

//   const influence = 0.7;
//   (blendTree as any).setInfluenceInternal(influence);
//   blendTree.setBlend(1, MathUtils.degToRad(45));

//   const totalWeight = actions.reduce(
//     (sum, action) => sum + action.action.weight,
//     0,
//   );
//   assert.is(Math.abs(totalWeight - influence) < 0.0001, true);
// });

// test("should handle wraparound azimuth correctly", () => {
//   const action1 = createPolarAction(1, MathUtils.degToRad(350)); // Near 2π
//   const action2 = createPolarAction(1, MathUtils.degToRad(10)); // Near 0
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   // Blend to 0° (should be between the two actions)
//   blendTree.setBlend(1, 0);

//   // Should interpolate between both actions
//   assert.ok(action1.action.weight > 0);
//   assert.ok(action2.action.weight > 0);
// });

// test("should handle symmetric positions correctly", () => {
//   const action1 = createPolarAction(1, 0);
//   const action2 = createPolarAction(1, MathUtils.degToRad(180));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   // Blend to 90° (equidistant from both)
//   blendTree.setBlend(1, MathUtils.degToRad(90));

//   // Should have equal weights
//   assert.is(action1.action.weight, action2.action.weight);
// });

// // Integration tests
// test("should handle complex polar grid correctly", () => {
//   const actions = [
//     // Inner ring
//     createPolarAction(1, 0),
//     createPolarAction(1, MathUtils.degToRad(90)),
//     createPolarAction(1, MathUtils.degToRad(180)),
//     createPolarAction(1, MathUtils.degToRad(270)),
//     // Outer ring
//     createPolarAction(2, 0),
//     createPolarAction(2, MathUtils.degToRad(90)),
//     createPolarAction(2, MathUtils.degToRad(180)),
//     createPolarAction(2, MathUtils.degToRad(270)),
//   ];
//   const blendTree = new PolarBlendTree(actions);

//   (blendTree as any).setInfluenceInternal(1);

//   // Blend to intermediate position
//   blendTree.setBlend(1.5, MathUtils.degToRad(45));

//   // Should have interpolated weights between multiple actions
//   const totalWeight = actions.reduce(
//     (sum, action) => sum + action.action.weight,
//     0,
//   );
//   assert.is(Math.abs(totalWeight - 1) < 0.0001, true);
// });

// test("should handle performance with many actions", () => {
//   const actions: PolarAction[] = [];

//   // Create 3 rings x 8 directions = 24 actions
//   for (let ring = 1; ring <= 3; ring++) {
//     for (let dir = 0; dir < 8; dir++) {
//       actions.push(createPolarAction(ring, (dir * Math.PI) / 4));
//     }
//   }

//   const blendTree = new PolarBlendTree(actions);
//   (blendTree as any).setInfluenceInternal(1);

//   // Should not hang or throw errors
//   blendTree.setBlend(1.5, MathUtils.degToRad(67));
//   blendTree.setBlend(2.5, MathUtils.degToRad(123));
//   blendTree.setBlend(0.5, MathUtils.degToRad(234));
// });

// // Edge cases
// test("should handle extreme input values", () => {
//   const action1 = createPolarAction(1000, 0);
//   const action2 = createPolarAction(1000, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   // Should handle large values without errors
//   blendTree.setBlend(500, MathUtils.degToRad(45));

//   assert.is(action1.action.weight, 0.5);
//   assert.is(action2.action.weight, 0.5);
// });

// test("should handle rapid blend changes", () => {
//   const action1 = createPolarAction(1, 0);
//   const action2 = createPolarAction(1, MathUtils.degToRad(90));
//   const blendTree = new PolarBlendTree([action1, action2]);

//   (blendTree as any).setInfluenceInternal(1);

//   // Make rapid changes
//   for (let i = 0; i < 100; i++) {
//     blendTree.setBlend(1, (i * Math.PI) / 50);
//   }

//   // Should remain stable
//   assert.ok(action1.action.weight >= 0 && action1.action.weight <= 1);
//   assert.ok(action2.action.weight >= 0 && action2.action.weight <= 1);
// });

test.run();
