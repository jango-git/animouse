import type { Vector2Like } from "three";
import {
  assertValidAzimuth,
  assertValidNumber,
  assertValidPositiveNumber,
} from "./assertions";
import { EPSILON, PI2 } from "./miscellaneous";

/** The number of vertices in a triangle. */
export const TRIANGLE_VERTEX_COUNT = 3;

/**
 * Precomputed triangle data for efficient operations.
 */
export interface TriangleCache {
  /** A vertex of the triangle. */
  readonly origin: Vector2Like;
  /** The circumcenter of the triangle. */
  readonly circumcenter: Vector2Like;
  /** The squared circumradius of the triangle. */
  readonly circumradiusSquared: number;
  /** Vector from vertex A to vertex B. */
  readonly u: Vector2Like;
  /** Vector from vertex A to vertex C. */
  readonly v: Vector2Like;
  /** Pseudo dot product of u with itself (u·u). */
  readonly d00: number;
  /** Pseudo dot product of u with v (u·v). */
  readonly d01: number;
  /** Pseudo dot product of v with itself (v·v). */
  readonly d11: number;
  /** Inverse of the determinant used in barycentric calculations. */
  readonly invDenom: number;
  /** Minimum bounds of the triangle's axis-aligned bounding box. */
  readonly min: Vector2Like;
  /** Maximum bounds of the triangle's axis-aligned bounding box. */
  readonly max: Vector2Like;
}

/**
 * Precomputes triangle data for efficient operations.
 * Calculates circumcenter, bounding box, and barycentric coordinate helpers.
 *
 * @param a - First vertex of the triangle
 * @param b - Second vertex of the triangle
 * @param c - Third vertex of the triangle
 * @returns Precomputed triangle data cache
 * @throws {Error} When triangle is degenerate or coordinates are invalid
 */
export function precomputeTriangle(
  a: Vector2Like,
  b: Vector2Like,
  c: Vector2Like,
): TriangleCache {
  assertValidNumber(a.x, "a.x");
  assertValidNumber(a.y, "a.y");
  assertValidNumber(b.x, "b.x");
  assertValidNumber(b.y, "b.y");
  assertValidNumber(c.x, "c.x");
  assertValidNumber(c.y, "c.y");

  const u = { x: b.x - a.x, y: b.y - a.y };
  const v = { x: c.x - a.x, y: c.y - a.y };

  const d00 = u.x * u.x + u.y * u.y;
  const d01 = u.x * v.x + u.y * v.y;
  const d11 = v.x * v.x + v.y * v.y;
  const bDet = d00 * d11 - d01 * d01;

  if (Math.abs(bDet) < EPSILON) {
    throw new Error(
      `Degenerate triangle detected: determinant is too close to zero (${bDet}). ` +
        `Triangle points are a(${a.x}, ${a.y}), b(${b.x}, ${b.y}), c(${c.x}, ${c.y}).`,
    );
  }

  const cDet = 2 * (u.x * v.y - u.y * v.x);
  const circumcenter = {
    x: a.x + (v.y * d00 - u.y * d11) / cDet,
    y: a.y + (u.x * d11 - v.x * d00) / cDet,
  };

  return {
    origin: a,
    circumcenter,
    circumradiusSquared:
      (a.x - circumcenter.x) ** 2 + (a.y - circumcenter.y) ** 2,
    u,
    v,
    d00,
    d01,
    d11,
    invDenom: 1 / bDet,
    min: {
      x: Math.min(a.x, b.x, c.x),
      y: Math.min(a.y, b.y, c.y),
    },
    max: {
      x: Math.max(a.x, b.x, c.x),
      y: Math.max(a.y, b.y, c.y),
    },
  };
}

/**
 * Calculates barycentric coordinates for a point relative to a triangle.
 * Returns undefined if the point lies outside the triangle.
 *
 * @param point - The point to calculate barycentric coordinates for
 * @param cache - Precomputed triangle data
 * @returns Barycentric weights {aW, bW, cW} if point is inside triangle, undefined otherwise
 * @throws {Error} When point coordinates or cache data are invalid
 */
