import { test } from "uvu";
import * as assert from "uvu/assert";
import { precomputeTriangle } from "../../src/mescellaneous/math";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";

test("precomputeTriangle: should validate a.x parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: NaN, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: Infinity, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: -Infinity, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should validate a.y parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: 0, y: NaN }, { x: 0, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: 0, y: Infinity }, { x: 0, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: -Infinity },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should validate b.x parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: NaN, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: 0, y: 0 }, { x: Infinity, y: 1 }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: -Infinity, y: 1 },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should validate b.y parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: NaN }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: Infinity }, { x: 1, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: -Infinity },
        { x: 1, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        { x: 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should validate c.x parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: NaN, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: Infinity, y: 1 }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -Infinity, y: 1 },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should validate c.y parameter", () => {
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: NaN }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: Infinity }),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: -Infinity },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: Number.MAX_SAFE_INTEGER + 1 },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      precomputeTriangle(
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: -Number.MAX_SAFE_INTEGER - 1 },
      ),
    /maximum safe integer/,
  );
});

test("precomputeTriangle: should throw for degenerate triangle", () => {
  // Test collinear points (all points on the same line)
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }),
    /Degenerate triangle detected/,
  );

  // Test duplicate points
  assert.throws(
    () => precomputeTriangle({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }),
    /Degenerate triangle detected/,
  );

  // Test another collinear case (vertical line)
  assert.throws(
    () => precomputeTriangle({ x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }),
    /Degenerate triangle detected/,
  );
});

test("precomputeTriangle: should correctly compute circumcenter", () => {
  // Right triangle at origin: (0,0), (1,0), (0,1)
  // Circumcenter should be at the midpoint of hypotenuse: (0.5, 0.5)
  const result1 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  );
  assertEqualWithTolerance(result1.circumcenter.x, 0.5, "circumcenter.x");
  assertEqualWithTolerance(result1.circumcenter.y, 0.5, "circumcenter.y");

  // Simple triangle: (0,0), (2,0), (1,1)
  // This forms an isosceles triangle, circumcenter should be on y-axis at x=1
  const result2 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
  );
  assertEqualWithTolerance(result2.circumcenter.x, 1, "circumcenter.x");
  // y-coordinate should be 0 for this specific triangle
  assertEqualWithTolerance(result2.circumcenter.y, 0, "circumcenter.y");
});

test("precomputeTriangle: should correctly compute circumradiusSquared", () => {
  // Right triangle: (0,0), (1,0), (0,1)
  // Distance from circumcenter (0.5, 0.5) to any vertex should be sqrt(0.5)
  // So circumradiusSquared should be 0.5
  const result1 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  );
  assertEqualWithTolerance(
    result1.circumradiusSquared,
    0.5,
    "circumradiusSquared",
  );

  // Unit square triangle: (0,0), (1,0), (0,1) - same as above
  // Verify by checking distance from circumcenter to each vertex
  const cx = result1.circumcenter.x;
  const cy = result1.circumcenter.y;
  const distSq1 = (0 - cx) ** 2 + (0 - cy) ** 2;
  const distSq2 = (1 - cx) ** 2 + (0 - cy) ** 2;
  const distSq3 = (0 - cx) ** 2 + (1 - cy) ** 2;

  // All distances should be equal and match circumradiusSquared
  assertEqualWithTolerance(
    distSq1,
    result1.circumradiusSquared,
    "distance to vertex a",
  );
  assertEqualWithTolerance(
    distSq2,
    result1.circumradiusSquared,
    "distance to vertex b",
  );
  assertEqualWithTolerance(
    distSq3,
    result1.circumradiusSquared,
    "distance to vertex c",
  );
});

test("precomputeTriangle: should correctly compute u vector", () => {
  // Triangle: (0,0), (3,0), (1,2)
  // u = b - a = (3,0) - (0,0) = (3,0)
  const result1 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 1, y: 2 },
  );
  assertEqualWithTolerance(result1.u.x, 3, "u.x");
  assertEqualWithTolerance(result1.u.y, 0, "u.y");

  // Triangle: (1,1), (4,3), (2,5)
  // u = b - a = (4,3) - (1,1) = (3,2)
  const result2 = precomputeTriangle(
    { x: 1, y: 1 },
    { x: 4, y: 3 },
    { x: 2, y: 5 },
  );
  assertEqualWithTolerance(result2.u.x, 3, "u.x");
  assertEqualWithTolerance(result2.u.y, 2, "u.y");
});

test("precomputeTriangle: should correctly compute v vector", () => {
  // Triangle: (0,0), (3,0), (1,2)
  // v = c - a = (1,2) - (0,0) = (1,2)
  const result1 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 1, y: 2 },
  );
  assertEqualWithTolerance(result1.v.x, 1, "v.x");
  assertEqualWithTolerance(result1.v.y, 2, "v.y");

  // Triangle: (1,1), (4,3), (2,5)
  // v = c - a = (2,5) - (1,1) = (1,4)
  const result2 = precomputeTriangle(
    { x: 1, y: 1 },
    { x: 4, y: 3 },
    { x: 2, y: 5 },
  );
  assertEqualWithTolerance(result2.v.x, 1, "v.x");
  assertEqualWithTolerance(result2.v.y, 4, "v.y");
});

