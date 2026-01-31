import { Vector2 } from "three";
import { assertValidNumber } from "./assertions";
import type { TriangleCache, Vector2Like } from "./math";
import { isPointInsideCircle, precomputeTriangle, TRIANGLE_VERTEX_COUNT } from "./math";
import { EPSILON } from "./miscellaneous";

/** Scale factor for generating the super triangle that encompasses all input points. */
const SUPER_TRIANGLE_SCALE_FACTOR = 16;

/**
 * A triangle in 2D space with precomputed geometric properties.
 *
 * @template T - Type of vertices that must be Vector2Like objects
 */
export interface Triangle<T extends Vector2Like> extends TriangleCache {
  /** First vertex of the triangle */
  readonly a: T;
  /** Second vertex of the triangle */
  readonly b: T;
  /** Third vertex of the triangle */
  readonly c: T;
}

/**
 * Result of Delaunay triangulation.
 *
 * @template T - Type of vertices that must be Vector2Like objects
 */
export interface TriangulationResult<T extends Vector2Like> {
  /** Array of triangles forming the Delaunay triangulation */
  readonly triangles: Triangle<T>[];
  /** Map from boundary vertices to their adjacent boundary vertices [prev, next] */
  readonly boundaryEdgeMap: Map<T, [T, T]>;
}

/**
 * Implements Bowyer-Watson algorithm for Delaunay triangulation.
 */
export class DelaunayTriangulator {
  /**
   * Performs Delaunay triangulation on a set of 2D points.
   *
   * @template T - Type of vertices that must be Vector2Like objects
   * @param points - Array of points to triangulate (minimum 3 points required)
   * @returns Triangulation result containing triangles and boundary edge information
   * @throws {Error} When fewer than 3 points provided, points contain invalid coordinates,
   *                 duplicate points exist, or all points are collinear
   */
  public static triangulate<T extends Vector2Like>(points: T[]): TriangulationResult<T> {
    if (points.length < TRIANGLE_VERTEX_COUNT) {
      throw new Error(
        `At least ${TRIANGLE_VERTEX_COUNT} points are required for triangulation, but got ${points.length}`,
      );
    }

    for (const point of points) {
      assertValidNumber(point.x, "x-coordinate");
      assertValidNumber(point.y, "y-coordinate");
    }

    for (let i = 0; i < points.length - 1; i++) {
      const x = points[i].x;
      const y = points[i].y;

      for (let j = i + 1; j < points.length; j++) {
        if (Math.abs(x - points[j].x) < EPSILON && Math.abs(y - points[j].y) < EPSILON) {
          throw new Error(`Duplicate points found at indices ${i} and ${j}: (${x}, ${y})`);
        }
      }
    }

    {
      const [a, b, ...rest] = points;
      const direction = new Vector2(b.x - a.x, b.y - a.y).normalize();
      const temp = new Vector2();

      if (rest.every((p) => Math.abs(direction.cross(temp.set(p.x - a.x, p.y - a.y))) < EPSILON)) {
        throw new Error("All points are collinear - cannot run triangulation");
      }
    }

    const superTriangle = DelaunayTriangulator.buildSuperTriangle(points);
    let triangles: Triangle<T>[] = [superTriangle];

    for (const point of points) {
      const badTriangles = DelaunayTriangulator.filterBadTriangles(triangles, point);

      for (const edge of DelaunayTriangulator.buildPolygon(badTriangles)) {
        triangles.push({
          a: edge[0],
          b: edge[1],
          c: point,
          ...precomputeTriangle(edge[0], edge[1], point),
        });
      }
    }

    const boundaryEdgeMap = DelaunayTriangulator.filterSuperTriangleVertices(
      triangles,
      superTriangle,
    );

    for (const [key, value] of boundaryEdgeMap) {
      // This code is unreachable under all inputs.
      // The map represents the outer contour of a closed 2D mesh after Delaunay triangulation.
      // Every boundary vertex must have exactly two neighbors on the contour.
      // If this branch is ever taken, it implies a violation of mesh invariants and a bug elsewhere in the pipeline —
      // not an edge case to be covered by tests.
      /* c8 ignore next 5 */
      if (value.length !== 2) {
        throw new Error(
          `Invariant violation: outer edge point (${key.x}, ${key.y}) has ${value.length} connections (expected 2)`,
        );
      }
    }

    return { triangles, boundaryEdgeMap: boundaryEdgeMap as Map<T, [T, T]> };
  }

