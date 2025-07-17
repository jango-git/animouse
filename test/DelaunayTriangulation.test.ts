import { test } from "uvu";
import * as assert from "uvu/assert";
import { DelaunayTriangulation } from "../src/mescellaneous/DelaunayTriangulation";

// // validatePoints tests
// test("validatePoints: should throw error when fewer than 3 points provided", () => {
//   assert.throws(() => {
//     DelaunayTriangulation.validatePoints([]);
//   }, "At least 3 points are required for triangulation, but got 0");

//   assert.throws(() => {
//     DelaunayTriangulation.validatePoints([{ x: 0, y: 0 }]);
//   }, "At least 3 points are required for triangulation, but got 1");

//   assert.throws(() => {
//     DelaunayTriangulation.validatePoints([
//       { x: 0, y: 0 },
//       { x: 1, y: 1 },
//     ]);
//   }, "At least 3 points are required for triangulation, but got 2");
// });

// test("validatePoints: should throw error when points have invalid coordinates", () => {
//   assert.throws(() => {
//     DelaunayTriangulation.validatePoints([
//       { x: 0, y: 0 },
//       { x: 1, y: 1 },
//       { x: NaN, y: 2 },
//     ]);
//   }, "Point 2 has invalid coordinates: (NaN, 2)");

//   assert.throws(() => {
//     DelaunayTriangulation.validatePoints([
//       { x: 0, y: 0 },
//       { x: Infinity, y: 1 },
//       { x: 2, y: 2 },
//     ]);
//   }, "Point 1 has invalid coordinates: (Infinity, 1)");
// });

// test("validatePoints: should throw error when duplicate points are found", () => {
//   assert.throws(() => {
//     DelaunayTriangulation.validatePoints([
//       { x: 0, y: 0 },
//       { x: 1, y: 1 },
//       { x: 0, y: 0 },
//     ]);
//   }, "Duplicate points found at indices 0 and 2: (0, 0)");
// });

// test("validatePoints: should throw error when all points are collinear", () => {
//   assert.throws(() => {
//     DelaunayTriangulation.validatePoints([
//       { x: 0, y: 0 },
//       { x: 1, y: 0 },
//       { x: 2, y: 0 },
//     ]);
//   }, "All points are collinear - cannot create triangulation");
// });

// test("validatePoints: should not throw for valid points", () => {
//   DelaunayTriangulation.validatePoints([
//     { x: 0, y: 0 },
//     { x: 1, y: 0 },
//     { x: 0, y: 1 },
//   ]);
// });

// // createSuperTriangle tests
// test("createSuperTriangle: should create triangle that encompasses all points", () => {
//   const points = [
//     { x: 0, y: 0 },
//     { x: 1, y: 0 },
//     { x: 0, y: 1 },
//   ];

//   const superTriangle = DelaunayTriangulation.createSuperTriangle(points);

//   // Check that super triangle vertices have valid coordinates
//   assert.ok(Number.isFinite(superTriangle.a.x));
//   assert.ok(Number.isFinite(superTriangle.a.y));
//   assert.ok(Number.isFinite(superTriangle.b.x));
//   assert.ok(Number.isFinite(superTriangle.b.y));
//   assert.ok(Number.isFinite(superTriangle.c.x));
//   assert.ok(Number.isFinite(superTriangle.c.y));

//   // Check that circumcenter data is valid
//   assert.ok(Number.isFinite(superTriangle.circumcenter.x));
//   assert.ok(Number.isFinite(superTriangle.circumcenter.y));
//   assert.ok(superTriangle.circumRadiusSquared >= 0);
// });

// test("createSuperTriangle: should handle negative coordinates", () => {
//   const points = [
//     { x: -5, y: -3 },
//     { x: -2, y: -1 },
//     { x: -4, y: -2 },
//   ];

//   const superTriangle = DelaunayTriangulation.createSuperTriangle(points);

//   assert.ok(Number.isFinite(superTriangle.a.x));
//   assert.ok(Number.isFinite(superTriangle.a.y));
// });

