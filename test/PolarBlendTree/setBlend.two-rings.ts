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

  assertEqualWithTolerance(tlAction.action.weight, tlWeight, "tlAction weight");
  assertEqualWithTolerance(trAction.action.weight, trWeight, "trAction weight");
  assertEqualWithTolerance(blAction.action.weight, blWeight, "blAction weight");
  assertEqualWithTolerance(brAction.action.weight, brWeight, "brAction weight");
  assertEqualWithTolerance(
    tlAction.action.weight +
      trAction.action.weight +
      blAction.action.weight +
      brAction.action.weight,
    1,
    "sum of weights",
  );
}

test("setBlend: two rings: beyond", () => {
  testTwoRingsBlending(0, 1.1);
});

test("setBlend: two rings: beyond", () => {
  testTwoRingsBlending(0.1, 1.1);
});

test("setBlend: two rings: beyond", () => {
  testTwoRingsBlending(Math.PI / 4, 1.1);
});

test("setBlend: two rings: beyond", () => {
  testTwoRingsBlending(Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: two rings: beyond", () => {
  testTwoRingsBlending(Math.PI, 1.1);
});

test("setBlend: two rings: beyond", () => {
  testTwoRingsBlending(-Math.PI / 4, 1.1);
});

test("setBlend: two rings: beyond", () => {
  testTwoRingsBlending(-Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: two rings: exact outer", () => {
  testTwoRingsBlending(0, 1);
});

test("setBlend: two rings: exact outer", () => {
  testTwoRingsBlending(0.1, 1);
});

test("setBlend: two rings: exact outer", () => {
  testTwoRingsBlending(Math.PI / 4, 1);
});

test("setBlend: two rings: exact outer", () => {
  testTwoRingsBlending(Math.PI / 4 + 0.1, 1);
});

test("setBlend: two rings: exact outer", () => {
  testTwoRingsBlending(Math.PI, 1);
});

test("setBlend: two rings: exact outer", () => {
  testTwoRingsBlending(-Math.PI / 4, 1);
});

test("setBlend: two rings: exact outer", () => {
  testTwoRingsBlending(-Math.PI / 4 + 0.1, 1);
});

test("setBlend: two rings: between", () => {
  testTwoRingsBlending(0, 0.8);
});

test("setBlend: two rings: between", () => {
  testTwoRingsBlending(0.1, 0.8);
});

test("setBlend: two rings: between", () => {
  testTwoRingsBlending(Math.PI / 4, 0.8);
});

test("setBlend: two rings: between", () => {
  testTwoRingsBlending(Math.PI / 4 + 0.1, 0.8);
});

test("setBlend: two rings: between", () => {
  testTwoRingsBlending(Math.PI, 0.8);
});

test("setBlend: two rings: between", () => {
  testTwoRingsBlending(-Math.PI / 4, 0.8);
});

test("setBlend: two rings: between", () => {
  testTwoRingsBlending(-Math.PI / 4 + 0.1, 0.8);
});

test("setBlend: two rings: exact inner", () => {
  testTwoRingsBlending(0, 0.5);
});

test("setBlend: two rings: exact inner", () => {
  testTwoRingsBlending(0.1, 0.5);
});

test("setBlend: two rings: exact inner", () => {
  testTwoRingsBlending(Math.PI / 4, 0.5);
});

test("setBlend: two rings: exact inner", () => {
  testTwoRingsBlending(Math.PI / 4 + 0.1, 0.5);
});

test("setBlend: two rings: exact inner", () => {
  testTwoRingsBlending(Math.PI, 0.5);
});

test("setBlend: two rings: exact inner", () => {
  testTwoRingsBlending(-Math.PI / 4, 0.5);
});

test("setBlend: two rings: exact inner", () => {
  testTwoRingsBlending(-Math.PI / 4 + 0.1, 0.5);
});

test("setBlend: two rings: within", () => {
  testTwoRingsBlending(0, 0.25);
});

test("setBlend: two rings: within", () => {
  testTwoRingsBlending(0.1, 0.25);
});

test("setBlend: two rings: within", () => {
  testTwoRingsBlending(Math.PI / 4, 0.25);
});

test("setBlend: two rings: within", () => {
  testTwoRingsBlending(Math.PI / 4 + 0.1, 0.25);
});

test("setBlend: two rings: within", () => {
  testTwoRingsBlending(Math.PI, 0.25);
});

test("setBlend: two rings: within", () => {
  testTwoRingsBlending(-Math.PI / 4, 0.25);
});

test("setBlend: two rings: within", () => {
  testTwoRingsBlending(-Math.PI / 4 + 0.1, 0.25);
});

test.run();
