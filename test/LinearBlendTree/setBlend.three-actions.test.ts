import { test } from "uvu";
import {
  assertEqualWithTolerance,
  lerpLinear,
} from "../miscellaneous/miscellaneous";
import { buildMockLinearAction } from "../mocks/buildMockAction";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";

function testLinearBlending(
  value: number,
  lMessage: string,
  cMessage: string,
  rMessage: string,
): void {
  const lValue = -1;
  const cValue = 0;
  const rValue = 1;

  const lAction = buildMockLinearAction(lValue);
  const cAction = buildMockLinearAction(cValue);
  const rAction = buildMockLinearAction(rValue);

  const blendTree = new LinearBlendTreeProxy([lAction, cAction, rAction]);
  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(value);

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

  assertEqualWithTolerance(lAction.action.weight, lWeight, lMessage);
  assertEqualWithTolerance(cAction.action.weight, cWeight, cMessage);
  assertEqualWithTolerance(rAction.action.weight, rWeight, rMessage);
  assertEqualWithTolerance(
    lAction.action.weight + rAction.action.weight + cAction.action.weight,
    1,
    "Sum of weights should equal 1",
  );
}

test("setBlend: three actions: beyond left: should clamp to leftmost action", () => {
  testLinearBlending(
    -2,
    "left action should have weight 1",
    "center action should have weight 0",
    "right action should have weight 0",
  );
});

test("setBlend: three actions: exact left: should give full weight to leftmost action", () => {
  testLinearBlending(
    -1,
    "left action should have weight 1",
    "center action should have weight 0",
    "right action should have weight 0",
  );
});

test("setBlend: three actions: between left and center: should interpolate between left and center actions", () => {
  testLinearBlending(
    -0.5,
    "left action should have weight 0.5",
    "center action should have weight 0.5",
    "right action should have weight 0",
  );
});

test("setBlend: three actions: exact center: should give full weight to center action", () => {
  testLinearBlending(
    0,
    "left action should have weight 0",
    "center action should have weight 1",
    "right action should have weight 0",
  );
});

test("setBlend: three actions: between center and right: should interpolate between center and right actions", () => {
  testLinearBlending(
    0.5,
    "left action should have weight 0",
    "center action should have weight 0.5",
    "right action should have weight 0.5",
  );
});

test("setBlend: three actions: exact right: should give full weight to rightmost action", () => {
  testLinearBlending(
    1,
    "left action should have weight 0",
    "center action should have weight 0",
    "right action should have weight 1",
  );
});

test("setBlend: three actions: beyond right: should clamp to rightmost action", () => {
  testLinearBlending(
    2,
    "left action should have weight 0",
    "center action should have weight 0",
    "right action should have weight 1",
  );
});

test.run();