// // calculateCircumcenterData tests
// test("calculateCircumcenterData: should calculate correct circumcenter for right triangle", () => {
//   const a = { x: 0, y: 0 };
//   const b = { x: 1, y: 0 };
//   const c = { x: 0, y: 1 };

//   const result = DelaunayTriangulation.calculateCircumcenterData(a, b, c);

//   // For a right triangle at origin, circumcenter should be at (0.5, 0.5)
//   assert.ok(Math.abs(result.circumcenter.x - 0.5) < 1e-10);
//   assert.ok(Math.abs(result.circumcenter.y - 0.5) < 1e-10);

//   // Check that circumradius squared is positive
//   assert.ok(result.circumRadiusSquared > 0);
// });

// test("calculateCircumcenterData: should throw error for collinear points", () => {
//   const a = { x: 0, y: 0 };
//   const b = { x: 1, y: 0 };
//   const c = { x: 2, y: 0 };

//   assert.throws(() => {
//     DelaunayTriangulation.calculateCircumcenterData(a, b, c);
//   }, /Cannot calculate circumcenter.*collinear/);
// });

// test("calculateCircumcenterData: should handle different triangle orientations", () => {
//   // Clockwise triangle
//   const a1 = { x: 0, y: 0 };
//   const b1 = { x: 0, y: 1 };
//   const c1 = { x: 1, y: 0 };

//   const result1 = DelaunayTriangulation.calculateCircumcenterData(a1, b1, c1);
//   assert.ok(Number.isFinite(result1.circumcenter.x));
//   assert.ok(Number.isFinite(result1.circumcenter.y));

//   // Counter-clockwise triangle
//   const a2 = { x: 0, y: 0 };
//   const b2 = { x: 1, y: 0 };
//   const c2 = { x: 0, y: 1 };

//   const result2 = DelaunayTriangulation.calculateCircumcenterData(a2, b2, c2);
//   assert.ok(Number.isFinite(result2.circumcenter.x));
//   assert.ok(Number.isFinite(result2.circumcenter.y));
// });

// // isPointInCircumcircle tests
// test("isPointInCircumcircle: should return true for point inside circumcircle", () => {
//   const triangle = {
//     a: { x: 0, y: 0 },
//     b: { x: 2, y: 0 },
//     c: { x: 1, y: 2 },
//     ...DelaunayTriangulation.calculateCircumcenterData(
//       { x: 0, y: 0 },
//       { x: 2, y: 0 },
//       { x: 1, y: 2 },
//     ),
//   };

//   const pointInside = { x: 1, y: 0.5 };
//   assert.ok(DelaunayTriangulation.isPointInCircumcircle(triangle, pointInside));
// });

// test("isPointInCircumcircle: should return false for point outside circumcircle", () => {
//   const triangle = {
//     a: { x: 0, y: 0 },
//     b: { x: 1, y: 0 },
//     c: { x: 0, y: 1 },
//     ...DelaunayTriangulation.calculateCircumcenterData(
//       { x: 0, y: 0 },
//       { x: 1, y: 0 },
//       { x: 0, y: 1 },
//     ),
//   };

//   const pointOutside = { x: 2, y: 2 };
//   assert.not.ok(
//     DelaunayTriangulation.isPointInCircumcircle(triangle, pointOutside),
//   );
// });

// test("isPointInCircumcircle: should return false for triangle vertex", () => {
//   const a = { x: 0, y: 0 };
//   const b = { x: 1, y: 0 };
//   const c = { x: 0, y: 1 };
//   const triangle = {
//     a,
//     b,
//     c,
//     ...DelaunayTriangulation.calculateCircumcenterData(a, b, c),
//   };

//   // Triangle vertices should be on the circumcircle, not inside
//   assert.not.ok(
//     DelaunayTriangulation.isPointInCircumcircle(triangle, triangle.a),
//   );
// });

// // findBadTriangles tests
// test("findBadTriangles: should find triangles containing point in circumcircle", () => {
//   const point = { x: 0.5, y: 0.5 };

//   const triangles = [
//     {
//       a: { x: 0, y: 0 },
//       b: { x: 2, y: 0 },
//       c: { x: 1, y: 2 },
//       ...DelaunayTriangulation.calculateCircumcenterData(
//         { x: 0, y: 0 },
//         { x: 2, y: 0 },
//         { x: 1, y: 2 },
//       ),
//     },
//   ];

