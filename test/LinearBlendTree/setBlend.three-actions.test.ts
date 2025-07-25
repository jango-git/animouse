import { test } from "uvu";
import {
  assertEqualWithTolerance,
  lerpLinear,
} from "../miscellaneous/miscellaneous";
import { buildMockLinearAction } from "../mocks/buildMockAction";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";

function testLinearBlending(value: number): void {
  /*
    Linear values:
    ---(-1)---(0)---(1)---
  */

  const lValue = -1;
  const cValue = 0;
  const rValue = 1;

  const lAction = buildMockLinearAction(lValue);
  const cAction = buildMockLinearAction(cValue);
  const rAction = buildMockLinearAction(rValue);

  const tree = new LinearBlendTreeProxy([lAction, cAction, rAction]);
  tree.invokeSetInfluence(1);
  tree.setBlend(value);

  const clampedValue = Math.min(Math.max(value, lValue), rValue);

  let lWeight = 0;
  let cWeight = 0;
  let rWeight = 0;

  if (value <= cValue) {
    const [oneWeight, twoWeight] = lerpLinear(clampedValue, lValue, cValue);
    lWeight = oneWeight;
    cWeight = twoWeight;
    rWeight = 0;
  } else {
    const [oneWeight, twoWeight] = lerpLinear(clampedValue, cValue, rValue);
    lWeight = 0;
    cWeight = oneWeight;
    rWeight = twoWeight;
  }

  assertEqualWithTolerance(
    lAction.action.weight,
    lWeight,
    `Weight L: expected ${lWeight.toFixed(2)}, got ${lAction.action.weight.toFixed(2)}`,
  );
  assertEqualWithTolerance(
    cAction.action.weight,
    cWeight,
    `Weight C: expected ${cWeight.toFixed(2)}, got ${cAction.action.weight.toFixed(2)}`,
  );
  assertEqualWithTolerance(
    rAction.action.weight,
    rWeight,
    `Weight R: expected ${rWeight.toFixed(2)}, got ${rAction.action.weight.toFixed(2)}`,
  );
  assertEqualWithTolerance(
    lAction.action.weight + cAction.action.weight + rAction.action.weight,
    1,
    `Sum of weights should equal 1, got ${lAction.action.weight + cAction.action.weight + rAction.action.weight.toFixed(2)}`,
  );
}

test("setBlend: three actions: beyond left", () => {
  testLinearBlending(-2);
});

test("setBlend: three actions: exact left", () => {
  testLinearBlending(-1);
});

test("setBlend: three actions: between left and center", () => {
  testLinearBlending(-0.5);
});

test("setBlend: three actions: exact center", () => {
  testLinearBlending(0);
});

test("setBlend: three actions: between center and right", () => {
  testLinearBlending(0.5);
});

test("setBlend: three actions: exact right", () => {
  testLinearBlending(1);
});

test("setBlend: three actions: beyond right", () => {
  testLinearBlending(2);
});

test.run();