  /**
   * Identifies and removes triangles whose circumcircles contain the given point.
   * Modifies the input triangles array in-place for efficiency.
   *
   * @template T - Type of vertices that must be Vector2Like objects
   * @param triangles - Array of triangles to filter (modified in-place)
   * @param point - Point to test against triangle circumcircles
   * @returns Array of triangles that contain the point in their circumcircles
   */
  private static filterBadTriangles<T extends Vector2Like>(
    triangles: Triangle<T>[],
    point: T,
  ): Triangle<T>[] {
    const badTriangles: Triangle<T>[] = [];

    let w = 0;
    for (const triangle of triangles) {
      const isBadTriangle = isPointInsideCircle(
        triangle.circumcenter,
        triangle.circumradiusSquared,
        point,
      );

      if (isBadTriangle) {
        badTriangles.push(triangle);
      } else {
        triangles[w++] = triangle;
      }
    }

    triangles.length = w;
    return badTriangles;
  }

  /**
   * Constructs the polygon boundary formed by removing bad triangles.
   * Finds edges that belong to only one triangle.
   *
   * @template T - Type of vertices that must be Vector2Like objects
   * @param triangles - Array of triangles forming the cavity
   * @returns Array of edges [vertex1, vertex2] that form the polygon boundary
   */
  private static buildPolygon<T extends Vector2Like>(triangles: Triangle<T>[]): [T, T][] {
    const polygonOuterEdges: [T, T][] = [];

    for (const triangle of triangles) {
      const edges: [T, T][] = [
        [triangle.a, triangle.b],
        [triangle.b, triangle.c],
        [triangle.c, triangle.a],
      ];

      for (const edge of edges) {
        const isOuterEdge = triangles.every(
          (t) =>
            triangle === t ||
            [
              [t.a, t.b],
              [t.b, t.c],
              [t.c, t.a],
            ].every(
              (e) =>
                (edge[0] !== e[0] || edge[1] !== e[1]) && (edge[1] !== e[0] || edge[0] !== e[1]),
            ),
        );

        if (isOuterEdge) {
          polygonOuterEdges.push(edge);
        }
      }
    }

    return polygonOuterEdges;
  }

  /**
   * Removes triangles containing super triangle vertices and builds boundary edge map.
   * Filters out triangles that include any vertex from the initial super triangle.
   *
   * @template T - Type of vertices that must be Vector2Like objects
   * @param triangles - Array of triangles to filter (modified in-place)
   * @param superTriangle - The super triangle used to initialize triangulation
   * @returns Map from boundary vertices to arrays of their adjacent boundary vertices
   */
  private static filterSuperTriangleVertices<T extends Vector2Like>(
    triangles: Triangle<T>[],
    superTriangle: Triangle<T>,
  ): Map<T, T[]> {
    const boundaryEdgeMap = new Map<T, T[]>();

    let w = 0;
    for (const t of triangles) {
      const boundaryPoints: T[] = [];

      if (!DelaunayTriangulator.isVertexFromTriangle(t.a, superTriangle)) {
        boundaryPoints.push(t.a);
      }

      if (!DelaunayTriangulator.isVertexFromTriangle(t.b, superTriangle)) {
        boundaryPoints.push(t.b);
      }

      if (!DelaunayTriangulator.isVertexFromTriangle(t.c, superTriangle)) {
        boundaryPoints.push(t.c);
      }

      if (boundaryPoints.length === 2) {
        const [lPoint, rPoint] = boundaryPoints;

        const lArray = boundaryEdgeMap.get(lPoint) ?? [];
        const rArray = boundaryEdgeMap.get(rPoint) ?? [];

        lArray.push(rPoint);
        rArray.push(lPoint);

        boundaryEdgeMap.set(lPoint, lArray);
        boundaryEdgeMap.set(rPoint, rArray);
      }

      if (boundaryPoints.length === TRIANGLE_VERTEX_COUNT) {
        triangles[w++] = t;
      }
    }

    triangles.length = w;
    return boundaryEdgeMap;
  }

  /**
   * Constructs a large triangle that encompasses all input points.
   * Vertices are positioned outside the bounding box of input points.
   *
   * @template T - Type of vertices that must be Vector2Like objects
   * @param points - Array of input points to encompass
   * @returns Triangle that contains all input points with precomputed properties
   */
  private static buildSuperTriangle<T extends Vector2Like>(points: T[]): Triangle<T> {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    const delta = Math.max(maxX - minX, maxY - minY) * SUPER_TRIANGLE_SCALE_FACTOR;

    const a = { x: minX - delta, y: minY - delta } as T;
    const b = { x: minX + 2 * delta, y: minY - delta } as T;
    const c = { x: minX + delta, y: minY + 2 * delta } as T;

    return { a, b, c, ...precomputeTriangle(a, b, c) };
  }

  /**
   * Tests whether a vertex belongs to a specific triangle.
   *
   * @template T - Type of vertices that must be Vector2Like objects
   * @param vertex - Vertex to test for membership
   * @param triangle - Triangle to test against
   * @returns True if the vertex is one of the triangle's vertices, false otherwise
   */
  private static isVertexFromTriangle<T extends Vector2Like>(
    vertex: T,
    triangle: Triangle<T>,
  ): boolean {
    return vertex === triangle.a || vertex === triangle.b || vertex === triangle.c;
  }
}
