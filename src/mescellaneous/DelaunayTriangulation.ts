import { Vector2, type Vector2Like } from "three";
import { EPSILON } from "./miscellaneous";

const MIN_POINTS_COUNT = 3;
const SUPER_TRIANGLE_SCALE_FACTOR = 100;

/**
 * Represents a triangle in a Delaunay triangulation.
 *
 * @template T - The type of vector points that extends Vector2Like
 */
export interface Triangle<T extends Vector2Like> {
  /** First vertex of the triangle */
  readonly a: T;
  /** Second vertex of the triangle */
  readonly b: T;
  /** Third vertex of the triangle */
  readonly c: T;
  /** Denominator used in circumcenter calculation */
  readonly denominator: number;
  /** Center of the circumcircle that passes through all three vertices */
  readonly circumcenter: Vector2Like;
  /** Squared radius of the circumcircle */
  readonly circumRadiusSquared: number;
}

/**
 * Result of a Delaunay triangulation operation.
 *
 * @template T - The type of vector points that extends Vector2Like
 */
export interface TriangulationResult<T extends Vector2Like> {
  /** Array of triangles that form the Delaunay triangulation */
  readonly triangles: readonly Triangle<T>[];
  /** Map of outer boundary edges, where each point maps to its two adjacent boundary points */
  readonly outerEdges: ReadonlyMap<T, readonly [T, T]>;
}

/**
 * Implementation of Delaunay triangulation using the Bowyer-Watson algorithm.
 *
 * The Delaunay triangulation maximizes the minimum angle of all triangles,
 * avoiding thin triangles when possible. This implementation ensures that
 * no point lies inside the circumcircle of any triangle.
 */
export class DelaunayTriangulation {
  /**
   * Computes the Delaunay triangulation of a set of points.
   *
   * @template T - The type of vector points that extends Vector2Like
   * @param points - Array of points to triangulate (minimum 3 points required)
   * @returns Object containing the triangulation result with triangles and outer edges
   *
   * @throws {Error} When fewer than 3 points are provided
   * @throws {Error} When points contain invalid coordinates (NaN or Infinity)
   * @throws {Error} When duplicate points are found
   * @throws {Error} When all points are collinear
   * @throws {Error} When triangulation fails during processing
   *
   * @example
   * ```typescript
   * const points = [
   *   { x: 0, y: 0 },
   *   { x: 1, y: 0 },
   *   { x: 0, y: 1 }
   * ];
   * const result = DelaunayTriangulation.triangulate(points);
   * console.log(result.triangles.length); // 1
   * ```
   */
  public static triangulate<T extends Vector2Like>(
    points: T[],
  ): TriangulationResult<T> {
    DelaunayTriangulation.validatePoints(points);

    const superTriangle = DelaunayTriangulation.createSuperTriangle(points);
    let triangles: Triangle<T>[] = [superTriangle];

    for (let i = 0; i < points.length; i++) {
      const point = points[i];

      try {
        const badTriangles = DelaunayTriangulation.findBadTriangles(
          triangles,
          point,
        );
        const polygonEdges =
          DelaunayTriangulation.buildPolygonEdges(badTriangles);

        triangles = triangles.filter((t) => !badTriangles.includes(t));

        for (const edge of polygonEdges) {
          const newTriangle = {
            a: edge[0],
            b: edge[1],
            c: point,
            ...DelaunayTriangulation.calculateCircumcenterData(
              edge[0],
              edge[1],
              point,
            ),
          };
          triangles.push(newTriangle);
        }
      } catch (error) {
        throw new Error(
          `Error processing point ${i} (${point.x}, ${point.y}): ${(error as Error).message}`,
        );
      }
    }

    const { filteredTriangles, outerMap } =
      DelaunayTriangulation.filterSuperTriangleVertices(
        triangles,
        superTriangle,
      );
    const outerEdges = DelaunayTriangulation.buildOuterEdges(outerMap);

    return { triangles: filteredTriangles, outerEdges };
  }

