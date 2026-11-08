import { LoopRepeat } from "three";
import { expect, test } from "vitest";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { buildMockLinearAction } from "../mocks/buildMockAction";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";

test("constructor: should throw error when fewer than 2 actions provided", () => {
  expect(
    () => new LinearBlendTreeProxy([buildMockLinearAction(0)]),
    "Need at least 2 actions",
  ).toThrow();
});

test("constructor: should throw error when action duration is less than or equal to zero", () => {
  expect(() => {
    new LinearBlendTreeProxy([
      buildMockLinearAction(1, LoopRepeat, 1),
      buildMockLinearAction(1, LoopRepeat, 0),
      buildMockLinearAction(1, LoopRepeat, 1),
    ]);
  }, "Action duration must be greater than zero").toThrow();
});

test("constructor: should throw error for invalid linear action values", () => {
  expect(
    () => new LinearBlendTreeProxy([buildMockLinearAction(0), buildMockLinearAction(NaN)]),
  ).toThrow(/value must be a finite number/);

  expect(
    () => new LinearBlendTreeProxy([buildMockLinearAction(0), buildMockLinearAction(Infinity)]),
  ).toThrow(/value must be a finite number/);

  expect(
    () => new LinearBlendTreeProxy([buildMockLinearAction(0), buildMockLinearAction(-Infinity)]),
  ).toThrow(/value must be a finite number/);

  expect(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(0),
        buildMockLinearAction(Number.MAX_SAFE_INTEGER + 1),
      ]),
  ).toThrow(/value exceeds maximum safe integer range/);

  expect(
    () =>
      new LinearBlendTreeProxy([
        buildMockLinearAction(0),
        buildMockLinearAction(-Number.MAX_SAFE_INTEGER - 1),
      ]),
  ).toThrow(/value exceeds maximum safe integer range/);
});

test("constructor: should throw error when multiple actions have same value", () => {
  expect(
    () => new LinearBlendTreeProxy([buildMockLinearAction(0.5), buildMockLinearAction(0.5)]),
  ).toThrow(/Duplicate value found/);
});

test("constructor: should initialize actions to stopped state", () => {
  const action1 = buildMockLinearAction(0);
  const action2 = buildMockLinearAction(1);

  action1.action.play();
  action2.action.play();

  action1.action.time = 0.5;
  action1.action.weight = 0.7;
  action2.action.time = 0.3;
  action2.action.weight = 0.4;

  new LinearBlendTreeProxy([action1, action2]);

  assertEqualWithTolerance(action1.action.time, 0, "action1 time");
  assertEqualWithTolerance(action1.action.weight, 0, "action1 weight");
  expect(action1.action.isRunning(), "action1 should not be running").toEqual(false);
  assertEqualWithTolerance(action2.action.time, 0, "action2 time");
  assertEqualWithTolerance(action2.action.weight, 0, "action2 weight");
  expect(action2.action.isRunning(), "action2 should not be running").toEqual(false);
});
