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

  assertEqualWithTolerance(lAction.action.weight, lWeight, "lAction weight");
  assertEqualWithTolerance(rAction.action.weight, rWeight, "rAction weight");
  assertEqualWithTolerance(
    lAction.action.weight + rAction.action.weight,
    1,
    "sum of weights",
  );
}

test("setBlend: only one ring: beyond", () => {
  testOneRingBlending(0, 1.1);
});

test("setBlend: only one ring: beyond", () => {
  testOneRingBlending(0.1, 1.1);
});

test("setBlend: only one ring: beyond", () => {
  testOneRingBlending(Math.PI / 4, 1.1);
});

test("setBlend: only one ring: beyond", () => {
  testOneRingBlending(Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: only one ring: beyond", () => {
  testOneRingBlending(Math.PI, 1.1);
});

test("setBlend: only one ring: beyond", () => {
  testOneRingBlending(-Math.PI / 4, 1.1);
});

test("setBlend: only one ring: beyond", () => {
  testOneRingBlending(-Math.PI / 4 + 0.1, 1.1);
});

test("setBlend: only one ring: exact", () => {
  testOneRingBlending(0, 1);
});

test("setBlend: only one ring: exact", () => {
  testOneRingBlending(0.1, 1);
});

test("setBlend: only one ring: exact", () => {
  testOneRingBlending(Math.PI / 4, 1);
});

test("setBlend: only one ring: exact", () => {
  testOneRingBlending(Math.PI / 4 + 0.1, 1);
});

test("setBlend: only one ring: exact", () => {
  testOneRingBlending(Math.PI, 1);
});

test("setBlend: only one ring: exact", () => {
  testOneRingBlending(-Math.PI / 4, 1);
});

test("setBlend: only one ring: exact", () => {
  testOneRingBlending(-Math.PI / 4 + 0.1, 1);
});

test("setBlend: only one ring: within", () => {
  testOneRingBlending(0, 0.9);
});

test("setBlend: only one ring: within", () => {
  testOneRingBlending(0.1, 0.9);
});

test("setBlend: only one ring: within", () => {
  testOneRingBlending(Math.PI / 4, 0.9);
});

test("setBlend: only one ring: within", () => {
  testOneRingBlending(Math.PI / 4 + 0.1, 0.9);
});

test("setBlend: only one ring: within", () => {
  testOneRingBlending(Math.PI, 0.9);
});

test("setBlend: only one ring: within", () => {
  testOneRingBlending(-Math.PI / 4, 0.9);
});

test("setBlend: only one ring: within", () => {
  testOneRingBlending(-Math.PI / 4 + 0.1, 0.9);
});

test.run();
