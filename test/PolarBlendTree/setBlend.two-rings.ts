import { test } from "uvu";
import {
  assertEqualWithTolerance,
  lerpAngular,
  lerpLinear,
} from "../miscellaneous/miscellaneous";
import { buildMockPolarAction } from "../mocks/buildMockAction";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

function testTwoRingsBlending(azimuth: number, radius: number): void {
  /*
    Circle points:
      lValue: -45 degrees (-π/4)
      rValue: 45 degrees (π/4)

          y
          |    * lValue
          |
    ------*--0.5--1x
          |
          |    * rValue

    PS: I won't draw two circles, use your imagination
  */

  const innerRadius = 0.5;
  const outerRadius = 1;

  const lValue = -Math.PI / 4;
  const rValue = Math.PI / 4;

  const tlAction = buildMockPolarAction(outerRadius, lValue);
  const trAction = buildMockPolarAction(outerRadius, rValue);
  const blAction = buildMockPolarAction(innerRadius, lValue);
  const brAction = buildMockPolarAction(innerRadius, rValue);

  const tree = new PolarBlendTreeProxy([
    tlAction,
    trAction,
    blAction,
    brAction,
  ]);

  tree.invokeSetInfluence(1);
  tree.setBlend(azimuth, radius);

  const clampedRadius = Math.min(Math.max(radius, innerRadius), outerRadius);

  const [rWeight, lWeight] = lerpAngular(azimuth, rValue, lValue);
  const [bWeight, tWeight] = lerpLinear(
    clampedRadius,
    innerRadius,
    outerRadius,
  );

  const tlWeight = tWeight * lWeight;
  const trWeight = tWeight * rWeight;
  const blWeight = bWeight * lWeight;
  const brWeight = bWeight * rWeight;

  assertEqualWithTolerance(
    tlAction.action.weight,
    tlWeight,
    `Weight TL: expected ${tlWeight.toFixed(2)}, got ${tlAction.action.weight.toFixed(2)}`,
  );
  assertEqualWithTolerance(
    trAction.action.weight,
    trWeight,
    `Weight TR: expected ${trWeight.toFixed(2)}, got ${trAction.action.weight.toFixed(2)}`,
  );
  assertEqualWithTolerance(
    blAction.action.weight,
    blWeight,
    `Weight BL: expected ${blWeight.toFixed(2)}, got ${blAction.action.weight.toFixed(2)}`,
  );
  assertEqualWithTolerance(
    brAction.action.weight,
    brWeight,
    `Weight BR: expected ${brWeight.toFixed(2)}, got ${brAction.action.weight.toFixed(2)}`,
  );
  assertEqualWithTolerance(
    tlAction.action.weight +
      trAction.action.weight +
      blAction.action.weight +
      brAction.action.weight,
    1,
    `Sum of weights should equal 1, got ${tlAction.action.weight + trAction.action.weight + blAction.action.weight + brAction.action.weight}`,
  );
}

test("setBlend: two rings: beyond: should blend at center point between two actions", () => {
  testTwoRingsBlending(0, 1.1);
});

test("setBlend: two rings: beyond: should blend slightly towards second action", () => {
  testTwoRingsBlending(0.1, 1.1);
});

test("setBlend: two rings: beyond: should blend exactly at second action position", () => {
  testTwoRingsBlending(Math.PI / 4, 1.1);
});