  /**
   * Validates the input points for triangulation.
   *
   * @template T - The type of vector points that extends Vector2Like
   * @param points - Array of points to validate
   *
   * @throws {Error} When fewer than 3 points are provided
   * @throws {Error} When points contain invalid coordinates
   * @throws {Error} When duplicate points are found
   * @throws {Error} When all points are collinear
   *
   * @private
   */
  private static validatePoints<T extends Vector2Like>(points: T[]): void {
    if (points.length < MIN_POINTS_COUNT) {
      throw new Error(
        `At least ${MIN_POINTS_COUNT} points are required for triangulation, but got ${points.length}`,
      );
    }

    // Check for invalid coordinates
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new Error(
          `Point ${i} has invalid coordinates: (${point.x}, ${point.y})`,
        );
      }
    }

    // Check for duplicate points
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const p1 = points[i];
        const p2 = points[j];
        if (
          Math.abs(p1.x - p2.x) < EPSILON &&
          Math.abs(p1.y - p2.y) < EPSILON
        ) {
          throw new Error(
            `Duplicate points found at indices ${i} and ${j}: (${p1.x}, ${p1.y})`,
          );
        }
      }
    }

    // Check for collinearity
    {
      const [a, b, ...rest] = points;
      const direction = new Vector2().subVectors(b, a).normalize();
      const tempVector = new Vector2();

      const isAllPointsCollinear = rest.every(
        (p) => Math.abs(direction.cross(tempVector.subVectors(p, a))) < EPSILON,
      );

      if (isAllPointsCollinear) {
        throw new Error(
          "All points are collinear - cannot create triangulation",
        );
      }
    }
  }

  /**
   * Finds all triangles whose circumcircle contains the given point.
   * These triangles violate the Delaunay condition and need to be removed.
   *
   * @template T - The type of vector points that extends Vector2Like
   * @param triangles - Array of existing triangles
   * @param point - Point to test against
   * @returns Array of triangles that contain the point in their circumcircle
   *
   * @private
   */
  private static findBadTriangles<T extends Vector2Like>(
    triangles: Triangle<T>[],
    point: T,
  ): Triangle<T>[] {
    const badTriangles: Triangle<T>[] = [];

    for (const triangle of triangles) {
      if (DelaunayTriangulation.isPointInCircumcircle(triangle, point)) {
        badTriangles.push(triangle);
      }
    }

    return badTriangles;
  }

  /**
   * Builds the polygon edges from the bad triangles by finding edges that are not shared
   * between triangles. These edges form the boundary of the polygon hole left after
   * removing the bad triangles.
   *
   * @template T - The type of vector points that extends Vector2Like
   * @param badTriangles - Array of triangles to be removed
   * @returns Array of edges that form the polygon boundary
   *
   * @private
   */
  private static buildPolygonEdges<T extends Vector2Like>(
    badTriangles: Triangle<T>[],
  ): [T, T][] {
    const polygonEdges: [T, T][] = [];

    for (const triangle of badTriangles) {
      const edges: [T, T][] = [
        [triangle.a, triangle.b],
        [triangle.b, triangle.c],
        [triangle.c, triangle.a],
      ];

      for (const edge of edges) {
        let isShared = false;

        for (const otherTriangle of badTriangles) {
          if (triangle === otherTriangle) {
            continue;
          }

          const otherEdges: [T, T][] = [
            [otherTriangle.a, otherTriangle.b],
            [otherTriangle.b, otherTriangle.c],
            [otherTriangle.c, otherTriangle.a],
          ];

          if (
            otherEdges.some(
              (e) =>
                (e[0] === edge[0] && e[1] === edge[1]) ||
                (e[0] === edge[1] && e[1] === edge[0]),
            )
          ) {
            isShared = true;
            break;
          }
        }

        if (!isShared) {
          polygonEdges.push(edge);
        }
      }
    }

    return polygonEdges;
  }

  /**
   * Filters out triangles that contain vertices from the super triangle and
   * builds a map of outer boundary edges.
   *
   * @template T - The type of vector points that extends Vector2Like
   * @param triangles - Array of all triangles including those with super triangle vertices
   * @param superTriangle - The super triangle used to start the algorithm
   * @returns Object containing filtered triangles and outer edge map
   *
   * @private
   */
  private static filterSuperTriangleVertices<T extends Vector2Like>(
    triangles: Triangle<T>[],
    superTriangle: Triangle<T>,
  ): { filteredTriangles: Triangle<T>[]; outerMap: Map<T, T[]> } {
    const outerMap = new Map<T, T[]>();

    const filteredTriangles = triangles.filter((t): boolean => {
      const edgePoints: T[] = [];
      let hasSuper = false;

      if (DelaunayTriangulation.isVertexFromSuperTriangle(t.a, superTriangle)) {
        hasSuper = true;
      } else {
        edgePoints.push(t.a);
      }

      if (DelaunayTriangulation.isVertexFromSuperTriangle(t.b, superTriangle)) {
        hasSuper = true;
      } else {
        edgePoints.push(t.b);
      }

      if (DelaunayTriangulation.isVertexFromSuperTriangle(t.c, superTriangle)) {
        hasSuper = true;
      } else {
        edgePoints.push(t.c);
      }

      if (edgePoints.length === 2) {
        const [leftPoint, rightPoint] = edgePoints;

        const leftArray = outerMap.get(leftPoint) ?? [];
        const rightArray = outerMap.get(rightPoint) ?? [];

        leftArray.push(rightPoint);
        rightArray.push(leftPoint);

        outerMap.set(leftPoint, leftArray);
        outerMap.set(rightPoint, rightArray);
      }

      return !hasSuper;
    });

    return { filteredTriangles, outerMap };
  }

  /**
   * Builds the final outer edges map from the temporary outer points map.
   * Each boundary point should have exactly two adjacent boundary points.
   *
   * @template T - The type of vector points that extends Vector2Like
   * @param outerPointsMap - Map of boundary points to their adjacent points
   * @returns Map where each boundary point maps to exactly two adjacent points
   *
   * @throws {Error} When a boundary point doesn't have exactly 2 connections
   *
   * @private
   */
  private static buildOuterEdges<T extends Vector2Like>(
    outerPointsMap: Map<T, T[]>,
  ): Map<T, [T, T]> {
    const outerEdges = new Map<T, [T, T]>();

    for (const [key, value] of outerPointsMap) {
      if (value.length !== 2) {
        throw new Error(
          `Invalid outer edge configuration for point (${key.x}, ${key.y}): ` +
            `expected 2 connections, but found ${value.length}`,
        );
      }
      outerEdges.set(key, [value[0], value[1]]);
    }

    return outerEdges;
  }

  /**
   * Creates a super triangle that encompasses all input points.
   * The super triangle is used to start the Bowyer-Watson algorithm and
   * is later removed from the final triangulation.
   *
   * @template T - The type of vector points that extends Vector2Like
   * @param points - Array of points to encompass
   * @returns Super triangle that contains all input points
   *
   * @private
   */
  private static createSuperTriangle<T extends Vector2Like>(
    points: T[],
  ): Triangle<T> {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    const deltaX = maxX - minX;
    const deltaY = maxY - minY;
    const deltaMax = Math.max(deltaX, deltaY) * SUPER_TRIANGLE_SCALE_FACTOR;

    const a = { x: minX - deltaMax, y: minY - deltaMax } as T;
    const b = { x: minX + 2 * deltaMax, y: minY - deltaMax } as T;
    const c = { x: minX + deltaMax, y: minY + 2 * deltaMax } as T;

    return {
      a,
      b,
      c,
      ...DelaunayTriangulation.calculateCircumcenterData(a, b, c),
    };
  }

  /**
   * Calculates the circumcenter and circumradius for a triangle.
   * The circumcenter is the center of the circle that passes through all three vertices.
   *
   * @template T - The type of vector points that extends Vector2Like
   * @param a - First vertex of the triangle
   * @param b - Second vertex of the triangle
   * @param c - Third vertex of the triangle
   * @returns Object containing denominator, circumcenter, and squared circumradius
   *
   * @throws {Error} When the three points are collinear (denominator is zero)
   *
   * @private
   */
  private static calculateCircumcenterData<T extends Vector2Like>(
    a: T,
    b: T,
    c: T,
  ): {
    denominator: number;
    circumcenter: Vector2Like;
    circumRadiusSquared: number;
  } {
    const aMagnitudeSquared = a.x * a.x + a.y * a.y;
    const bMagnitudeSquared = b.x * b.x + b.y * b.y;
    const cMagnitudeSquared = c.x * c.x + c.y * c.y;

    const denominator =
      2 * (a.x * (c.y - b.y) + b.x * (a.y - c.y) + c.x * (b.y - a.y));

    if (Math.abs(denominator) < EPSILON) {
      throw new Error(
        `Cannot calculate circumcenter for triangle vertices: ` +
          `(${a.x}, ${a.y}), (${b.x}, ${b.y}), (${c.x}, ${c.y}) - points are collinear`,
      );
    }

    const circumcenter = {
      x:
        (aMagnitudeSquared * (c.y - b.y) +
          bMagnitudeSquared * (a.y - c.y) +
          cMagnitudeSquared * (b.y - a.y)) /
        denominator,
      y:
        (aMagnitudeSquared * (b.x - c.x) +
          bMagnitudeSquared * (c.x - a.x) +
          cMagnitudeSquared * (a.x - b.x)) /
        denominator,
    };

    const circumRadiusSquared =
      (a.x - circumcenter.x) ** 2 + (a.y - circumcenter.y) ** 2;

    return { denominator, circumcenter, circumRadiusSquared };
  }

  /**
   * Tests whether a point lies inside the circumcircle of a triangle.
   * This is the core test for the Delaunay condition.
   *
   * @template T - The type of vector points that extends Vector2Like
   * @param triangle - Triangle to test against
   * @param point - Point to test
   * @returns True if the point is inside the circumcircle, false otherwise
   *
   * @private
   */
  private static isPointInCircumcircle<T extends Vector2Like>(
    triangle: Triangle<T>,
    point: T,
  ): boolean {
    const dx = point.x - triangle.circumcenter.x;
    const dy = point.y - triangle.circumcenter.y;
    return dx ** 2 + dy ** 2 < triangle.circumRadiusSquared - EPSILON;
  }

  /**
   * Checks if a vertex belongs to the super triangle.
   * Used to filter out super triangle vertices from the final result.
   *
   * @template T - The type of vector points that extends Vector2Like
   * @param vertex - Vertex to check
   * @param superTriangle - The super triangle to check against
   * @returns True if the vertex is from the super triangle, false otherwise
   *
   * @private
   */
  private static isVertexFromSuperTriangle<T extends Vector2Like>(
    vertex: T,
    superTriangle: Triangle<T>,
  ): boolean {
    return (
      vertex === superTriangle.a ||
      vertex === superTriangle.b ||
      vertex === superTriangle.c
    );
  }
}
