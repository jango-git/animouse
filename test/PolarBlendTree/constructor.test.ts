import { LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { buildMockPolarAction } from "../mocks/buildMockAction";
import { buildMockAnimationAction } from "../mocks/buildMockAnimationAction";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

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

  action1.action.time = 0.5;
  action1.action.weight = 0.7;
  action2.action.time = 0.3;
  action2.action.weight = 0.4;
  central.time = 0.1;
  central.weight = 0.5;

  new PolarBlendTreeProxy([action1, action2], central);

  assertEqualWithTolerance(action1.action.time, 0, "action1 time");
  assertEqualWithTolerance(action1.action.weight, 0, "action1 weight");
  assert.equal(
    action1.action.isRunning(),
    false,
    "action1 should not be running",
  );
  assertEqualWithTolerance(action2.action.time, 0, "action2 time");
  assertEqualWithTolerance(action2.action.weight, 0, "action2 weight");
  assert.equal(
    action2.action.isRunning(),
    false,
    "action2 should not be running",
  );
});

test.run();
