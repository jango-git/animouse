import { LoopRepeat } from "three";
import { expect, test } from "vitest";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
import { buildMockFreeformAction } from "../mocks/buildMockAction";
import { FreeformBlendTreeProxy } from "../proxies/FreeformBlendTreeProxy";

test("constructor: should throw error when fewer than 2 actions provided", () => {
  expect(() => new FreeformBlendTreeProxy([buildMockFreeformAction(0, 0)])).toThrow(/at least 3/);
});

test("constructor: should throw error when action duration is less than or equal to zero", () => {
  expect(() => {
    new FreeformBlendTreeProxy([
      buildMockFreeformAction(0, 0, LoopRepeat, 1),
      buildMockFreeformAction(1, 0, LoopRepeat, 0),
      buildMockFreeformAction(0, 1, LoopRepeat, 1),
    ]);
  }, "Action duration must be greater than zero").toThrow();
});

test("constructor: should throw error for invalid freeform action values", () => {
  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(NaN, 0),
        buildMockFreeformAction(1, 1),
      ]),
  ).toThrow(/value must be a finite number/);

  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(Infinity, 0),
        buildMockFreeformAction(1, 1),
      ]),
  ).toThrow(/value must be a finite number/);

  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(-Infinity, 0),
        buildMockFreeformAction(1, 1),
      ]),
  ).toThrow(/value must be a finite number/);

  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(Number.MAX_SAFE_INTEGER + 1, 0),
        buildMockFreeformAction(1, 1),
      ]),
  ).toThrow(/value exceeds maximum safe integer range/);

  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(-Number.MAX_SAFE_INTEGER - 1, 0),
        buildMockFreeformAction(1, 1),
      ]),
  ).toThrow(/value exceeds maximum safe integer range/);

  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(0, NaN),
        buildMockFreeformAction(1, 1),
      ]),
  ).toThrow(/value must be a finite number/);

  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(0, Infinity),
        buildMockFreeformAction(1, 1),
      ]),
  ).toThrow(/value must be a finite number/);

  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(0, -Infinity),
        buildMockFreeformAction(1, 1),
      ]),
  ).toThrow(/value must be a finite number/);

  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(0, Number.MAX_SAFE_INTEGER + 1),
        buildMockFreeformAction(1, 1),
      ]),
  ).toThrow(/value exceeds maximum safe integer range/);

  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0, 0),
        buildMockFreeformAction(0, -Number.MAX_SAFE_INTEGER - 1),
        buildMockFreeformAction(1, 1),
      ]),
  ).toThrow(/value exceeds maximum safe integer range/);
});

test("constructor: should throw error when multiple actions have same value", () => {
  expect(
    () =>
      new FreeformBlendTreeProxy([
        buildMockFreeformAction(0.5, 1),
        buildMockFreeformAction(0.5, 0),
        buildMockFreeformAction(0.5, 1),
      ]),
  ).toThrow(/Duplicate coordinates found/);
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

  assertEqualWithTolerance(action1.action.time, 0, "action1 time");
  assertEqualWithTolerance(action1.action.weight, 0, "action1 weight");
  expect(action1.action.isRunning(), "action1 should not be running").toEqual(false);
  assertEqualWithTolerance(action2.action.time, 0, "action2 time");
  assertEqualWithTolerance(action2.action.weight, 0, "action2 weight");
  expect(action2.action.isRunning(), "action2 should not be running").toEqual(false);
});
