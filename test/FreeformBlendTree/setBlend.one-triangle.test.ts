import { test } from "uvu";
import {
  assertEqualWithTolerance,
  lerpBarycentric,
} from "../miscellaneous/miscellaneous";
import { buildMockFreeformAction } from "../mocks/buildMockAction";
import { FreeformBlendTreeProxy } from "../proxies/FreeformBlendTreeProxy";

function testOneTriangleBlending(x: number, y: number): void {
  /*
    Triangle vertices:
      A(0,0)
      B(0,1)
      C(1,0)

      B (0,1)
      *
      | \
      |   \
      *-----*
    A(0,0)  C(1,0)
  */

  const a = { x: 0, y: 0 };
  const b = { x: 0, y: 1 };
  const c = { x: 1, y: 0 };

  const aAction = buildMockFreeformAction(a.x, a.y);
  const bAction = buildMockFreeformAction(b.x, b.y);
  const cAction = buildMockFreeformAction(c.x, c.y);
  const tree = new FreeformBlendTreeProxy([aAction, bAction, cAction]);

  tree.invokeSetInfluence(1);
  tree.setBlend(x, y);

  const [aWeight, bWeight, cWeight] = lerpBarycentric({ x, y }, a, b, c);

  assertEqualWithTolerance(aAction.action.weight, aWeight, "aAction weight");
  assertEqualWithTolerance(bAction.action.weight, bWeight, "bAction weight");
  assertEqualWithTolerance(cAction.action.weight, cWeight, "cAction weight");
  assertEqualWithTolerance(
    aAction.action.weight + bAction.action.weight + cAction.action.weight,
    1,
    "sum of weights",
  );
}

test("setBlend: one triangle: beyond, next to A", () => {
  testOneTriangleBlending(-0.1, -0.1);
});

test("setBlend: one triangle: beyond, next to B", () => {
  testOneTriangleBlending(-0.1, 1.1);
});

test("setBlend: one triangle: beyond, next to C", () => {
  testOneTriangleBlending(1.1, -0.1);
});

test("setBlend: one triangle: exact A", () => {
  testOneTriangleBlending(0, 0);
});

test("setBlend: one triangle: exact B", () => {
  testOneTriangleBlending(0, 1);
});

test("setBlend: one triangle: exact C", () => {
  testOneTriangleBlending(1, 0);
});

test("setBlend: one triangle: within, next to A", () => {
  testOneTriangleBlending(0.1, 0.1);
});

test("setBlend: one triangle: within, next to B", () => {
  testOneTriangleBlending(0.1, 0.8);
});

test("setBlend: one triangle: within, next to C", () => {
  testOneTriangleBlending(0.8, 0.1);
});

test("setBlend: one triangle: edge between A and B", () => {
  testOneTriangleBlending(0, 0.4);
});

test("setBlend: one triangle: edge between A and C", () => {
  testOneTriangleBlending(0.4, 0);
});

test("setBlend: one triangle: edge between B and C", () => {
  testOneTriangleBlending(0.4, 0.6);
});

test("setBlend: one triangle: beyond edge between A and B", () => {
  testOneTriangleBlending(-0.1, 0.4);
});

test("setBlend: one triangle: beyond edge between A and C", () => {
  testOneTriangleBlending(0.4, -0.1);
});

test("setBlend: one triangle: beyond edge between B and C", () => {
  testOneTriangleBlending(0.8, 0.3);
});

test.run();
