import { test } from "uvu";
import {
  assertEqualWithTolerance,
  lerpAngular,
  lerpLinear,
} from "../miscellaneous/miscellaneous";
import { buildMockPolarAction } from "../mocks/buildMockAction";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

function testTwoRingsBlending(
  azimuth: number,
  radius: number,
  tlMessage: string,
  trMessage: string,
  blMessage: string,
  brMessage: string,
): void {
  const minRadius = 0.5;
  const maxRadius = 1;

  const lValue = -Math.PI / 4;
  const rValue = Math.PI / 4;

  const tlAction = buildMockPolarAction(maxRadius, lValue);
  const trAction = buildMockPolarAction(maxRadius, rValue);
  const blAction = buildMockPolarAction(minRadius, lValue);
  const brAction = buildMockPolarAction(minRadius, rValue);

  const blendTree = new PolarBlendTreeProxy([
    tlAction,
    trAction,
    blAction,
    brAction,
  ]);

  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(azimuth, radius);

  const clampedRadius = Math.min(Math.max(radius, minRadius), maxRadius);

  const [rWeight, lWeight] = lerpAngular(azimuth, rValue, lValue);
  const [bWeight, tWeight] = lerpLinear(clampedRadius, minRadius, maxRadius);

  const tlWeight = tWeight * lWeight;
  const trWeight = tWeight * rWeight;
  const blWeight = bWeight * lWeight;
  const brWeight = bWeight * rWeight;

  assertEqualWithTolerance(tlAction.action.weight, tlWeight, tlMessage);
  assertEqualWithTolerance(trAction.action.weight, trWeight, trMessage);
  assertEqualWithTolerance(blAction.action.weight, blWeight, blMessage);
  assertEqualWithTolerance(brAction.action.weight, brWeight, brMessage);
  assertEqualWithTolerance(
    tlAction.action.weight +
      trAction.action.weight +
      blAction.action.weight +
      brAction.action.weight,
    1,
    "Sum of weights should equal 1",
  );
}

test("setBlend: two rings: beyond: should blend at center point between two actions", () => {
  testTwoRingsBlending(
    0,
    1.1,
    "top-left action should have correct weight for center blend",
    "top-right action should have correct weight for center blend",
    "bottom-left action should have correct weight for center blend",
    "bottom-right action should have correct weight for center blend",
  );
});

test("setBlend: two rings: beyond: should blend slightly towards second action", () => {
  testTwoRingsBlending(
    0.1,
    1.1,
    "top-left action should have reduced weight when blend moves towards right",
    "top-right action should have increased weight when blend moves towards right",
    "bottom-left action should have reduced weight when blend moves towards right",
    "bottom-right action should have increased weight when blend moves towards right",
  );
});

test("setBlend: two rings: beyond: should blend exactly at second action position", () => {
  testTwoRingsBlending(
    Math.PI / 4,
    1.1,
    "top-left action should have minimal weight when blend is at right position",
    "top-right action should have maximum weight when blend is at its position",
    "bottom-left action should have minimal weight when blend is at right position",
    "bottom-right action should have maximum weight when blend is at its position",
  );
});

test("setBlend: two rings: beyond: should blend past second action position", () => {
  testTwoRingsBlending(
    Math.PI / 4 + 0.1,
    1.1,
    "top-left action should have correct weight when blend exceeds right position",
    "top-right action should have correct weight when blend exceeds its position",
    "bottom-left action should have correct weight when blend exceeds right position",
    "bottom-right action should have correct weight when blend exceeds its position",
  );
});

test("setBlend: two rings: beyond: should handle opposite direction blend", () => {
  testTwoRingsBlending(
    Math.PI,
    1.1,
    "top-left action should have correct weight for opposite direction blend",
    "top-right action should have correct weight for opposite direction blend",
    "bottom-left action should have correct weight for opposite direction blend",
    "bottom-right action should have correct weight for opposite direction blend",
  );
});

