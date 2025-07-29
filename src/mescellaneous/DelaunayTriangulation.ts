import { Vector2, type Vector2Like } from "three";
import { assertValidNumber } from "./assertions";
import type { TriangleCache } from "./math";
import { isPointInsideCircle, precomputeTriangle } from "./math";
import { EPSILON } from "./miscellaneous";

const MIN_POINTS_COUNT = 3;
const SUPER_TRIANGLE_SCALE_FACTOR = 100;

export interface Triangle<T extends Vector2Like> extends TriangleCache {
  readonly a: T;
  readonly b: T;
  readonly c: T;
}

export interface TriangulationResult<T extends Vector2Like> {
  readonly triangles: Triangle<T>[];
  readonly outerEdges: Map<T, [T, T]>;
}

export class DelaunayTriangulation {
  public static triangulate<T extends Vector2Like>(
    points: T[],
  ): TriangulationResult<T> {
    DelaunayTriangulation.validatePoints(points);

    const superTriangle = DelaunayTriangulation.buildSuperTriangle(points);
    let triangles: Triangle<T>[] = [superTriangle];

    for (const point of points) {
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
          ...precomputeTriangle(edge[0], edge[1], point),
        };
        triangles.push(newTriangle);
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

  private static validatePoints<T extends Vector2Like>(points: T[]): void {
    if (points.length < MIN_POINTS_COUNT) {
      throw new Error(
        `At least ${MIN_POINTS_COUNT} points are required for triangulation, but got ${points.length}`,
      );
    }

    // Check for invalid coordinates
    for (const point of points) {
      assertValidNumber(point.x, "x-coordinate");
      assertValidNumber(point.y, "y-coordinate");
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

  private static findBadTriangles<T extends Vector2Like>(
    triangles: Triangle<T>[],
    point: T,
  ): Triangle<T>[] {
    const badTriangles: Triangle<T>[] = [];

    for (const triangle of triangles) {
      if (
        isPointInsideCircle(
          triangle.circumcenter,
          triangle.circumradiusSquared,
          point,
        )
      ) {
        badTriangles.push(triangle);
      }
    }

    return badTriangles;
  }

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
      ...precomputeTriangle(a, b, c),
    };
  }

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
