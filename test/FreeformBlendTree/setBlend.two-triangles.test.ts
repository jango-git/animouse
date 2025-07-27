import { test } from "uvu";
import {
  assertEqualWithTolerance,
  isPointInTriangle,
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
      D(2,1)

      B (0,1)    D (2,1)
      *----------*
      | \       /
      |   \   /
      *-----*
    A(0,0)  C(1,0)
  */

  const a = { x: 0, y: 0 };
  const b = { x: 0, y: 1 };
  const c = { x: 1, y: 0 };
  const d = { x: 2, y: 1 };

  const aAction = buildMockFreeformAction(a.x, a.y);
  const bAction = buildMockFreeformAction(b.x, b.y);
  const cAction = buildMockFreeformAction(c.x, c.y);
  const dAction = buildMockFreeformAction(d.x, d.y);
  const tree = new FreeformBlendTreeProxy([aAction, bAction, cAction, dAction]);

  tree.invokeSetInfluence(1);
  tree.setBlend(x, y);

  let aWeight: number;
  let bWeight: number;
  let cWeight: number;
  let dWeight: number;

  if (isPointInTriangle({ x, y }, a, b, c) || y < a.y || x < a.x) {
    const [oneWeight, twoWeight, threeWeight] = lerpBarycentric(
      { x, y },
      a,
      b,
      c,
    );
    aWeight = oneWeight;
    bWeight = twoWeight;
    cWeight = threeWeight;
    dWeight = 0;
  } else if (isPointInTriangle({ x, y }, b, c, d) || y > b.y || x > c.x) {
    const [oneWeight, twoWeight, threeWeight] = lerpBarycentric(
      { x, y },
      b,
      c,
      d,
    );
    aWeight = 0;
    bWeight = oneWeight;
    cWeight = twoWeight;
    dWeight = threeWeight;
  } else {
    throw new Error(`Point (${x}, ${y}) cannot be solved`);
  }

  assertEqualWithTolerance(aAction.action.weight, aWeight, "aAction weight");
  assertEqualWithTolerance(bAction.action.weight, bWeight, "bAction weight");
  assertEqualWithTolerance(cAction.action.weight, cWeight, "cAction weight");
  assertEqualWithTolerance(dAction.action.weight, dWeight, "dAction weight");
  assertEqualWithTolerance(
    aAction.action.weight +
      bAction.action.weight +
      cAction.action.weight +
      dAction.action.weight,
    1,
    "sum of weights",
  );
}

test("setBlend: two triangles: beyond, next to A", () => {
  testOneTriangleBlending(-0.1, -0.1);
});

test("setBlend: two triangles: beyond, next to B", () => {
  testOneTriangleBlending(-0.1, 1.1);
});

test("setBlend: two triangles: beyond, next to C", () => {
  testOneTriangleBlending(1.1, -0.1);
});

test("setBlend: two triangles: beyond, next to D", () => {
  testOneTriangleBlending(2.1, 1.1);
});

test("setBlend: two triangles: exact A", () => {
  testOneTriangleBlending(0, 0);
});

test("setBlend: two triangles: exact B", () => {
  testOneTriangleBlending(0, 1);
});

test("setBlend: two triangles: exact C", () => {
  testOneTriangleBlending(1, 0);
});

test("setBlend: two triangles: exact D", () => {
  testOneTriangleBlending(2, 1);
});

test("setBlend: two triangles: within, next to A", () => {
  testOneTriangleBlending(0.1, 0.1);
});

test("setBlend: two triangles: within, next to B", () => {
  testOneTriangleBlending(0.1, 0.8);
});

test("setBlend: two triangles: within, next to C", () => {
  testOneTriangleBlending(0.8, 0.1);
});

test("setBlend: two triangles: within, next to D", () => {
  testOneTriangleBlending(1.7, 0.9);
});

test("setBlend: two triangles: edge between A and B", () => {
  testOneTriangleBlending(0, 0.4);
});

test("setBlend: two triangles: edge between A and C", () => {
  testOneTriangleBlending(0.4, 0);
});

test("setBlend: two triangles: edge between B and C", () => {
  testOneTriangleBlending(0.4, 0.6);
});

test("setBlend: two triangles: edge between B and D", () => {
  testOneTriangleBlending(1, 1);
});

test("setBlend: two triangles: edge between C and D", () => {
  testOneTriangleBlending(1.7, 0.7);
});

test("setBlend: two triangles: beyond edge between A and B", () => {
  testOneTriangleBlending(-0.1, 0.4);
});

test("setBlend: two triangles: beyond edge between A and C", () => {
  testOneTriangleBlending(0.4, -0.1);
});

test("setBlend: two triangles: beyond edge between B and D", () => {
  testOneTriangleBlending(1, 1.1);
});

test("setBlend: two triangles: beyond edge between C and D", () => {
  testOneTriangleBlending(1.7, 0.6);
});

test.run();