test("setBlend: two rings: beyond: should blend exactly at first action position", () => {
  testTwoRingsBlending(
    -Math.PI / 4,
    1.1,
    "top-left action should have maximum weight when blend is at its position",
    "top-right action should have minimal weight when blend is at left position",
    "bottom-left action should have maximum weight when blend is at its position",
    "bottom-right action should have minimal weight when blend is at left position",
  );
});

test("setBlend: two rings: beyond: should blend slightly past first action position", () => {
  testTwoRingsBlending(
    -Math.PI / 4 + 0.1,
    1.1,
    "top-left action should have correct weight when blend slightly exceeds its position",
    "top-right action should have correct weight when blend slightly exceeds left position",
    "bottom-left action should have correct weight when blend slightly exceeds its position",
    "bottom-right action should have correct weight when blend slightly exceeds left position",
  );
});

test("setBlend: two rings: exact outer: should blend at center point between two actions", () => {
  testTwoRingsBlending(
    0,
    1,
    "top-left action should have correct weight for center blend",
    "top-right action should have correct weight for center blend",
    "bottom-left action should have correct weight for center blend",
    "bottom-right action should have correct weight for center blend",
  );
});

test("setBlend: two rings: exact outer: should blend slightly towards second action", () => {
  testTwoRingsBlending(
    0.1,
    1,
    "top-left action should have reduced weight when blend moves towards right",
    "top-right action should have increased weight when blend moves towards right",
    "bottom-left action should have reduced weight when blend moves towards right",
    "bottom-right action should have increased weight when blend moves towards right",
  );
});

test("setBlend: two rings: exact outer: should blend exactly at second action position", () => {
  testTwoRingsBlending(
    Math.PI / 4,
    1,
    "top-left action should have minimal weight when blend is at right position",
    "top-right action should have maximum weight when blend is at its position",
    "bottom-left action should have minimal weight when blend is at right position",
    "bottom-right action should have maximum weight when blend is at its position",
  );
});

test("setBlend: two rings: exact outer: should blend past second action position", () => {
  testTwoRingsBlending(
    Math.PI / 4 + 0.1,
    1,
    "top-left action should have correct weight when blend exceeds right position",
    "top-right action should have correct weight when blend exceeds its position",
    "bottom-left action should have correct weight when blend exceeds right position",
    "bottom-right action should have correct weight when blend exceeds its position",
  );
});

test("setBlend: two rings: exact outer: should handle opposite direction blend", () => {
  testTwoRingsBlending(
    Math.PI,
    1,
    "top-left action should have correct weight for opposite direction blend",
    "top-right action should have correct weight for opposite direction blend",
    "bottom-left action should have correct weight for opposite direction blend",
    "bottom-right action should have correct weight for opposite direction blend",
  );
});

test("setBlend: two rings: exact outer: should blend exactly at first action position", () => {
  testTwoRingsBlending(
    -Math.PI / 4,
    1,
    "top-left action should have maximum weight when blend is at its position",
    "top-right action should have minimal weight when blend is at left position",
    "bottom-left action should have maximum weight when blend is at its position",
    "bottom-right action should have minimal weight when blend is at left position",
  );
});

test("setBlend: two rings: exact outer: should blend slightly past first action position", () => {
  testTwoRingsBlending(
    -Math.PI / 4 + 0.1,
    1,
    "top-left action should have correct weight when blend slightly exceeds its position",
    "top-right action should have correct weight when blend slightly exceeds left position",
    "bottom-left action should have correct weight when blend slightly exceeds its position",
    "bottom-right action should have correct weight when blend slightly exceeds left position",
  );
});

test("setBlend: two rings: between: should blend at center point between two actions", () => {
  testTwoRingsBlending(
    0,
    0.8,
    "top-left action should have correct weight for center blend",
    "top-right action should have correct weight for center blend",
    "bottom-left action should have correct weight for center blend",
    "bottom-right action should have correct weight for center blend",
  );
});

