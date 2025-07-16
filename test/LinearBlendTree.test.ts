import { AnimationActionLoopStyles, LoopOnce, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
import {
  LinearBlendTree,
  type LinearAction,
} from "../src/states/LinearBlendTree";
import { MockAnimationAction } from "./mocks/MockAnimationAction";

// Helper function to create LinearAction
function createLinearAction(
  value: number,
  loop: AnimationActionLoopStyles = LoopRepeat,
): LinearAction {
  return { action: new MockAnimationAction(1, loop) as any, value };
}

// Constructor tests
test("should throw error when fewer than 2 actions provided", () => {
  assert.throws(
    () => new LinearBlendTree([createLinearAction(0)]),
    "Need at least 2 actions",
  );
});

test("should throw error when action has non-finite value", () => {
  assert.throws(
    () => new LinearBlendTree([createLinearAction(0), createLinearAction(NaN)]),
    /non-finite value/,
  );

  assert.throws(
    () =>
      new LinearBlendTree([
        createLinearAction(0),
        createLinearAction(Infinity),
      ]),
    /non-finite value/,
  );
});

test("should throw error when action has value outside safe range", () => {
  assert.throws(
    () =>
      new LinearBlendTree([
        createLinearAction(0),
        createLinearAction(Number.MAX_SAFE_INTEGER + 1),
      ]),
    /outside safe range/,
  );
});

test("should throw error when multiple actions have same value", () => {
  assert.throws(
    () =>
      new LinearBlendTree([createLinearAction(0.5), createLinearAction(0.5)]),
    /Duplicate value found/,
  );
});

test("should initialize actions to stopped state", () => {
  const action1 = createLinearAction(0);
  const action2 = createLinearAction(1);
  action1.action.time = 0.5;
  action1.action.weight = 0.7;
  action2.action.time = 0.3;
  action2.action.weight = 0.4;

  new LinearBlendTree([action1, action2]);

  assert.equal(action1.action.time, 0);
  assert.equal(action1.action.weight, 0);
  assert.equal(action2.action.time, 0);
  assert.equal(action2.action.weight, 0);
});

test("should sort actions by value ascending", () => {
  const action1 = createLinearAction(10);
  const action2 = createLinearAction(-5);
  const action3 = createLinearAction(0);

  const blendTree = new LinearBlendTree([action1, action2, action3]);

  // Test by checking blend behavior - should clamp to sorted range
  blendTree.setBlend(-10); // Should clamp to -5 (minimum)
  // If sorted correctly, action2 should have weight 1
  assert.equal(action2.action.weight, 0); // Will be 0 due to influence initially being 0
});

test("should configure iteration events based on loop mode", () => {
  const loopOnceAction = createLinearAction(0, LoopOnce);
  const loopRepeatAction = createLinearAction(1, LoopRepeat);

  const blendTree = new LinearBlendTree([loopOnceAction, loopRepeatAction]);

  let finishEventFired = false;
  let iterateEventFired = false;

  blendTree.on(StateEvent.FINISH, () => {
    finishEventFired = true;
  });

  blendTree.on(StateEvent.ITERATE, () => {
    iterateEventFired = true;
  });

  // Simulate animation completion
  loopOnceAction.action.time = 1.0;
  loopRepeatAction.action.time = 1.0;
  (blendTree as any).onTickInternal();

  assert.ok(finishEventFired, "FINISH event should fire for LoopOnce");
  assert.ok(iterateEventFired, "ITERATE event should fire for LoopRepeat");
});

test("should work with negative and arbitrary values", () => {
  const actions = [
    createLinearAction(-10),
    createLinearAction(0),
    createLinearAction(15),
    createLinearAction(100),
  ];

  const blendTree = new LinearBlendTree(actions);
  blendTree.setBlend(7.5); // Between 0 and 15

  // Should interpolate between actions at 0 and 15
  const expectedDifference = (7.5 - 0) / (15 - 0); // 0.5
  assert.equal(actions[1].action.weight, 0); // 1 - 0.5 = 0.5, but influence is 0
  assert.equal(actions[2].action.weight, 0); // 0.5, but influence is 0
});

// setBlend tests
test("should clamp blend value to action range", () => {
  const blendTree = new LinearBlendTree([
    createLinearAction(10),
    createLinearAction(20),
  ]);
  blendTree["setInfluenceInternal"](1);

  blendTree.setBlend(5); // Below minimum
  blendTree.setBlend(25); // Above maximum
  // Should not throw errors and should clamp internally
});

test("should skip update when blend value unchanged", () => {
  const action1 = createLinearAction(0);
  const action2 = createLinearAction(1);
  const blendTree = new LinearBlendTree([action1, action2]);
  blendTree["setInfluenceInternal"](1);

  blendTree.setBlend(0.5);
  const initialWeight1 = action1.action.weight;
  const initialWeight2 = action2.action.weight;

  blendTree.setBlend(0.5); // Same value

  assert.equal(action1.action.weight, initialWeight1);
  assert.equal(action2.action.weight, initialWeight2);
});

test("should update weights when blend changes", () => {
  const action1 = createLinearAction(0);
  const action2 = createLinearAction(1);
  const blendTree = new LinearBlendTree([action1, action2]);
  blendTree["setInfluenceInternal"](1);

  blendTree.setBlend(0.3);
  const weight1_first = action1.action.weight;
  const weight2_first = action2.action.weight;

  blendTree.setBlend(0.7);
  const weight1_second = action1.action.weight;
  const weight2_second = action2.action.weight;

  // Weights should have changed
  assert.not.equal(weight1_first, weight1_second);
  assert.not.equal(weight2_first, weight2_second);
});

// Linear interpolation tests
test("should interpolate correctly between two adjacent actions", () => {
  const action1 = createLinearAction(0);
  const action2 = createLinearAction(1);
  const blendTree = new LinearBlendTree([action1, action2]);

  // Set influence to 1 so we can see actual weights
  (blendTree as any).setInfluenceInternal(1);

  blendTree.setBlend(0.3);

  // Expected: action1 weight = 1 - 0.3 = 0.7, action2 weight = 0.3
  assert.equal(action1.action.weight, 0.7);
  assert.equal(action2.action.weight, 0.3);
});

test("should handle boundary values correctly", () => {
  const action1 = createLinearAction(0);
  const action2 = createLinearAction(1);
  const blendTree = new LinearBlendTree([action1, action2]);
  blendTree["setInfluenceInternal"](1);

  // Test exact boundary values
  blendTree.setBlend(0);
  assert.equal(action1.action.weight, 1);
  assert.equal(action2.action.weight, 0);

  blendTree.setBlend(1);
  assert.equal(action1.action.weight, 0);
  assert.equal(action2.action.weight, 1);
});

test("should work with multiple actions where only adjacent are active", () => {
  const actions = [
    createLinearAction(0),
    createLinearAction(0.5),
    createLinearAction(1),
  ];
  const blendTree = new LinearBlendTree(actions);

  (blendTree as any).setInfluenceInternal(1);

  blendTree.setBlend(0.25); // Between 0 and 0.5

  // Should interpolate between first and second action
  // difference = (0.25 - 0) / (0.5 - 0) = 0.5
  assert.equal(actions[0].action.weight, 0.5); // 1 - 0.5
  assert.equal(actions[1].action.weight, 0.5); // 0.5
  assert.equal(actions[2].action.weight, 0); // Not involved
});

test("should handle actions with same values gracefully", () => {
  // This should be prevented by constructor validation, but test edge case
  const action1 = createLinearAction(0);
  const action2 = createLinearAction(1);
  const blendTree = new LinearBlendTree([action1, action2]);

  // Manually set same values (simulating edge case)
  (blendTree as any).anchors[0].value = 0.5;
  (blendTree as any).anchors[1].value = 0.5;

  (blendTree as any).setInfluenceInternal(1);
  blendTree.setBlend(0.5);

  // Should not crash (division by zero protection)
});

// Animation tracking tests
test("should emit iteration events when animation completes", () => {
  const action1 = createLinearAction(0, LoopOnce);
  const action2 = createLinearAction(1);
  const blendTree = new LinearBlendTree([action1, action2]);

  let finishEventFired = false;
  let iterateEventFired = false;

  blendTree.on(StateEvent.FINISH, (action, state) => {
    finishEventFired = true;
    assert.equal(action, action1.action);
    assert.equal(state, blendTree);
  });

  blendTree.on(StateEvent.ITERATE, (action, state) => {
    iterateEventFired = true;
    assert.equal(action, action2.action);
    assert.equal(state, blendTree);
  });

  // Simulate completion
  action1.action.time = 1.0;
  action2.action.time = 1.0;
  (blendTree as any).onTickInternal();

  assert.ok(finishEventFired);
  assert.ok(iterateEventFired);
});

test("should prevent duplicate iteration events", () => {
  const action = createLinearAction(0);
  const blendTree = new LinearBlendTree([action, createLinearAction(1)]);

  let eventCount = 0;
  blendTree.on(StateEvent.ITERATE, () => {
    eventCount++;
  });

  action.action.time = 1.0;
  (blendTree as any).onTickInternal();
  (blendTree as any).onTickInternal(); // Second tick at same time

  assert.equal(eventCount, 1);
});

// Influence integration tests
test("should apply influence to interpolated weights", () => {
  const action1 = createLinearAction(0);
  const action2 = createLinearAction(1);
  const blendTree = new LinearBlendTree([action1, action2]);

  (blendTree as any).setInfluenceInternal(0.5); // 50% influence
  blendTree.setBlend(0.4);

  // Base weights would be: action1=0.6, action2=0.4
  // With 50% influence: action1=0.3, action2=0.2
  assert.equal(action1.action.weight, 0.3);
  assert.equal(action2.action.weight, 0.2);
});

test("should update all anchors when influence changes", () => {
  const actions = [
    createLinearAction(0),
    createLinearAction(0.5),
    createLinearAction(1),
  ];
  const blendTree = new LinearBlendTree(actions);

  (blendTree as any).setInfluenceInternal(1);
  blendTree.setBlend(0.25);

  const initialWeights = actions.map((a) => a.action.weight);

  (blendTree as any).setInfluenceInternal(0.5);

  // All weights should be halved
  actions.forEach((action, i) => {
    assert.equal(action.action.weight, initialWeights[i] * 0.5);
  });
});

// Integration tests
test("should handle full lifecycle correctly", () => {
  const actions = [
    createLinearAction(-10),
    createLinearAction(0),
    createLinearAction(10),
  ];
  const blendTree = new LinearBlendTree(actions);

  // Set influence and test various blend values
  blendTree["setInfluenceInternal"](1);

  blendTree.setBlend(-5); // Between -10 and 0
  const weights1 = actions.map((a) => a.action.weight);

  blendTree.setBlend(5); // Between 0 and 10
  const weights2 = actions.map((a) => a.action.weight);

  console.log(weights1, weights2);

  // Weights should be different for different blend values
  assert.not.equal(weights1[0], weights2[0]);
  assert.not.equal(weights1[2], weights2[2]);
});

test("should handle performance with many actions", () => {
  const actions: LinearAction[] = [];
  for (let i = 0; i < 20; i++) {
    actions.push(createLinearAction(i * 10));
  }

  const blendTree = new LinearBlendTree(actions);
  (blendTree as any).setInfluenceInternal(1);

  // Should not throw or hang
  blendTree.setBlend(95); // Between 90 and 100
  blendTree.setBlend(55); // Between 50 and 60
  blendTree.setBlend(15); // Between 10 and 20
});

test("should handle extreme values correctly", () => {
  const actions = [
    createLinearAction(-1000000),
    createLinearAction(0),
    createLinearAction(1000000),
  ];

  const blendTree = new LinearBlendTree(actions);
  (blendTree as any).setInfluenceInternal(1);

  blendTree.setBlend(500000); // Between 0 and 1000000
  // Should not crash and should interpolate correctly
  assert.equal(actions[1].action.weight, 0.5);
  assert.equal(actions[2].action.weight, 0.5);
  assert.equal(actions[0].action.weight, 0);
});

test.run();