test("setBlend: two rings: beyond: should blend past second action position", () => {
  testTwoRingsBlending(Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: two rings: beyond: should handle opposite direction blend", () => {
  testTwoRingsBlending(Math.PI, 1.1);
});

test("setBlend: two rings: beyond: should blend exactly at first action position", () => {
  testTwoRingsBlending(-Math.PI / 4, 1.1);
});

test("setBlend: two rings: beyond: should blend slightly past first action position", () => {
  testTwoRingsBlending(-Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: two rings: exact outer: should blend at center point between two actions", () => {
  testTwoRingsBlending(0, 1);
});

test("setBlend: two rings: exact outer: should blend slightly towards second action", () => {
  testTwoRingsBlending(0.1, 1);
});

test("setBlend: two rings: exact outer: should blend exactly at second action position", () => {
  testTwoRingsBlending(Math.PI / 4, 1);
});

test("setBlend: two rings: exact outer: should blend past second action position", () => {
  testTwoRingsBlending(Math.PI / 4 + 0.1, 1);
});

test("setBlend: two rings: exact outer: should handle opposite direction blend", () => {
  testTwoRingsBlending(Math.PI, 1);
});

test("setBlend: two rings: exact outer: should blend exactly at first action position", () => {
  testTwoRingsBlending(-Math.PI / 4, 1);
});

test("setBlend: two rings: exact outer: should blend slightly past first action position", () => {
  testTwoRingsBlending(-Math.PI / 4 + 0.1, 1);
});

test("setBlend: two rings: between: should blend at center point between two actions", () => {
  testTwoRingsBlending(0, 0.8);
});

test("setBlend: two rings: between: should blend slightly towards second action", () => {
  testTwoRingsBlending(0.1, 0.8);
});

test("setBlend: two rings: between: should blend exactly at second action position", () => {
  testTwoRingsBlending(Math.PI / 4, 0.8);
});

test("setBlend: two rings: between: should blend past second action position", () => {
  testTwoRingsBlending(Math.PI / 4 + 0.1, 0.8);
});

test("setBlend: two rings: between: should handle opposite direction blend", () => {
  testTwoRingsBlending(Math.PI, 0.8);
});

test("setBlend: two rings: between: should blend exactly at first action position", () => {
  testTwoRingsBlending(-Math.PI / 4, 0.8);
});

test("setBlend: two rings: between: should blend slightly past first action position", () => {
  testTwoRingsBlending(-Math.PI / 4 + 0.1, 0.8);
});

test("setBlend: two rings: exact inner: should blend at center point between two actions", () => {
  testTwoRingsBlending(0, 0.5);
});

test("setBlend: two rings: exact inner: should blend slightly towards second action", () => {
  testTwoRingsBlending(0.1, 0.5);
});

test("setBlend: two rings: exact inner: should blend exactly at second action position", () => {
  testTwoRingsBlending(Math.PI / 4, 0.5);
});

test("setBlend: two rings: exact inner: should blend past second action position", () => {
  testTwoRingsBlending(Math.PI / 4 + 0.1, 0.5);
});

test("setBlend: two rings: exact inner: should handle opposite direction blend", () => {
  testTwoRingsBlending(Math.PI, 0.5);
});

test("setBlend: two rings: exact inner: should blend exactly at first action position", () => {
  testTwoRingsBlending(-Math.PI / 4, 0.5);
});

test("setBlend: two rings: exact inner: should blend slightly past first action position", () => {
  testTwoRingsBlending(-Math.PI / 4 + 0.1, 0.5);
});

test("setBlend: two rings: within: should blend at center point between two actions", () => {
  testTwoRingsBlending(0, 0.25);
});

test("setBlend: two rings: within: should blend slightly towards second action", () => {
  testTwoRingsBlending(0.1, 0.25);
});

test("setBlend: two rings: within: should blend exactly at second action position", () => {
  testTwoRingsBlending(Math.PI / 4, 0.25);
});

test("setBlend: two rings: within: should blend past second action position", () => {
  testTwoRingsBlending(Math.PI / 4 + 0.1, 0.25);
});

test("setBlend: two rings: within: should handle opposite direction blend", () => {
  testTwoRingsBlending(Math.PI, 0.25);
});

test("setBlend: two rings: within: should blend exactly at first action position", () => {
  testTwoRingsBlending(-Math.PI / 4, 0.25);
});

test("setBlend: two rings: within: should blend slightly past first action position", () => {
  testTwoRingsBlending(-Math.PI / 4 + 0.1, 0.25);
});

test.run();
