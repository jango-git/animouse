import { test } from "uvu";
import {
  assertEqualWithTolerance,
  lerpAngular,
} from "./miscellaneous/miscellaneous";
import { buildMockPolarAction } from "./mocks/buildMockAction";
import { buildMockAnimationAction } from "./mocks/buildMockAnimationAction";
import { PolarBlendTreeProxy } from "./proxies/PolarBlendTreeProxy";

function testOneRingAndCenterBlending(
  azimuth: number,
  radius: number,
  lMessage: string,
  rMessage: string,
  cMessage: string,
): void {
  const lValue = -Math.PI / 4;
  const rValue = Math.PI / 4;

  const lAction = buildMockPolarAction(1, lValue);
  const rAction = buildMockPolarAction(1, rValue);
  const cAction = buildMockAnimationAction(1);

  const blendTree = new PolarBlendTreeProxy([lAction, rAction], cAction);

  blendTree.invokeSetInfluence(1);
  blendTree.setBlend(azimuth, radius);

  const [rRingWeight, lRingWeight] = lerpAngular(azimuth, rValue, lValue);

  const clampedRadius = Math.min(1, radius);
  const cWeight = 1 - clampedRadius;
  const lWeight = lRingWeight * clampedRadius;
  const rWeight = rRingWeight * clampedRadius;

  assertEqualWithTolerance(lAction.action.weight, lWeight, lMessage);
  assertEqualWithTolerance(rAction.action.weight, rWeight, rMessage);
  assertEqualWithTolerance(cAction.weight, cWeight, cMessage);
  assertEqualWithTolerance(
    lAction.action.weight + rAction.action.weight + cAction.weight,
    1,
    "Sum of weights should equal 1",
  );
}

test("setBlend: ring and center: beyond: should blend at center point between two actions", () => {
  testOneRingAndCenterBlending(
    0,
    1.1,
    "action1 should have correct weight for center blend",
    "action2 should have correct weight for center blend",
    "center action should have weight 0 when radius exceeds 1",
  );
});

test("setBlend: ring and center: beyond: should blend slightly towards second action", () => {
  testOneRingAndCenterBlending(
    0.1,
    1.1,
    "action1 should have reduced weight when blend moves towards action2",
    "action2 should have increased weight when blend moves towards action2",
    "center action should have weight 0 when radius exceeds 1",
  );
});

test("setBlend: ring and center: beyond: should blend exactly at second action position", () => {
  testOneRingAndCenterBlending(
    Math.PI / 4,
    1.1,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
    "center action should have weight 0 when radius exceeds 1",
  );
});

test("setBlend: ring and center: beyond: should blend past second action position", () => {
  testOneRingAndCenterBlending(
    Math.PI / 4 + 0.1,
    1.1,
    "action1 should have correct weight when blend exceeds action2 position",
    "action2 should have correct weight when blend exceeds its position",
    "center action should have weight 0 when radius exceeds 1",
  );
});

test("setBlend: ring and center: beyond: should handle opposite direction blend", () => {
  testOneRingAndCenterBlending(
    Math.PI,
    1.1,
    "action1 should have correct weight for opposite direction blend",
    "action2 should have correct weight for opposite direction blend",
    "center action should have weight 0 when radius exceeds 1",
  );
});

test("setBlend: ring and center: beyond: should blend exactly at first action position", () => {
  testOneRingAndCenterBlending(
    -Math.PI / 4,
    1.1,
    "action1 should have maximum weight when blend is at its position",
    "action2 should have minimal weight when blend is at action1 position",
    "center action should have weight 0 when radius exceeds 1",
  );
});

test("setBlend: ring and center: beyond: should blend exactly at second action position", () => {
  testOneRingAndCenterBlending(
    Math.PI / 4,
    1.1,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
    "center action should have weight 0 when radius exceeds 1",
  );
});

test("setBlend: ring and center: beyond: should blend slightly past first action position", () => {
  testOneRingAndCenterBlending(
    -Math.PI / 4 + 0.1,
    1.1,
    "action1 should have correct weight when blend slightly exceeds its position",
    "action2 should have correct weight when blend slightly exceeds action1 position",
    "center action should have weight 0 when radius exceeds 1",
  );
});

test("setBlend: ring and center: exact: should blend at center point between two actions", () => {
  testOneRingAndCenterBlending(
    0,
    1,
    "action1 should have correct weight for center blend",
    "action2 should have correct weight for center blend",
    "center action should have weight 0 when radius is 1",
  );
});

test("setBlend: ring and center: exact: should blend slightly towards second action", () => {
  testOneRingAndCenterBlending(
    0.1,
    1,
    "action1 should have reduced weight when blend moves towards action2",
    "action2 should have increased weight when blend moves towards action2",
    "center action should have weight 0 when radius is 1",
  );
});

test("setBlend: ring and center: exact: should blend exactly at second action position", () => {
  testOneRingAndCenterBlending(
    Math.PI / 4,
    1,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
    "center action should have weight 0 when radius is 1",
  );
});

test("setBlend: ring and center: exact: should blend past second action position", () => {
  testOneRingAndCenterBlending(
    Math.PI / 4 + 0.1,
    1,
    "action1 should have correct weight when blend exceeds action2 position",
    "action2 should have correct weight when blend exceeds its position",
    "center action should have weight 0 when radius is 1",
  );
});