export function calculateBarycentricWeights(
  point: Vector2Like,
  cache: {
    origin: Vector2Like;
    u: Vector2Like;
    v: Vector2Like;
    d00: number;
    d01: number;
    d11: number;
    invDenom: number;
    min: Vector2Like;
    max: Vector2Like;
  },
): { aW: number; bW: number; cW: number } | undefined {
  assertValidNumber(point.x, "point.x");
  assertValidNumber(point.y, "point.y");

  assertValidNumber(cache.origin.x, "cache.origin.x");
  assertValidNumber(cache.origin.y, "cache.origin.y");

  assertValidNumber(cache.min.x, "cache.min.x");
  assertValidNumber(cache.min.y, "cache.min.y");
  assertValidNumber(cache.max.x, "cache.max.x");
  assertValidNumber(cache.max.y, "cache.max.y");

  assertValidNumber(cache.u.x, "cache.u.x");
  assertValidNumber(cache.u.y, "cache.u.y");
  assertValidNumber(cache.v.x, "cache.v.x");
  assertValidNumber(cache.v.y, "cache.v.y");

  assertValidNumber(cache.d00, "cache.d00");
  assertValidNumber(cache.d01, "cache.d01");
  assertValidNumber(cache.d11, "cache.d11");

  assertValidNumber(cache.invDenom, "cache.invDenom");

  if (
    point.x < cache.min.x ||
    point.x > cache.max.x ||
    point.y < cache.min.y ||
    point.y > cache.max.y
  ) {
    return undefined;
  }

  const originToPoint = {
    x: point.x - cache.origin.x,
    y: point.y - cache.origin.y,
  };

  const d20 = originToPoint.x * cache.u.x + originToPoint.y * cache.u.y;
  const d21 = originToPoint.x * cache.v.x + originToPoint.y * cache.v.y;

  const bW = (cache.d11 * d20 - cache.d01 * d21) * cache.invDenom;
  if (bW < 0) {
    return undefined;
  }

  const cW = (cache.d00 * d21 - cache.d01 * d20) * cache.invDenom;
  if (cW < 0) {
    return undefined;
  }

  const aW = 1 - bW - cW;
  if (aW < 0) {
    return undefined;
  }

  return { aW, bW, cW };
}

/**
 * Calculates the centroid (geometric center) of a triangle.
 *
 * @param a - First vertex of the triangle
 * @param b - Second vertex of the triangle
 * @param c - Third vertex of the triangle
 * @returns The centroid point of the triangle
 * @throws {Error} When any coordinate value is invalid
 */
export function calculateTriangleCentroid(
  a: Vector2Like,
  b: Vector2Like,
  c: Vector2Like,
): Vector2Like {
  assertValidNumber(a.x, "a.x");
  assertValidNumber(a.y, "a.y");
  assertValidNumber(b.x, "b.x");
  assertValidNumber(b.y, "b.y");
  assertValidNumber(c.x, "c.x");
  assertValidNumber(c.y, "c.y");

  return {
    x: (a.x + b.x + c.x) / TRIANGLE_VERTEX_COUNT,
    y: (a.y + b.y + c.y) / TRIANGLE_VERTEX_COUNT,
  };
}

/**
 * Determines if a point is strictly inside a circle (excluding the boundary).
 * Uses squared distance comparison to avoid square root operations.
 *
 * @param origin - The center point of the circle
 * @param radiusSquared - The squared radius of the circle
 * @param point - The point to test
 * @returns True if the point is strictly inside the circle, false otherwise
 * @throws {Error} When coordinates are invalid or radius is not positive
 */
export function isPointInsideCircle(
  origin: Vector2Like,
  radiusSquared: number,
  point: Vector2Like,
): boolean {
  assertValidNumber(origin.x, "origin.x");
  assertValidNumber(origin.y, "origin.y");
  assertValidPositiveNumber(radiusSquared, "radiusSquared");
  assertValidNumber(point.x, "point.x");
  assertValidNumber(point.y, "point.y");

  return (
    (point.x - origin.x) ** 2 + (point.y - origin.y) ** 2 <
    radiusSquared - EPSILON
  );
}