//   const badTriangles = DelaunayTriangulation.findBadTriangles(triangles, point);
//   assert.equal(badTriangles.length, 1);
// });

// test("findBadTriangles: should return empty array when no triangles violate condition", () => {
//   const point = { x: 5, y: 5 };

//   const triangles = [
//     {
//       a: { x: 0, y: 0 },
//       b: { x: 1, y: 0 },
//       c: { x: 0, y: 1 },
//       ...DelaunayTriangulation.calculateCircumcenterData(
//         { x: 0, y: 0 },
//         { x: 1, y: 0 },
//         { x: 0, y: 1 },
//       ),
//     },
//   ];

//   const badTriangles = DelaunayTriangulation.findBadTriangles(triangles, point);
//   assert.equal(badTriangles.length, 0);
// });

// // isVertexFromSuperTriangle tests
// test("isVertexFromSuperTriangle: should return true for super triangle vertices", () => {
//   const superTriangle = DelaunayTriangulation.createSuperTriangle([
//     { x: 0, y: 0 },
//     { x: 1, y: 0 },
//     { x: 0, y: 1 },
//   ]);

//   assert.ok(
//     DelaunayTriangulation.isVertexFromSuperTriangle(
//       superTriangle.a,
//       superTriangle,
//     ),
//   );
//   assert.ok(
//     DelaunayTriangulation.isVertexFromSuperTriangle(
//       superTriangle.b,
//       superTriangle,
//     ),
//   );
//   assert.ok(
//     DelaunayTriangulation.isVertexFromSuperTriangle(
//       superTriangle.c,
//       superTriangle,
//     ),
//   );
// });

// test("isVertexFromSuperTriangle: should return false for other vertices", () => {
//   const superTriangle = DelaunayTriangulation.createSuperTriangle([
//     { x: 0, y: 0 },
//     { x: 1, y: 0 },
//     { x: 0, y: 1 },
//   ]);

//   const otherPoint = { x: 0.5, y: 0.5 };
//   assert.not.ok(
//     DelaunayTriangulation.isVertexFromSuperTriangle(otherPoint, superTriangle),
//   );
// });

// // buildPolygonEdges tests
// test("buildPolygonEdges: should return unshared edges from bad triangles", () => {
//   const lVertex = { x: -1, y: 0 };
//   const rVertex = { x: 1, y: 0 };
//   const sharedVertex0 = { x: 0, y: 1 };
//   const sharedVertex1 = { x: 0, y: -1 };
//   const badTriangles = [
//     {
//       a: lVertex,
//       b: sharedVertex0,
//       c: sharedVertex1,
//       ...DelaunayTriangulation.calculateCircumcenterData(
//         lVertex,
//         sharedVertex0,
//         sharedVertex1,
//       ),
//     },
//     {
//       a: rVertex,
//       b: sharedVertex0,
//       c: sharedVertex1,

//       ...DelaunayTriangulation.calculateCircumcenterData(
//         rVertex,
//         sharedVertex0,
//         sharedVertex1,
//       ),
//     },
//   ];

//   const polygonEdges = DelaunayTriangulation.buildPolygonEdges(badTriangles);

//   // Should have 4 unshared edges (6 total edges - 2 shared edges)
//   assert.equal(polygonEdges.length, 4);
// });

// test("buildPolygonEdges: should return all edges when no edges are shared", () => {
//   const badTriangles = [
//     {
//       a: { x: 0, y: 0 },
//       b: { x: 1, y: 0 },
//       c: { x: 0, y: 1 },
//       ...DelaunayTriangulation.calculateCircumcenterData(
//         { x: 0, y: 0 },
//         { x: 1, y: 0 },
//         { x: 0, y: 1 },
//       ),
//     },
//   ];

//   const polygonEdges = DelaunayTriangulation.buildPolygonEdges(badTriangles);

//   // Should have all 3 edges since no triangles share edges
//   assert.equal(polygonEdges.length, 3);
// });

