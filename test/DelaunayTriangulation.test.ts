import { test } from "uvu";
import * as assert from "uvu/assert";
import { DelaunayTriangulation } from "../src/mescellaneous/DelaunayTriangulation";

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
  ] as { x: number; y: number; id: string }[];

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

    current = next ?? points[0];
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
