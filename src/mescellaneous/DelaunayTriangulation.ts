import type { Vector2Like } from "three";
import { EPSILON } from "./miscellaneous";

const MINIMUM_POINTS = 3;
const LARGE_VALUE = 1024;
const TRIANGLE_VERTEX_COUNT = 3;

export interface Triangle<T extends Vector2Like> {
  a: T;
  b: T;
  c: T;
  center: Vector2Like;
}

export interface TriangulationResult<T extends Vector2Like> {
  triangles: Triangle<T>[];
  outerEdges: Map<T, [T, T]>;
}

export class DelaunayTriangulation {
  public static triangulate<T extends Vector2Like>(
    points: T[],
  ): TriangulationResult<T> {
    if (points.length < MINIMUM_POINTS) {
      throw new Error("At least 3 points are required for triangulation");
    }

    const superTriangle = DelaunayTriangulation.createSuperTriangle(points);
    let triangles: Triangle<T>[] = [superTriangle];

    for (const point of points) {
      const badTriangles: Triangle<T>[] = [];

      for (const triangle of triangles) {
        if (DelaunayTriangulation.isPointInCircumcircle(triangle, point)) {
          badTriangles.push(triangle);
        }
      }

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

      triangles = triangles.filter((t) => !badTriangles.includes(t));

      for (const edge of polygonEdges) {
        const newTriangle = {
          a: edge[0],
          b: edge[1],
          c: point,
          center: DelaunayTriangulation.calculateCircumcenter(
            edge[0],
            edge[1],
            point,
          ),
        };
        triangles.push(newTriangle);
      }
    }

    triangles = triangles.filter(
      (triangle) =>
        !DelaunayTriangulation.isVertexFromSuperTriangle(
          triangle.a,
          superTriangle,
        ) &&
        !DelaunayTriangulation.isVertexFromSuperTriangle(
          triangle.b,
          superTriangle,
        ) &&
        !DelaunayTriangulation.isVertexFromSuperTriangle(
          triangle.c,
          superTriangle,
        ),
    );

    const outerEdges = DelaunayTriangulation.calculateOuterEdges(triangles);

    return { triangles, outerEdges };
  }

  private static createSuperTriangle<T extends Vector2Like>(
    points: T[],
  ): Triangle<T> {
    let minimumX = Infinity;
    let minimumY = Infinity;
    let maximumX = -Infinity;
    let maximumY = -Infinity;

    for (const point of points) {
      minimumX = Math.min(minimumX, point.x);
      minimumY = Math.min(minimumY, point.y);
      maximumX = Math.max(maximumX, point.x);
      maximumY = Math.max(maximumY, point.y);
    }

    const deltaX = maximumX - minimumX;
    const deltaY = maximumY - minimumY;

    const deltaMaximum = Math.max(deltaX, deltaY) * LARGE_VALUE;

    const a = { x: minimumX - deltaMaximum, y: minimumY - deltaMaximum };
    const b = { x: minimumX + 2 * deltaMaximum, y: minimumY - deltaMaximum };
    const c = { x: minimumX + deltaMaximum, y: minimumY + 2 * deltaMaximum };

    return {
      a: a as T,
      b: b as T,
      c: c as T,
      center: DelaunayTriangulation.calculateCircumcenter(
        a as T,
        b as T,
        c as T,
      ),
    };
  }

  private static calculateCircumcenter<T extends Vector2Like>(
    a: T,
    b: T,
    c: T,
  ): Vector2Like {
    const ab = a.x * a.x + a.y * a.y;
    const cd = b.x * b.x + b.y * b.y;
    const ef = c.x * c.x + c.y * c.y;

    const denominator =
      2 * (a.x * (c.y - b.y) + b.x * (a.y - c.y) + c.x * (b.y - a.y));

    if (Math.abs(denominator) < EPSILON) {
      return {
        x: (a.x + b.x + c.x) / TRIANGLE_VERTEX_COUNT,
        y: (a.y + b.y + c.y) / TRIANGLE_VERTEX_COUNT,
      };
    }

    const circumX =
      (ab * (c.y - b.y) + cd * (a.y - c.y) + ef * (b.y - a.y)) / denominator;
    const circumY =
      (ab * (c.x - b.x) + cd * (a.x - c.x) + ef * (b.x - a.x)) / denominator;

    return { x: circumX, y: circumY };
  }

  private static isPointInCircumcircle<T extends Vector2Like>(
    triangle: Triangle<T>,
    point: T,
  ): boolean {
    const center = triangle.center;
    const a = triangle.a;

    const circumRadius = Math.sqrt(
      (a.x - center.x) ** 2 + (a.y - center.y) ** 2,
    );

    const distance = Math.sqrt(
      (point.x - center.x) ** 2 + (point.y - center.y) ** 2,
    );

    return distance <= circumRadius;
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

  private static calculateOuterEdges<T extends Vector2Like>(
    triangles: Triangle<T>[],
  ): Map<T, [T, T]> {
    const edgeCount = new Map<string, number>();
    const edgeToTriangles = new Map<string, Triangle<T>[]>();

    const getEdgeKey = (p1: T, p2: T): string => {
      if (p1 === p2) {
        return "";
      }
      const [first, second] = p1 < p2 ? [p1, p2] : [p2, p1];
      return `${first.x},${first.y}-${second.x},${second.y}`;
    };

    for (const triangle of triangles) {
      const edges: [T, T][] = [
        [triangle.a, triangle.b],
        [triangle.b, triangle.c],
        [triangle.c, triangle.a],
      ];

      for (const [p1, p2] of edges) {
        const key = getEdgeKey(p1, p2);
        if (key) {
          edgeCount.set(key, (edgeCount.get(key) || 0) + 1);

          if (!edgeToTriangles.has(key)) {
            edgeToTriangles.set(key, []);
          }
          edgeToTriangles.get(key)?.push(triangle);
        }
      }
    }

    const outerEdgesList: [T, T][] = [];
    const outerEdgeKeys = Array.from(edgeCount.entries())
      .filter(([key, count]) => {
        void key;
        return count === 1;
      })
      .map(([key, count]) => {
        void count;
        return key;
      });

    for (const triangle of triangles) {
      const edges: [T, T][] = [
        [triangle.a, triangle.b],
        [triangle.b, triangle.c],
        [triangle.c, triangle.a],
      ];

      for (const edge of edges) {
        const key = getEdgeKey(edge[0], edge[1]);
        if (key && outerEdgeKeys.includes(key)) {
          outerEdgesList.push(edge);
        }
      }
    }

    // Build adjacency map for outer edges
    const adjacencyMap = new Map<T, T[]>();

    for (const [p1, p2] of outerEdgesList) {
      if (!adjacencyMap.has(p1)) {
        adjacencyMap.set(p1, []);
      }
      if (!adjacencyMap.has(p2)) {
        adjacencyMap.set(p2, []);
      }
      adjacencyMap.get(p1)?.push(p2);
      adjacencyMap.get(p2)?.push(p1);
    }

    // Create result map with each point mapped to its two neighbors
    const outerEdges = new Map<T, [T, T]>();

    for (const [point, neighbors] of adjacencyMap) {
      if (neighbors.length === 2) {
        outerEdges.set(point, [neighbors[0], neighbors[1]]);
      }
    }

    return outerEdges;
  }
}