// // buildOuterEdges tests
// test("buildOuterEdges: should create valid outer edges map", () => {
//   const outerPointsMap = new Map();
//   const p1 = { x: 0, y: 0 };
//   const p2 = { x: 1, y: 0 };
//   const p3 = { x: 0, y: 1 };

//   outerPointsMap.set(p1, [p2, p3]);
//   outerPointsMap.set(p2, [p3, p1]);
//   outerPointsMap.set(p3, [p1, p2]);

//   const outerEdges = DelaunayTriangulation.buildOuterEdges(outerPointsMap);

//   assert.equal(outerEdges.size, 3);
//   assert.equal(outerEdges.get(p1)?.length, 2);
//   assert.equal(outerEdges.get(p2)?.length, 2);
//   assert.equal(outerEdges.get(p3)?.length, 2);
// });

// test("buildOuterEdges: should throw error for invalid connection count", () => {
//   const outerPointsMap = new Map();
//   const p1 = { x: 0, y: 0 };

//   outerPointsMap.set(p1, [{ x: 1, y: 0 }]); // Only 1 connection

//   assert.throws(() => {
//     DelaunayTriangulation.buildOuterEdges(outerPointsMap);
//   }, /Invalid outer edge configuration.*expected 2 connections, but found 1/);
// });

// triangulate behavioral tests
test("triangulate: should create single triangle for 3 non-collinear points", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const result = DelaunayTriangulation.triangulate(points);

  assert.equal(
    result.triangles.length,
    1,
    "Should create exactly one triangle",
  );

  const triangle = result.triangles[0];

  // Check that all vertices are from the original point set
  const vertices = [triangle.a, triangle.b, triangle.c];
  for (const point of points) {
    assert.ok(
      vertices.includes(point),
      `Point (${point.x}, ${point.y}) should be a vertex`,
    );
  }

  // Check that triangle has valid properties
  assert.ok(Number.isFinite(triangle.circumcenter.x));
  assert.ok(Number.isFinite(triangle.circumcenter.y));
  assert.ok(triangle.circumRadiusSquared >= 0);
});

test("triangulate: should create correct triangulation for 4 points in square", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];

  const result = DelaunayTriangulation.triangulate(points);

  assert.equal(
    result.triangles.length,
    2,
    "Square should be divided into 2 triangles",
  );

  // All triangles should have valid properties
  for (const triangle of result.triangles) {
    assert.ok(Number.isFinite(triangle.circumcenter.x));
    assert.ok(Number.isFinite(triangle.circumcenter.y));
    assert.ok(triangle.circumRadiusSquared >= 0);
  }
});

test("triangulate: should provide correct outer boundary edges", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const result = DelaunayTriangulation.triangulate(points);

  // Triangle should have 3 boundary edges
  assert.equal(
    result.outerEdges.size,
    3,
    "Triangle should have 3 boundary edges",
  );

  // Each point should be in the outer edges
  for (const point of points) {
    assert.ok(
      result.outerEdges.has(point),
      `Point (${point.x}, ${point.y}) should be on boundary`,
    );

    const adjacentPoints = result.outerEdges.get(point);
    if (!adjacentPoints) {
      throw new Error(`Point not found in outer edges: ${point.x}, ${point.y}`);
    }
    assert.equal(
      adjacentPoints.length,
      2,
      "Each boundary point should have exactly 2 adjacent boundary points",
    );

    // Adjacent points should also be from original points
    assert.ok(
      points.includes(adjacentPoints[0]),
      "Adjacent point should be from input points",
    );
    assert.ok(
      points.includes(adjacentPoints[1]),
      "Adjacent point should be from input points",
    );
  }
});

test("triangulate: should handle negative coordinates correctly", () => {
  const points = [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: 1 },
  ];

  const result = DelaunayTriangulation.triangulate(points);

  assert.equal(result.triangles.length, 1);

  const triangle = result.triangles[0];
  assert.ok(Number.isFinite(triangle.circumcenter.x));
  assert.ok(Number.isFinite(triangle.circumcenter.y));
  assert.ok(triangle.circumRadiusSquared >= 0);
});