test("setBlend: two rings: between: should blend slightly towards second action", () => {
  testTwoRingsBlending(
    0.1,
    0.8,
    "top-left action should have reduced weight when blend moves towards right",
    "top-right action should have increased weight when blend moves towards right",
    "bottom-left action should have reduced weight when blend moves towards right",
    "bottom-right action should have increased weight when blend moves towards right",
  );
});

test("setBlend: two rings: between: should blend exactly at second action position", () => {
  testTwoRingsBlending(
    Math.PI / 4,
    0.8,
    "top-left action should have minimal weight when blend is at right position",
    "top-right action should have maximum weight when blend is at its position",
    "bottom-left action should have minimal weight when blend is at right position",
    "bottom-right action should have maximum weight when blend is at its position",
  );
});

test("setBlend: two rings: between: should blend past second action position", () => {
  testTwoRingsBlending(
    Math.PI / 4 + 0.1,
    0.8,
    "top-left action should have correct weight when blend exceeds right position",
    "top-right action should have correct weight when blend exceeds its position",
    "bottom-left action should have correct weight when blend exceeds right position",
    "bottom-right action should have correct weight when blend exceeds its position",
  );
});

test("setBlend: two rings: between: should handle opposite direction blend", () => {
  testTwoRingsBlending(
    Math.PI,
    0.8,
    "top-left action should have correct weight for opposite direction blend",
    "top-right action should have correct weight for opposite direction blend",
    "bottom-left action should have correct weight for opposite direction blend",
    "bottom-right action should have correct weight for opposite direction blend",
  );
});

test("setBlend: two rings: between: should blend exactly at first action position", () => {
  testTwoRingsBlending(
    -Math.PI / 4,
    0.8,
    "top-left action should have maximum weight when blend is at its position",
    "top-right action should have minimal weight when blend is at left position",
    "bottom-left action should have maximum weight when blend is at its position",
    "bottom-right action should have minimal weight when blend is at left position",
  );
});

test("setBlend: two rings: between: should blend slightly past first action position", () => {
  testTwoRingsBlending(
    -Math.PI / 4 + 0.1,
    0.8,
    "top-left action should have correct weight when blend slightly exceeds its position",
    "top-right action should have correct weight when blend slightly exceeds left position",
    "bottom-left action should have correct weight when blend slightly exceeds its position",
    "bottom-right action should have correct weight when blend slightly exceeds left position",
  );
});

test("setBlend: two rings: exact inner: should blend at center point between two actions", () => {
  testTwoRingsBlending(
    0,
    0.5,
    "top-left action should have correct weight for center blend",
    "top-right action should have correct weight for center blend",
    "bottom-left action should have correct weight for center blend",
    "bottom-right action should have correct weight for center blend",
  );
});

test("setBlend: two rings: exact inner: should blend slightly towards second action", () => {
  testTwoRingsBlending(
    0.1,
    0.5,
    "top-left action should have reduced weight when blend moves towards right",
    "top-right action should have increased weight when blend moves towards right",
    "bottom-left action should have reduced weight when blend moves towards right",
    "bottom-right action should have increased weight when blend moves towards right",
  );
});

test("setBlend: two rings: exact inner: should blend exactly at second action position", () => {
  testTwoRingsBlending(
    Math.PI / 4,
    0.5,
    "top-left action should have minimal weight when blend is at right position",
    "top-right action should have maximum weight when blend is at its position",
    "bottom-left action should have minimal weight when blend is at right position",
    "bottom-right action should have maximum weight when blend is at its position",
  );
});

test("setBlend: two rings: exact inner: should blend past second action position", () => {
  testTwoRingsBlending(
    Math.PI / 4 + 0.1,
    0.5,
    "top-left action should have correct weight when blend exceeds right position",
    "top-right action should have correct weight when blend exceeds its position",
    "bottom-left action should have correct weight when blend exceeds right position",
    "bottom-right action should have correct weight when blend exceeds its position",
  );
});

