import { test } from "uvu";
import {
  assertEqualWithTolerance,
  lerpAngular,
} from "../miscellaneous/miscellaneous";
import { buildMockPolarAction } from "../mocks/buildMockAction";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

function testOneRingBlending(
  azimuth: number,
  radius: number,
  lMessage: string,
  rMessage: string,
): void {
  const lValue = -Math.PI / 4;
  const rValue = Math.PI / 4;

  const lAction = buildMockPolarAction(1, lValue);
  const rAction = buildMockPolarAction(1, rValue);

  const blendTree = new PolarBlendTreeProxy([lAction, rAction]);
  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(azimuth, radius);

  const [rWeight, lWeight] = lerpAngular(azimuth, rValue, lValue);

  assertEqualWithTolerance(lAction.action.weight, lWeight, lMessage);
  assertEqualWithTolerance(rAction.action.weight, rWeight, rMessage);
  assertEqualWithTolerance(
    lAction.action.weight + rAction.action.weight,
    1,
    "Sum of weights should equal 1",
  );
}

test("setBlend: only one ring: beyond: should blend at center point between two actions", () => {
  testOneRingBlending(
    0,
    1.1,
    "action1 should have correct weight for center blend",
    "action2 should have correct weight for center blend",
  );
});

test("setBlend: only one ring: beyond: should blend slightly towards second action", () => {
  testOneRingBlending(
    0.1,
    1.1,
    "action1 should have reduced weight when blend moves towards action2",
    "action2 should have increased weight when blend moves towards action2",
  );
});

test("setBlend: only one ring: beyond: should blend exactly at second action position", () => {
  testOneRingBlending(
    Math.PI / 4,
    1.1,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
  );
});

test("setBlend: only one ring: beyond: should blend past second action position", () => {
  testOneRingBlending(
    Math.PI / 4 + 0.1,
    1.1,
    "action1 should have correct weight when blend exceeds action2 position",
    "action2 should have correct weight when blend exceeds its position",
  );
});

test("setBlend: only one ring: beyond: should handle opposite direction blend", () => {
  testOneRingBlending(
    Math.PI,
    1.1,
    "action1 should have correct weight for opposite direction blend",
    "action2 should have correct weight for opposite direction blend",
  );
});

test("setBlend: only one ring: beyond: should blend exactly at first action position", () => {
  testOneRingBlending(
    -Math.PI / 4,
    1.1,
    "action1 should have maximum weight when blend is at its position",
    "action2 should have minimal weight when blend is at action1 position",
  );
});

test("setBlend: only one ring: beyond: should blend slightly past first action position", () => {
  testOneRingBlending(
    -Math.PI / 4 + 0.1,
    1.1,
    "action1 should have correct weight when blend slightly exceeds its position",
    "action2 should have correct weight when blend slightly exceeds action1 position",
  );
});

test("setBlend: only one ring: exact: should blend at center point between two actions", () => {
  testOneRingBlending(
    0,
    1,
    "action1 should have correct weight for center blend",
    "action2 should have correct weight for center blend",
  );
});

test("setBlend: only one ring: exact: should blend slightly towards second action", () => {
  testOneRingBlending(
    0.1,
    1,
    "action1 should have reduced weight when blend moves towards action2",
    "action2 should have increased weight when blend moves towards action2",
  );
});

test("setBlend: only one ring: exact: should blend exactly at second action position", () => {
  testOneRingBlending(
    Math.PI / 4,
    1,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
  );
});

test("setBlend: only one ring: exact: should blend past second action position", () => {
  testOneRingBlending(
    Math.PI / 4 + 0.1,
    1,
    "action1 should have correct weight when blend exceeds action2 position",
    "action2 should have correct weight when blend exceeds its position",
  );
});

test("setBlend: only one ring: exact: should handle opposite direction blend", () => {
  testOneRingBlending(
    Math.PI,
    1,
    "action1 should have correct weight for opposite direction blend",
    "action2 should have correct weight for opposite direction blend",
  );
});

test("setBlend: only one ring: exact: should blend exactly at first action position", () => {
  testOneRingBlending(
    -Math.PI / 4,
    1,
    "action1 should have maximum weight when blend is at its position",
    "action2 should have minimal weight when blend is at action1 position",
  );
});

test("setBlend: only one ring: exact: should blend slightly past first action position", () => {
  testOneRingBlending(
    -Math.PI / 4 + 0.1,
    1,
    "action1 should have correct weight when blend slightly exceeds its position",
    "action2 should have correct weight when blend slightly exceeds action1 position",
  );
});

test("setBlend: only one ring: within: should blend at center point between two actions", () => {
  testOneRingBlending(
    0,
    0.9,
    "action1 should have correct weight for center blend",
    "action2 should have correct weight for center blend",
  );
});

test("setBlend: only one ring: within: should blend slightly towards second action", () => {
  testOneRingBlending(
    0.1,
    0.9,
    "action1 should have reduced weight when blend moves towards action2",
    "action2 should have increased weight when blend moves towards action2",
  );
});

test("setBlend: only one ring: within: should blend exactly at second action position", () => {
  testOneRingBlending(
    Math.PI / 4,
    0.9,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
  );
});

test("setBlend: only one ring: within: should blend past second action position", () => {
  testOneRingBlending(
    Math.PI / 4 + 0.1,
    0.9,
    "action1 should have correct weight when blend exceeds action2 position",
    "action2 should have correct weight when blend exceeds its position",
  );
});

test("setBlend: only one ring: within: should handle opposite direction blend", () => {
  testOneRingBlending(
    Math.PI,
    0.9,
    "action1 should have correct weight for opposite direction blend",
    "action2 should have correct weight for opposite direction blend",
  );
});

test("setBlend: only one ring: within: should blend exactly at first action position", () => {
  testOneRingBlending(
    -Math.PI / 4,
    0.9,
    "action1 should have maximum weight when blend is at its position",
    "action2 should have minimal weight when blend is at action1 position",
  );
});

test("setBlend: only one ring: within: should blend slightly past first action position", () => {
  testOneRingBlending(
    -Math.PI / 4 + 0.1,
    0.9,
    "action1 should have correct weight when blend slightly exceeds its position",
    "action2 should have correct weight when blend slightly exceeds action1 position",
  );
});

test.run();