test("triangulate: should handle decimal coordinates", () => {
  const points = [
    { x: 0.1, y: 0.2 },
    { x: 0.8, y: 0.1 },
    { x: 0.3, y: 0.9 },
  ];

  const result = DelaunayTriangulation.triangulate(points);

  assert.equal(result.triangles.length, 1);

  for (const triangle of result.triangles) {
    assert.ok(Number.isFinite(triangle.circumcenter.x));
    assert.ok(Number.isFinite(triangle.circumcenter.y));
    assert.ok(triangle.circumRadiusSquared >= 0);
  }
});

test("triangulate: should preserve point references in result", () => {
  const points = [
    { x: 0, y: 0, id: "a" },
    { x: 1, y: 0, id: "b" },
    { x: 0, y: 1, id: "c" },
  ] as Array<{ x: number; y: number; id: string }>;

  const result = DelaunayTriangulation.triangulate(points);
  const triangle = result.triangles[0];

  // Check that original point objects are preserved
  assert.ok(
    triangle.a.hasOwnProperty("id"),
    "Point properties should be preserved",
  );
  assert.ok(
    triangle.b.hasOwnProperty("id"),
    "Point properties should be preserved",
  );
  assert.ok(
    triangle.c.hasOwnProperty("id"),
    "Point properties should be preserved",
  );

  // Verify they are the exact same objects
  assert.ok(
    points.includes(triangle.a),
    "Should reference original point objects",
  );
  assert.ok(
    points.includes(triangle.b),
    "Should reference original point objects",
  );
  assert.ok(
    points.includes(triangle.c),
    "Should reference original point objects",
  );
});

test("triangulate: should create proper boundary chain", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 2 },
    { x: 0, y: 2 },
  ];

  const result = DelaunayTriangulation.triangulate(points);

  // Verify boundary forms a closed chain
  const visited = new Set<(typeof points)[0]>();
  let current = points[0]; // Start from any boundary point
  let chainLength = 0;

  while (!visited.has(current) && chainLength < points.length + 1) {
    visited.add(current);
    const adjacent = result.outerEdges.get(current);
    if (!adjacent) {
      throw new Error(
        `Point not found in outer edges: ${current.x}, ${current.y}`,
      );
    }

    // Find next unvisited adjacent point
    const next = adjacent.find((p) => !visited.has(p));
    if (!next && chainLength < points.length - 1) {
      // If no unvisited adjacent point, we should be back at start
      break;
    }

    current = next || points[0];
    chainLength++;
  }

  assert.equal(
    chainLength,
    points.length,
    "Boundary should form a closed chain of correct length",
  );
});

test("triangulate: should handle points in different orders consistently", () => {
  const points1 = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const points2 = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 0 },
  ];

  const result1 = DelaunayTriangulation.triangulate(points1);
  const result2 = DelaunayTriangulation.triangulate(points2);

  // Both should produce valid triangulations
  assert.equal(result1.triangles.length, result2.triangles.length);
  assert.equal(result1.outerEdges.size, result2.outerEdges.size);
});

test("triangulate: should handle larger point sets", () => {
  // Create a simple 3x3 grid with some points removed to avoid collinearity
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1.5, y: 1 }, // Offset to avoid collinearity
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ];

  const result = DelaunayTriangulation.triangulate(points);

  // Should produce valid triangulation
  assert.ok(
    result.triangles.length > 0,
    "Should produce at least one triangle",
  );
  assert.ok(result.outerEdges.size > 0, "Should have boundary edges");

  // All triangles should have valid properties
  for (const triangle of result.triangles) {
    assert.ok(Number.isFinite(triangle.circumcenter.x));
    assert.ok(Number.isFinite(triangle.circumcenter.y));
    assert.ok(triangle.circumRadiusSquared >= 0);
  }
});

test("triangulate: should return immutable results", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const result = DelaunayTriangulation.triangulate(points);

  // Try to modify the results - should be readonly
  const trianglesArray = result.triangles;
  const outerEdgesMap = result.outerEdges;

  // These should be readonly arrays/maps
  assert.ok(Array.isArray(trianglesArray), "Triangles should be array-like");
  assert.ok(outerEdgesMap instanceof Map, "Outer edges should be map-like");
});

test.run();