test("setBlend: ring and center: exact: should handle opposite direction blend", () => {
  testOneRingAndCenterBlending(
    Math.PI,
    1,
    "action1 should have correct weight for opposite direction blend",
    "action2 should have correct weight for opposite direction blend",
    "center action should have weight 0 when radius is 1",
  );
});

test("setBlend: ring and center: exact: should blend exactly at first action position", () => {
  testOneRingAndCenterBlending(
    -Math.PI / 4,
    1,
    "action1 should have maximum weight when blend is at its position",
    "action2 should have minimal weight when blend is at action1 position",
    "center action should have weight 0 when radius is 1",
  );
});

test("setBlend: ring and center: exact: should blend slightly past first action position", () => {
  testOneRingAndCenterBlending(
    -Math.PI / 4 + 0.1,
    1,
    "action1 should have correct weight when blend slightly exceeds its position",
    "action2 should have correct weight when blend slightly exceeds action1 position",
    "center action should have weight 0 when radius is 1",
  );
});

test("setBlend: ring and center: within: should blend at center point between two actions", () => {
  testOneRingAndCenterBlending(
    0,
    0.75,
    "action1 should have correct weight for center blend",
    "action2 should have correct weight for center blend",
    "center action should have weight 0.25 when radius is 0.75",
  );
});

test("setBlend: ring and center: within: should blend slightly towards second action", () => {
  testOneRingAndCenterBlending(
    0.1,
    0.75,
    "action1 should have reduced weight when blend moves towards action2",
    "action2 should have increased weight when blend moves towards action2",
    "center action should have weight 0.25 when radius is 0.75",
  );
});

test("setBlend: ring and center: within: should blend exactly at second action position", () => {
  testOneRingAndCenterBlending(
    Math.PI / 4,
    0.75,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
    "center action should have weight 0.25 when radius is 0.75",
  );
});

test("setBlend: ring and center: within: should blend past second action position", () => {
  testOneRingAndCenterBlending(
    Math.PI / 4 + 0.1,
    0.75,
    "action1 should have correct weight when blend exceeds action2 position",
    "action2 should have correct weight when blend exceeds its position",
    "center action should have weight 0.25 when radius is 0.75",
  );
});

test("setBlend: ring and center: within: should handle opposite direction blend", () => {
  testOneRingAndCenterBlending(
    Math.PI,
    0.75,
    "action1 should have correct weight for opposite direction blend",
    "action2 should have correct weight for opposite direction blend",
    "center action should have weight 0.25 when radius is 0.75",
  );
});

test("setBlend: ring and center: within: should blend exactly at first action position", () => {
  testOneRingAndCenterBlending(
    -Math.PI / 4,
    0.75,
    "action1 should have maximum weight when blend is at its position",
    "action2 should have minimal weight when blend is at action1 position",
    "center action should have weight 0.25 when radius is 0.75",
  );
});

test("setBlend: ring and center: within: should blend slightly past first action position", () => {
  testOneRingAndCenterBlending(
    -Math.PI / 4 + 0.1,
    0.75,
    "action1 should have correct weight when blend slightly exceeds its position",
    "action2 should have correct weight when blend slightly exceeds action1 position",
    "center action should have weight 0.25 when radius is 0.75",
  );
});

test("setBlend: ring and center: center: should blend at center point between two actions", () => {
  testOneRingAndCenterBlending(
    0,
    0,
    "action1 should have correct weight for center blend",
    "action2 should have correct weight for center blend",
    "center action should have weight 1 when radius is 0",
  );
});

test("setBlend: ring and center: center: should blend slightly towards second action", () => {
  testOneRingAndCenterBlending(
    0.1,
    0,
    "action1 should have reduced weight when blend moves towards action2",
    "action2 should have increased weight when blend moves towards action2",
    "center action should have weight 1 when radius is 0",
  );
});

test("setBlend: ring and center: center: should blend exactly at second action position", () => {
  testOneRingAndCenterBlending(
    Math.PI / 4,
    0,
    "action1 should have minimal weight when blend is at action2 position",
    "action2 should have maximum weight when blend is at its position",
    "center action should have weight 1 when radius is 0",
  );
});

test("setBlend: ring and center: center: should blend past second action position", () => {
  testOneRingAndCenterBlending(
    Math.PI / 4 + 0.1,
    0,
    "action1 should have correct weight when blend exceeds action2 position",
    "action2 should have correct weight when blend exceeds its position",
    "center action should have weight 1 when radius is 0",
  );
});

test("setBlend: ring and center: center: should handle opposite direction blend", () => {
  testOneRingAndCenterBlending(
    Math.PI,
    0,
    "action1 should have correct weight for opposite direction blend",
    "action2 should have correct weight for opposite direction blend",
    "center action should have weight 1 when radius is 0",
  );
});

test("setBlend: ring and center: center: should blend exactly at first action position", () => {
  testOneRingAndCenterBlending(
    -Math.PI / 4,
    0,
    "action1 should have maximum weight when blend is at its position",
    "action2 should have minimal weight when blend is at action1 position",
    "center action should have weight 1 when radius is 0",
  );
});

test("setBlend: ring and center: center: should blend slightly past first action position", () => {
  testOneRingAndCenterBlending(
    -Math.PI / 4 + 0.1,
    0,
    "action1 should have correct weight when blend slightly exceeds its position",
    "action2 should have correct weight when blend slightly exceeds action1 position",
    "center action should have weight 1 when radius is 0",
  );
});

test.run();