test("precomputeTriangle: should correctly compute d00", () => {
  // Triangle: (0,0), (3,0), (1,2)
  // u = (3,0), so d00 = u.x * u.x + u.y * u.y = 3*3 + 0*0 = 9
  const result1 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 1, y: 2 },
  );
  assertEqualWithTolerance(result1.d00, 9, "d00");

  // Triangle: (1,1), (4,3), (2,5)
  // u = (3,2), so d00 = u.x * u.x + u.y * u.y = 3*3 + 2*2 = 9 + 4 = 13
  const result2 = precomputeTriangle(
    { x: 1, y: 1 },
    { x: 4, y: 3 },
    { x: 2, y: 5 },
  );
  assertEqualWithTolerance(result2.d00, 13, "d00");
});

test("precomputeTriangle: should correctly compute d01", () => {
  // Triangle: (0,0), (3,0), (1,2)
  // u = (3,0), v = (1,2), so d01 = u.x * v.x + u.y * v.y = 3*1 + 0*2 = 3
  const result1 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 1, y: 2 },
  );
  assertEqualWithTolerance(result1.d01, 3, "d01");

  // Triangle: (1,1), (4,3), (2,5)
  // u = (3,2), v = (1,4), so d01 = u.x * v.x + u.y * v.y = 3*1 + 2*4 = 3 + 8 = 11
  const result2 = precomputeTriangle(
    { x: 1, y: 1 },
    { x: 4, y: 3 },
    { x: 2, y: 5 },
  );
  assertEqualWithTolerance(result2.d01, 11, "d01");
});

test("precomputeTriangle: should correctly compute d11", () => {
  // Triangle: (0,0), (3,0), (1,2)
  // v = (1,2), so d11 = v.x * v.x + v.y * v.y = 1*1 + 2*2 = 1 + 4 = 5
  const result1 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 1, y: 2 },
  );
  assertEqualWithTolerance(result1.d11, 5, "d11");

  // Triangle: (1,1), (4,3), (2,5)
  // v = (1,4), so d11 = v.x * v.x + v.y * v.y = 1*1 + 4*4 = 1 + 16 = 17
  const result2 = precomputeTriangle(
    { x: 1, y: 1 },
    { x: 4, y: 3 },
    { x: 2, y: 5 },
  );
  assertEqualWithTolerance(result2.d11, 17, "d11");
});

test("precomputeTriangle: should correctly compute invDenom", () => {
  // Triangle: (0,0), (3,0), (1,2)
  // d00 = 9, d01 = 3, d11 = 5
  // det = d00 * d11 - d01 * d01 = 9 * 5 - 3 * 3 = 45 - 9 = 36
  // invDenom = 1 / det = 1 / 36
  const result1 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 1, y: 2 },
  );
  assertEqualWithTolerance(result1.invDenom, 1 / 36, "invDenom");

  // Triangle: (1,1), (4,3), (2,5)
  // d00 = 13, d01 = 11, d11 = 17
  // det = d00 * d11 - d01 * d01 = 13 * 17 - 11 * 11 = 221 - 121 = 100
  // invDenom = 1 / det = 1 / 100 = 0.01
  const result2 = precomputeTriangle(
    { x: 1, y: 1 },
    { x: 4, y: 3 },
    { x: 2, y: 5 },
  );
  assertEqualWithTolerance(result2.invDenom, 0.01, "invDenom");
});

test("precomputeTriangle: should correctly compute min", () => {
  // Triangle: (0,0), (3,0), (1,2)
  // min.x = Math.min(0, 3, 1) = 0
  // min.y = Math.min(0, 0, 2) = 0
  const result1 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 1, y: 2 },
  );
  assertEqualWithTolerance(result1.min.x, 0, "min.x");
  assertEqualWithTolerance(result1.min.y, 0, "min.y");

  // Triangle: (1,1), (4,3), (2,5)
  // min.x = Math.min(1, 4, 2) = 1
  // min.y = Math.min(1, 3, 5) = 1
  const result2 = precomputeTriangle(
    { x: 1, y: 1 },
    { x: 4, y: 3 },
    { x: 2, y: 5 },
  );
  assertEqualWithTolerance(result2.min.x, 1, "min.x");
  assertEqualWithTolerance(result2.min.y, 1, "min.y");
});

test("precomputeTriangle: should correctly compute max", () => {
  // Triangle: (0,0), (3,0), (1,2)
  // max.x = Math.max(0, 3, 1) = 3
  // max.y = Math.max(0, 0, 2) = 2
  const result1 = precomputeTriangle(
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 1, y: 2 },
  );
  assertEqualWithTolerance(result1.max.x, 3, "max.x");
  assertEqualWithTolerance(result1.max.y, 2, "max.y");

  // Triangle: (1,1), (4,3), (2,5)
  // max.x = Math.max(1, 4, 2) = 4
  // max.y = Math.max(1, 3, 5) = 5
  const result2 = precomputeTriangle(
    { x: 1, y: 1 },
    { x: 4, y: 3 },
    { x: 2, y: 5 },
  );
  assertEqualWithTolerance(result2.max.x, 4, "max.x");
  assertEqualWithTolerance(result2.max.y, 5, "max.y");
});

test.run();
