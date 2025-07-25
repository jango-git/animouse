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

  assertEqualWithTolerance(
    lAction.action.weight,
    lWeight,
    `Weight L: expected ${lWeight.toFixed(2)}, got ${lAction.action.weight.toFixed(2)}`,
  );
  assertEqualWithTolerance(
    rAction.action.weight,
    rWeight,
    `Weight R: expected ${rWeight.toFixed(2)}, got ${rAction.action.weight.toFixed(2)}`,
  );
  assertEqualWithTolerance(
    cAction.weight,
    cWeight,
    `Weight C: expected ${cWeight.toFixed(2)}, got ${cAction.weight.toFixed(2)}`,
  );
  assertEqualWithTolerance(
    lAction.action.weight + rAction.action.weight + cAction.weight,
    1,
    `Sum of weights should equal 1, got ${lAction.action.weight + rAction.action.weight + cAction.weight.toFixed(2)}`,
  );
}

test("setBlend: ring and center: beyond: should blend at center point between two actions", () => {
  testOneRingAndCenterBlending(0, 1.1);
});

test("setBlend: ring and center: beyond: should blend slightly towards second action", () => {
  testOneRingAndCenterBlending(0.1, 1.1);
});

test("setBlend: ring and center: beyond: should blend exactly at second action position", () => {
  testOneRingAndCenterBlending(Math.PI / 4, 1.1);
});

test("setBlend: ring and center: beyond: should blend past second action position", () => {
  testOneRingAndCenterBlending(Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: ring and center: beyond: should handle opposite direction blend", () => {
  testOneRingAndCenterBlending(Math.PI, 1.1);
});

test("setBlend: ring and center: beyond: should blend exactly at first action position", () => {
  testOneRingAndCenterBlending(-Math.PI / 4, 1.1);
});

test("setBlend: ring and center: beyond: should blend exactly at second action position", () => {
  testOneRingAndCenterBlending(Math.PI / 4, 1.1);
});

test("setBlend: ring and center: beyond: should blend slightly past first action position", () => {
  testOneRingAndCenterBlending(-Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: ring and center: exact: should blend at center point between two actions", () => {
  testOneRingAndCenterBlending(0, 1);
});

test("setBlend: ring and center: exact: should blend slightly towards second action", () => {
  testOneRingAndCenterBlending(0.1, 1);
});

test("setBlend: ring and center: exact: should blend exactly at second action position", () => {
  testOneRingAndCenterBlending(Math.PI / 4, 1);
});

test("setBlend: ring and center: exact: should blend past second action position", () => {
  testOneRingAndCenterBlending(Math.PI / 4 + 0.1, 1);
});

test("setBlend: ring and center: exact: should handle opposite direction blend", () => {
  testOneRingAndCenterBlending(Math.PI, 1);
});

test("setBlend: ring and center: exact: should blend exactly at first action position", () => {
  testOneRingAndCenterBlending(-Math.PI / 4, 1);
});

test("setBlend: ring and center: exact: should blend slightly past first action position", () => {
  testOneRingAndCenterBlending(-Math.PI / 4 + 0.1, 1);
});

test("setBlend: ring and center: within: should blend at center point between two actions", () => {
  testOneRingAndCenterBlending(0, 0.75);
});

test("setBlend: ring and center: within: should blend slightly towards second action", () => {
  testOneRingAndCenterBlending(0.1, 0.75);
});

test("setBlend: ring and center: within: should blend exactly at second action position", () => {
  testOneRingAndCenterBlending(Math.PI / 4, 0.75);
});

test("setBlend: ring and center: within: should blend past second action position", () => {
  testOneRingAndCenterBlending(Math.PI / 4 + 0.1, 0.75);
});

test("setBlend: ring and center: within: should handle opposite direction blend", () => {
  testOneRingAndCenterBlending(Math.PI, 0.75);
});

test("setBlend: ring and center: within: should blend exactly at first action position", () => {
  testOneRingAndCenterBlending(-Math.PI / 4, 0.75);
});

test("setBlend: ring and center: within: should blend slightly past first action position", () => {
  testOneRingAndCenterBlending(-Math.PI / 4 + 0.1, 0.75);
});

test("setBlend: ring and center: center: should blend at center point between two actions", () => {
  testOneRingAndCenterBlending(0, 0);
});

test("setBlend: ring and center: center: should blend slightly towards second action", () => {
  testOneRingAndCenterBlending(0.1, 0);
});

test("setBlend: ring and center: center: should blend exactly at second action position", () => {
  testOneRingAndCenterBlending(Math.PI / 4, 0);
});

test("setBlend: ring and center: center: should blend past second action position", () => {
  testOneRingAndCenterBlending(Math.PI / 4 + 0.1, 0);
});

test("setBlend: ring and center: center: should handle opposite direction blend", () => {
  testOneRingAndCenterBlending(Math.PI, 0);
});

test("setBlend: ring and center: center: should blend exactly at first action position", () => {
  testOneRingAndCenterBlending(-Math.PI / 4, 0);
});

test("setBlend: ring and center: center: should blend slightly past first action position", () => {
  testOneRingAndCenterBlending(-Math.PI / 4 + 0.1, 0);
});

test.run();
