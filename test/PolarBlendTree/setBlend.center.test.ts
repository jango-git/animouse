import { test } from "uvu";
import {
  assertEqualWithTolerance,
  lerpAngular,
} from "../miscellaneous/miscellaneous";
import { buildMockPolarAction } from "../mocks/buildMockAction";
import { buildMockAnimationAction } from "../mocks/buildMockAnimationAction";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

function testOneRingAndCenterBlending(azimuth: number, radius: number): void {
  /*
    Circle points:
      lValue: -45 degrees (-π/4)
      rValue: 45 degrees (π/4)

          y
          |    * lValue
          |
    ------*------x
          |
          |    * rValue
  */

  const lValue = -Math.PI / 4;
  const rValue = Math.PI / 4;

  const lAction = buildMockPolarAction(1, lValue);
  const rAction = buildMockPolarAction(1, rValue);
  const cAction = buildMockAnimationAction(1);
  const tree = new PolarBlendTreeProxy([lAction, rAction], cAction);

  tree.invokeSetInfluence(1);
  tree.setBlend(azimuth, radius);

  const [rRawWeight, lRawWeight] = lerpAngular(azimuth, rValue, lValue);
  const clampedRadius = Math.min(1, radius);

  const lWeight = lRawWeight * clampedRadius;
  const rWeight = rRawWeight * clampedRadius;
  const cWeight = 1 - clampedRadius;

  assertEqualWithTolerance(lAction.action.weight, lWeight, "lAction weight");
  assertEqualWithTolerance(rAction.action.weight, rWeight, "rAction weight");
  assertEqualWithTolerance(cAction.weight, cWeight, "cAction weight");
  assertEqualWithTolerance(
    lAction.action.weight + rAction.action.weight + cAction.weight,
    1,
    "sum of weights",
  );
}

test("setBlend: ring and center: beyond", () => {
  testOneRingAndCenterBlending(0, 1.1);
});

test("setBlend: ring and center: beyond", () => {
  testOneRingAndCenterBlending(0.1, 1.1);
});

test("setBlend: ring and center: beyond", () => {
  testOneRingAndCenterBlending(Math.PI / 4, 1.1);
});

test("setBlend: ring and center: beyond", () => {
  testOneRingAndCenterBlending(Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: ring and center: beyond", () => {
  testOneRingAndCenterBlending(Math.PI, 1.1);
});

test("setBlend: ring and center: beyond", () => {
  testOneRingAndCenterBlending(-Math.PI / 4, 1.1);
});

test("setBlend: ring and center: beyond", () => {
  testOneRingAndCenterBlending(Math.PI / 4, 1.1);
});

test("setBlend: ring and center: beyond", () => {
  testOneRingAndCenterBlending(-Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: ring and center: exact", () => {
  testOneRingAndCenterBlending(0, 1);
});

test("setBlend: ring and center: exact", () => {
  testOneRingAndCenterBlending(0.1, 1);
});

test("setBlend: ring and center: exact", () => {
  testOneRingAndCenterBlending(Math.PI / 4, 1);
});

test("setBlend: ring and center: exact", () => {
  testOneRingAndCenterBlending(Math.PI / 4 + 0.1, 1);
});

test("setBlend: ring and center: exact", () => {
  testOneRingAndCenterBlending(Math.PI, 1);
});

test("setBlend: ring and center: exact", () => {
  testOneRingAndCenterBlending(-Math.PI / 4, 1);
});

test("setBlend: ring and center: exact", () => {
  testOneRingAndCenterBlending(-Math.PI / 4 + 0.1, 1);
});

test("setBlend: ring and center: within", () => {
  testOneRingAndCenterBlending(0, 0.75);
});

test("setBlend: ring and center: within", () => {
  testOneRingAndCenterBlending(0.1, 0.75);
});

test("setBlend: ring and center: within", () => {
  testOneRingAndCenterBlending(Math.PI / 4, 0.75);
});

test("setBlend: ring and center: within", () => {
  testOneRingAndCenterBlending(Math.PI / 4 + 0.1, 0.75);
});

test("setBlend: ring and center: within", () => {
  testOneRingAndCenterBlending(Math.PI, 0.75);
});

test("setBlend: ring and center: within", () => {
  testOneRingAndCenterBlending(-Math.PI / 4, 0.75);
});

test("setBlend: ring and center: within", () => {
  testOneRingAndCenterBlending(-Math.PI / 4 + 0.1, 0.75);
});

test("setBlend: ring and center: center", () => {
  testOneRingAndCenterBlending(0, 0);
});

test("setBlend: ring and center: center", () => {
  testOneRingAndCenterBlending(0.1, 0);
});

test("setBlend: ring and center: center", () => {
  testOneRingAndCenterBlending(Math.PI / 4, 0);
});

test("setBlend: ring and center: center", () => {
  testOneRingAndCenterBlending(Math.PI / 4 + 0.1, 0);
});

test("setBlend: ring and center: center", () => {
  testOneRingAndCenterBlending(Math.PI, 0);
});

test("setBlend: ring and center: center", () => {
  testOneRingAndCenterBlending(-Math.PI / 4, 0);
});

test("setBlend: ring and center: center", () => {
  testOneRingAndCenterBlending(-Math.PI / 4 + 0.1, 0);
});

test.run();
