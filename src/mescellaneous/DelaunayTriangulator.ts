import { Vector2, type Vector2Like } from "three";
import { assertValidNumber } from "./assertions";
import type { TriangleCache } from "./math";
import {
  isPointInsideCircle,
  precomputeTriangle,
  TRIANGLE_VERTEX_COUNT,
} from "./math";
import { EPSILON } from "./miscellaneous";

const SUPER_TRIANGLE_SCALE_FACTOR = 16;

export interface Triangle<T extends Vector2Like> extends TriangleCache {
  readonly a: T;
  readonly b: T;
  readonly c: T;
}

export interface TriangulationResult<T extends Vector2Like> {
  readonly triangles: Triangle<T>[];
  readonly boundaryEdgeMap: Map<T, [T, T]>;
}

export class DelaunayTriangulator {
  public static triangulate<T extends Vector2Like>(
    points: T[],
  ): TriangulationResult<T> {
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
        if (
          Math.abs(x - points[j].x) < EPSILON &&
          Math.abs(y - points[j].y) < EPSILON
        ) {
          throw new Error(
            `Duplicate points found at indices ${i} and ${j}: (${x}, ${y})`,
          );
        }
      }
    }

    {
      const [a, b, ...rest] = points;
      const direction = new Vector2().subVectors(b, a).normalize();
      const temp = new Vector2();

      if (
        rest.every(
          (p) => Math.abs(direction.cross(temp.subVectors(p, a))) < EPSILON,
        )
      ) {
        throw new Error("All points are collinear - cannot run triangulation");
      }
    }

    const superTriangle = DelaunayTriangulator.buildSuperTriangle(points);
    let triangles: Triangle<T>[] = [superTriangle];

    for (const point of points) {
      const badTriangles = DelaunayTriangulator.filterBadTriangles(
        triangles,
        point,
      );

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

  private static buildPolygon<T extends Vector2Like>(
    triangles: Triangle<T>[],
  ): [T, T][] {
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
                (edge[0] !== e[0] || edge[1] !== e[1]) &&
                (edge[1] !== e[0] || edge[0] !== e[1]),
            ),
        );

        if (isOuterEdge) {
          polygonOuterEdges.push(edge);
        }
      }
    }

    return polygonOuterEdges;
  }

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

  private static buildSuperTriangle<T extends Vector2Like>(
    points: T[],
  ): Triangle<T> {
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

    const delta =
      Math.max(maxX - minX, maxY - minY) * SUPER_TRIANGLE_SCALE_FACTOR;

    const a = { x: minX - delta, y: minY - delta } as T;
    const b = { x: minX + 2 * delta, y: minY - delta } as T;
    const c = { x: minX + delta, y: minY + 2 * delta } as T;

    return { a, b, c, ...precomputeTriangle(a, b, c) };
  }

  private static isVertexFromTriangle<T extends Vector2Like>(
    vertex: T,
    triangle: Triangle<T>,
  ): boolean {
    return (
      vertex === triangle.a || vertex === triangle.b || vertex === triangle.c
    );
  }
}
