import { LoopRepeat } from "three";
import { expect, test } from "vitest";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { buildMockPolarAction } from "../mocks/buildMockAction";
import { buildMockAnimationAction } from "../mocks/buildMockAnimationAction";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

test("constructor: should throw error when fewer than 2 actions provided", () => {
  expect(
    () => new PolarBlendTreeProxy([buildMockPolarAction(1, 0)]),
    "Need at least 2 actions",
  ).toThrow();
});

test("constructor: should throw error when action duration is less than or equal to zero", () => {
  expect(() => {
    new PolarBlendTreeProxy([
      buildMockPolarAction(1, -1, LoopRepeat, 1),
      buildMockPolarAction(1, 0, LoopRepeat, 0),
      buildMockPolarAction(1, 1, LoopRepeat, 1),
    ]);
  }, "value must be greater or equal to").toThrow();

  expect(() => {
    new PolarBlendTreeProxy(
      [buildMockPolarAction(1, -1, LoopRepeat, 1), buildMockPolarAction(1, 1, LoopRepeat, 1)],
      buildMockAnimationAction(1, LoopRepeat, 0),
    );
  }, "value must be greater or equal to").toThrow();
});

test("constructor: should throw error for invalid linear action values", () => {
  expect(
    () => new PolarBlendTreeProxy([buildMockPolarAction(1, 0), buildMockPolarAction(NaN, 1)]),
  ).toThrow(/value must be a finite number/);

  expect(
    () => new PolarBlendTreeProxy([buildMockPolarAction(1, 0), buildMockPolarAction(Infinity, 1)]),
  ).toThrow(/value must be a finite number/);

  expect(
    () => new PolarBlendTreeProxy([buildMockPolarAction(1, 0), buildMockPolarAction(-Infinity, 1)]),
  ).toThrow(/value must be a finite number/);

  expect(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(Number.MAX_SAFE_INTEGER + 1, 1),
      ]),
  ).toThrow(/value exceeds maximum safe integer range/);

  expect(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(-Number.MAX_SAFE_INTEGER - 1, 1),
      ]),
  ).toThrow(/value exceeds maximum safe integer range/);

  expect(
    () => new PolarBlendTreeProxy([buildMockPolarAction(1, 0), buildMockPolarAction(1, NaN)]),
  ).toThrow(/value must be a finite number/);

  expect(
    () => new PolarBlendTreeProxy([buildMockPolarAction(1, 0), buildMockPolarAction(1, Infinity)]),
  ).toThrow(/value must be a finite number/);

  expect(
    () => new PolarBlendTreeProxy([buildMockPolarAction(1, 0), buildMockPolarAction(1, -Infinity)]),
  ).toThrow(/value must be a finite number/);

  expect(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(1, Number.MAX_SAFE_INTEGER + 1),
      ]),
  ).toThrow(/value exceeds maximum safe integer range/);

  expect(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(1, 0),
        buildMockPolarAction(1, -Number.MAX_SAFE_INTEGER - 1),
      ]),
  ).toThrow(/value exceeds maximum safe integer range/);
});

test("constructor: should throw error when multiple actions have same value", () => {
  expect(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(0.5, 0),
        buildMockPolarAction(0.5, 0),
        buildMockPolarAction(0.5, 0),
      ]),
  ).toThrow(/Duplicate coordinates found/);
});

test("constructor: should throw error when only one ray", () => {
  expect(
    () => new PolarBlendTreeProxy([buildMockPolarAction(0.5, 0), buildMockPolarAction(1, 0)]),
  ).toThrow(/At least two rays are required/);
  expect(
    () =>
      new PolarBlendTreeProxy([
        buildMockPolarAction(0.5, 0),
        buildMockPolarAction(0.75, 0),
        buildMockPolarAction(1, 0),
      ]),
  ).toThrow(/At least two rays are required/);
});

test("constructor: should throw error when anchors do not form a valid grid", () => {
  expect(
    () => new PolarBlendTreeProxy([buildMockPolarAction(0.5, -1), buildMockPolarAction(1, 1)]),
  ).toThrow(/valid grid/);
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
  expect(action1.action.isRunning(), "action1 should not be running").toEqual(false);
  assertEqualWithTolerance(action2.action.time, 0, "action2 time");
  assertEqualWithTolerance(action2.action.weight, 0, "action2 weight");
  expect(action2.action.isRunning(), "action2 should not be running").toEqual(false);
});
