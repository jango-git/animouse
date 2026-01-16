import { test } from "uvu";
import { calculateTriangleCentroid, Vector2Like } from "../../src/mescellaneous/math";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";

export function triangleCentroid(
  a: Vector2Like,
  b: Vector2Like,
  c: Vector2Like,
): Vector2Like {
  return {
    x: (a.x + b.x + c.x) / 3,
    y: (a.y + b.y + c.y) / 3,
  };
}

function testTriangleCentroid(
  a: Vector2Like,
  b: Vector2Like,
  c: Vector2Like,
): void {
  const expected = triangleCentroid(a, b, c);
  const actual = calculateTriangleCentroid(a, b, c);

  assertEqualWithTolerance(actual.x, expected.x, "x coordinate");
  assertEqualWithTolerance(actual.y, expected.y, "y coordinate");
}

test("calculateTriangleCentroid: right triangle at origin", () => {
  testTriangleCentroid({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 });
});

test("calculateTriangleCentroid: equilateral triangle", () => {
  testTriangleCentroid(
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: Math.sqrt(3) },
  );
});

test("calculateTriangleCentroid: isosceles triangle", () => {
  testTriangleCentroid({ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 2 });
});

test("calculateTriangleCentroid: scalene triangle with negative coordinates", () => {
  testTriangleCentroid({ x: -2, y: -3 }, { x: 4, y: -1 }, { x: 1, y: 5 });
});

test("calculateTriangleCentroid: triangle with decimal coordinates", () => {
  testTriangleCentroid(
    { x: 1.5, y: 2.7 },
    { x: -0.8, y: 4.2 },
    { x: 3.1, y: -1.9 },
  );
});

test("calculateTriangleCentroid: large triangle", () => {
  testTriangleCentroid(
    { x: 100, y: 200 },
    { x: 300, y: 400 },
    { x: 500, y: 100 },
  );
});

test("calculateTriangleCentroid: triangle with zero coordinates", () => {
  testTriangleCentroid({ x: 0, y: 0 }, { x: 0, y: 5 }, { x: 3, y: 0 });
});

test("calculateTriangleCentroid: obtuse triangle", () => {
  testTriangleCentroid({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.1, y: 0.1 });
});

test.run();