test("setBlend: two rings: exact inner: should handle opposite direction blend", () => {
  testTwoRingsBlending(
    Math.PI,
    0.5,
    "top-left action should have correct weight for opposite direction blend",
    "top-right action should have correct weight for opposite direction blend",
    "bottom-left action should have correct weight for opposite direction blend",
    "bottom-right action should have correct weight for opposite direction blend",
  );
});

test("setBlend: two rings: exact inner: should blend exactly at first action position", () => {
  testTwoRingsBlending(
    -Math.PI / 4,
    0.5,
    "top-left action should have maximum weight when blend is at its position",
    "top-right action should have minimal weight when blend is at left position",
    "bottom-left action should have maximum weight when blend is at its position",
    "bottom-right action should have minimal weight when blend is at left position",
  );
});

test("setBlend: two rings: exact inner: should blend slightly past first action position", () => {
  testTwoRingsBlending(
    -Math.PI / 4 + 0.1,
    0.5,
    "top-left action should have correct weight when blend slightly exceeds its position",
    "top-right action should have correct weight when blend slightly exceeds left position",
    "bottom-left action should have correct weight when blend slightly exceeds its position",
    "bottom-right action should have correct weight when blend slightly exceeds left position",
  );
});

test("setBlend: two rings: within: should blend at center point between two actions", () => {
  testTwoRingsBlending(
    0,
    0.25,
    "top-left action should have correct weight for center blend",
    "top-right action should have correct weight for center blend",
    "bottom-left action should have correct weight for center blend",
    "bottom-right action should have correct weight for center blend",
  );
});

test("setBlend: two rings: within: should blend slightly towards second action", () => {
  testTwoRingsBlending(
    0.1,
    0.25,
    "top-left action should have reduced weight when blend moves towards right",
    "top-right action should have increased weight when blend moves towards right",
    "bottom-left action should have reduced weight when blend moves towards right",
    "bottom-right action should have increased weight when blend moves towards right",
  );
});

test("setBlend: two rings: within: should blend exactly at second action position", () => {
  testTwoRingsBlending(
    Math.PI / 4,
    0.25,
    "top-left action should have minimal weight when blend is at right position",
    "top-right action should have maximum weight when blend is at its position",
    "bottom-left action should have minimal weight when blend is at right position",
    "bottom-right action should have maximum weight when blend is at its position",
  );
});

test("setBlend: two rings: within: should blend past second action position", () => {
  testTwoRingsBlending(
    Math.PI / 4 + 0.1,
    0.25,
    "top-left action should have correct weight when blend exceeds right position",
    "top-right action should have correct weight when blend exceeds its position",
    "bottom-left action should have correct weight when blend exceeds right position",
    "bottom-right action should have correct weight when blend exceeds its position",
  );
});

test("setBlend: two rings: within: should handle opposite direction blend", () => {
  testTwoRingsBlending(
    Math.PI,
    0.25,
    "top-left action should have correct weight for opposite direction blend",
    "top-right action should have correct weight for opposite direction blend",
    "bottom-left action should have correct weight for opposite direction blend",
    "bottom-right action should have correct weight for opposite direction blend",
  );
});

test("setBlend: two rings: within: should blend exactly at first action position", () => {
  testTwoRingsBlending(
    -Math.PI / 4,
    0.25,
    "top-left action should have maximum weight when blend is at its position",
    "top-right action should have minimal weight when blend is at left position",
    "bottom-left action should have maximum weight when blend is at its position",
    "bottom-right action should have minimal weight when blend is at left position",
  );
});

test("setBlend: two rings: within: should blend slightly past first action position", () => {
  testTwoRingsBlending(
    -Math.PI / 4 + 0.1,
    0.25,
    "top-left action should have correct weight when blend slightly exceeds its position",
    "top-right action should have correct weight when blend slightly exceeds left position",
    "bottom-left action should have correct weight when blend slightly exceeds its position",
    "bottom-right action should have correct weight when blend slightly exceeds left position",
  );
});

test.run();
