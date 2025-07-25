import { test } from "uvu";
import {
  assertEqualWithTolerance,
  lerpAngular,
} from "../miscellaneous/miscellaneous";
import { buildMockPolarAction } from "../mocks/buildMockAction";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

function testOneRingBlending(azimuth: number, radius: number): void {
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
  const tree = new PolarBlendTreeProxy([lAction, rAction]);

  tree.invokeSetInfluence(1);
  tree.setBlend(azimuth, radius);

  const [rWeight, lWeight] = lerpAngular(azimuth, rValue, lValue);

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
    lAction.action.weight + rAction.action.weight,
    1,
    `Sum of weights should equal 1, got ${lAction.action.weight + rAction.action.weight}`,
  );
}

test("setBlend: only one ring: beyond: should blend at center point between two actions", () => {
  testOneRingBlending(0, 1.1);
});

test("setBlend: only one ring: beyond: should blend slightly towards second action", () => {
  testOneRingBlending(0.1, 1.1);
});

test("setBlend: only one ring: beyond: should blend exactly at second action position", () => {
  testOneRingBlending(Math.PI / 4, 1.1);
});

test("setBlend: only one ring: beyond: should blend past second action position", () => {
  testOneRingBlending(Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: only one ring: beyond: should handle opposite direction blend", () => {
  testOneRingBlending(Math.PI, 1.1);
});

test("setBlend: only one ring: beyond: should blend exactly at first action position", () => {
  testOneRingBlending(-Math.PI / 4, 1.1);
});

test("setBlend: only one ring: beyond: should blend slightly past first action position", () => {
  testOneRingBlending(-Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: only one ring: exact: should blend at center point between two actions", () => {
  testOneRingBlending(0, 1);
});

test("setBlend: only one ring: exact: should blend slightly towards second action", () => {
  testOneRingBlending(0.1, 1);
});

test("setBlend: only one ring: exact: should blend exactly at second action position", () => {
  testOneRingBlending(Math.PI / 4, 1);
});

test("setBlend: only one ring: exact: should blend past second action position", () => {
  testOneRingBlending(Math.PI / 4 + 0.1, 1);
});

test("setBlend: only one ring: exact: should handle opposite direction blend", () => {
  testOneRingBlending(Math.PI, 1);
});

test("setBlend: only one ring: exact: should blend exactly at first action position", () => {
  testOneRingBlending(-Math.PI / 4, 1);
});

test("setBlend: only one ring: exact: should blend slightly past first action position", () => {
  testOneRingBlending(-Math.PI / 4 + 0.1, 1);
});

test("setBlend: only one ring: within: should blend at center point between two actions", () => {
  testOneRingBlending(0, 0.9);
});

test("setBlend: only one ring: within: should blend slightly towards second action", () => {
  testOneRingBlending(0.1, 0.9);
});

test("setBlend: only one ring: within: should blend exactly at second action position", () => {
  testOneRingBlending(Math.PI / 4, 0.9);
});

test("setBlend: only one ring: within: should blend past second action position", () => {
  testOneRingBlending(Math.PI / 4 + 0.1, 0.9);
});

test("setBlend: only one ring: within: should handle opposite direction blend", () => {
  testOneRingBlending(Math.PI, 0.9);
});

test("setBlend: only one ring: within: should blend exactly at first action position", () => {
  testOneRingBlending(-Math.PI / 4, 0.9);
});

test("setBlend: only one ring: within: should blend slightly past first action position", () => {
  testOneRingBlending(-Math.PI / 4 + 0.1, 0.9);
});

test.run();