/**
 * Normalizes an azimuth angle to the range [0, 2π).
 *
 * @param azimuth - The azimuth angle in radians
 * @returns The normalized azimuth in the range [0, 2π) radians
 * @throws {Error} When the azimuth value is not a valid number
 */
export function calculateNormalizedAzimuth(azimuth: number): number {
  assertValidNumber(azimuth, "Azimuth for normalization");

  const result = azimuth % PI2;
  return result < 0 ? result + PI2 : result;
}

/**
 * Calculates the forward angular distance between two azimuth angles.
 * Always measures distance in the positive direction.
 *
 * @param from - The starting azimuth angle in radians (normalized to [0, 2π))
 * @param to - The target azimuth angle in radians (normalized to [0, 2π))
 * @returns The forward angular distance in radians [0, 2π)
 * @throws {Error} When either azimuth value is invalid
 */
export function calculateAngularDistanceForward(
  from: number,
  to: number,
): number {
  assertValidAzimuth(from, "Azimuth 'from'");
  assertValidAzimuth(to, "Azimuth 'to'");

  const delta = to - from;
  return delta >= 0 ? delta : delta + PI2;
}

/**
 * Determines if an azimuth angle falls within a specified angular range.
 * Handles ranges that wrap around the 0/2π boundary.
 *
 * @param value - The azimuth angle to test in radians (normalized to [0, 2π))
 * @param from - The start of the angular range in radians (normalized to [0, 2π))
 * @param to - The end of the angular range in radians (normalized to [0, 2π))
 * @returns True if the azimuth is within the range (inclusive), false otherwise
 * @throws {Error} When any azimuth value is invalid
 */
export function isAzimuthBetween(
  value: number,
  from: number,
  to: number,
): boolean {
  assertValidAzimuth(value, "Azimuth value");
  assertValidAzimuth(from, "Azimuth 'from'");
  assertValidAzimuth(to, "Azimuth 'to'");

  return from <= to
    ? value >= from && value <= to
    : value >= from || value <= to;
}

/**
 * Calculates the squared Euclidean distance between two points.
 * Uses squared distance to avoid square root operation.
 *
 * @param x1 - X coordinate of the first point
 * @param y1 - Y coordinate of the first point
 * @param x2 - X coordinate of the second point
 * @param y2 - Y coordinate of the second point
 * @returns The squared distance between the two points
 * @throws {Error} When any coordinate value is invalid
 */
export function calculateDistanceSquared(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  assertValidNumber(x1, "Coordinate 'x1'");
  assertValidNumber(y1, "Coordinate 'y1'");
  assertValidNumber(x2, "Coordinate 'x2'");
  assertValidNumber(y2, "Coordinate 'y2'");

  return (x2 - x1) ** 2 + (y2 - y1) ** 2;
}

/**
 * Calculates the squared distance from a point to a line segment.
 * Projects the point onto the line segment and clamps to segment boundaries.
 *
 * @param edge - A tuple containing the two endpoints of the edge
 * @param x - X coordinate of the point
 * @param y - Y coordinate of the point
 * @returns The squared distance from the point to the closest point on the edge
 * @throws {Error} When any coordinate value is invalid
 */
export function calculateDistanceToEdgeSquared(
  [p1, p2]: [Vector2Like, Vector2Like],
  x: number,
  y: number,
): number {
  assertValidNumber(p1.x, "Coordinate 'p1.x'");
  assertValidNumber(p1.y, "Coordinate 'p1.y'");
  assertValidNumber(p2.x, "Coordinate 'p2.x'");
  assertValidNumber(p2.y, "Coordinate 'p2.y'");
  assertValidNumber(x, "Coordinate 'x'");
  assertValidNumber(y, "Coordinate 'y'");

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const t = ((x - p1.x) * dx + (y - p1.y) * dy) / (dx * dx + dy * dy);
  const clampedT = t <= 0 ? 0 : t >= 1 ? 1 : t;

  const deltaX = x - (p1.x + clampedT * dx);
  const deltaY = y - (p1.y + clampedT * dy);

  return deltaX ** 2 + deltaY ** 2;
}
