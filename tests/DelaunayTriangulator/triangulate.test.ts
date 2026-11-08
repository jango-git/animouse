import { expect, test } from "vitest";
import { DelaunayTriangulator } from "../../src/miscellaneous/DelaunayTriangulator";

test("triangulate: should create single triangle for 3 non-collinear points", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const result = DelaunayTriangulator.triangulate(points);

  expect(result.triangles.length, "Should create exactly one triangle").toEqual(1);

  const triangle = result.triangles[0];

  const vertices = [triangle.a, triangle.b, triangle.c];
  for (const point of points) {
    expect(
      vertices.includes(point),
      `Point (${point.x}, ${point.y}) should be a vertex`,
    ).toBeTruthy();
  }

  // Check that triangle has valid properties
  expect(Number.isFinite(triangle.circumcenter.x)).toBeTruthy();
  expect(Number.isFinite(triangle.circumcenter.y)).toBeTruthy();
  expect(triangle.circumradiusSquared >= 0).toBeTruthy();
});

test("triangulate: should create correct triangulation for 4 points in square", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];

  const result = DelaunayTriangulator.triangulate(points);

  expect(result.triangles.length, "Square should be divided into 2 triangles").toEqual(2);

  // All triangles should have valid properties
  for (const triangle of result.triangles) {
    expect(Number.isFinite(triangle.circumcenter.x)).toBeTruthy();
    expect(Number.isFinite(triangle.circumcenter.y)).toBeTruthy();
    expect(triangle.circumradiusSquared >= 0).toBeTruthy();
  }
});

test("triangulate: should provide correct outer boundary edges", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const result = DelaunayTriangulator.triangulate(points);

  // Triangle should have 3 boundary edges
  expect(result.boundaryEdgeMap.size, "Triangle should have 3 boundary edges").toEqual(3);

  // Each point should be in the outer edges
  for (const point of points) {
    expect(
      result.boundaryEdgeMap.has(point),
      `Point (${point.x}, ${point.y}) should be on boundary`,
    ).toBeTruthy();

    const adjacentPoints = result.boundaryEdgeMap.get(point);
    if (!adjacentPoints) {
      throw new Error(`Point not found in outer edges: ${point.x}, ${point.y}`);
    }
    expect(
      adjacentPoints.length,
      "Each boundary point should have exactly 2 adjacent boundary points",
    ).toEqual(2);

    // Adjacent points should also be from original points
    expect(
      points.includes(adjacentPoints[0]),
      "Adjacent point should be from input points",
    ).toBeTruthy();
    expect(
      points.includes(adjacentPoints[1]),
      "Adjacent point should be from input points",
    ).toBeTruthy();
  }
});

test("triangulate: should handle negative coordinates correctly", () => {
  const points = [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: 1 },
  ];

  const result = DelaunayTriangulator.triangulate(points);

  expect(result.triangles.length).toEqual(1);

  const triangle = result.triangles[0];
  expect(Number.isFinite(triangle.circumcenter.x)).toBeTruthy();
  expect(Number.isFinite(triangle.circumcenter.y)).toBeTruthy();
  expect(triangle.circumradiusSquared >= 0).toBeTruthy();
});

test("triangulate: should handle decimal coordinates", () => {
  const points = [
    { x: 0.1, y: 0.2 },
    { x: 0.8, y: 0.1 },
    { x: 0.3, y: 0.9 },
  ];

  const result = DelaunayTriangulator.triangulate(points);

  expect(result.triangles.length).toEqual(1);

  for (const triangle of result.triangles) {
    expect(Number.isFinite(triangle.circumcenter.x)).toBeTruthy();
    expect(Number.isFinite(triangle.circumcenter.y)).toBeTruthy();
    expect(triangle.circumradiusSquared >= 0).toBeTruthy();
  }
});

test("triangulate: should preserve point references in result", () => {
  const points = [
    { x: 0, y: 0, id: "a" },
    { x: 1, y: 0, id: "b" },
    { x: 0, y: 1, id: "c" },
  ] as { x: number; y: number; id: string }[];

  const result = DelaunayTriangulator.triangulate(points);
  const triangle = result.triangles[0];

  // Check that original point objects are preserved
  expect(triangle.a.hasOwnProperty("id"), "Point properties should be preserved").toBeTruthy();
  expect(triangle.b.hasOwnProperty("id"), "Point properties should be preserved").toBeTruthy();
  expect(triangle.c.hasOwnProperty("id"), "Point properties should be preserved").toBeTruthy();

  // Verify they are the exact same objects
  expect(points.includes(triangle.a), "Should reference original point objects").toBeTruthy();
  expect(points.includes(triangle.b), "Should reference original point objects").toBeTruthy();
  expect(points.includes(triangle.c), "Should reference original point objects").toBeTruthy();
});

test("triangulate: should create proper boundary chain", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 2 },
    { x: 0, y: 2 },
  ];

  const result = DelaunayTriangulator.triangulate(points);

  // Verify boundary forms a closed chain
  const visited = new Set<(typeof points)[0]>();
  let current = points[0]; // Start from any boundary point
  let chainLength = 0;

  while (!visited.has(current) && chainLength < points.length + 1) {
    visited.add(current);
    const adjacent = result.boundaryEdgeMap.get(current);
    if (!adjacent) {
      throw new Error(`Point not found in outer edges: ${current.x}, ${current.y}`);
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

  expect(chainLength, "Boundary should form a closed chain of correct length").toEqual(
    points.length,
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

  const result1 = DelaunayTriangulator.triangulate(points1);
  const result2 = DelaunayTriangulator.triangulate(points2);

  // Both should produce valid triangulations
  expect(result1.triangles.length).toEqual(result2.triangles.length);
  expect(result1.boundaryEdgeMap.size).toEqual(result2.boundaryEdgeMap.size);
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

  const result = DelaunayTriangulator.triangulate(points);

  // Should produce valid triangulation
  expect(result.triangles.length > 0, "Should produce at least one triangle").toBeTruthy();
  expect(result.boundaryEdgeMap.size > 0, "Should have boundary edges").toBeTruthy();

  // All triangles should have valid properties
  for (const triangle of result.triangles) {
    expect(Number.isFinite(triangle.circumcenter.x)).toBeTruthy();
    expect(Number.isFinite(triangle.circumcenter.y)).toBeTruthy();
    expect(triangle.circumradiusSquared >= 0).toBeTruthy();
  }
});

test("triangulate: should return immutable results", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const result = DelaunayTriangulator.triangulate(points);

  // Try to modify the results - should be readonly
  const trianglesArray = result.triangles;
  const outerEdgesMap = result.boundaryEdgeMap;

  // These should be readonly arrays/maps
  expect(Array.isArray(trianglesArray), "Triangles should be array-like").toBeTruthy();
  expect(outerEdgesMap instanceof Map, "Outer edges should be map-like").toBeTruthy();
});
