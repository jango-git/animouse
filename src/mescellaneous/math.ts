import type { Vector2Like } from "three";
import {
  assertValidNumber,
  assertValidPositiveNumber,
  EPSILON,
} from "./assertions";

/**
 * Precomputed data for efficient triangle operations.
 */
export interface TriangleCache {
  /** The circumcenter of the triangle */
  circumcenter: Vector2Like;
  /** The squared circumradius of the triangle */
  circumradiusSquared: number;
  /** Vector from vertex A to vertex B */
  u: Vector2Like;
  /** Vector from vertex A to vertex C */
  v: Vector2Like;
  /** Pseudo dot product of u with itself (u·u) */
  d00: number;
  /** Pseudo dot product of u with v (u·v) */
  d01: number;
  /** Pseudo dot product of v with itself (v·v) */
  d11: number;
  /** Inverse of the determinant used in barycentric calculations */
  invDenom: number;
  /** Minimum bounds of the triangle's axis-aligned bounding box */
  min: Vector2Like;
  /** Maximum bounds of the triangle's axis-aligned bounding box */
  max: Vector2Like;
}

/**
 * Precomputes triangle data for efficient subsequent operations.
 *
 * @param a - First vertex of the triangle
 * @param b - Second vertex of the triangle
 * @param c - Third vertex of the triangle
 * @returns Precomputed triangle data cache
 * @throws {Error} When triangle is degenerate or coordinates are invalid
 * @see {@link assertValidNumber}
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
  const det = d00 * d11 - d01 * d01;

  if (Math.abs(det) < EPSILON) {
    throw new Error(
      `Degenerate triangle detected: determinant is too close to zero (${det}). ` +
        `Triangle points are a(${a.x}, ${a.y}), b(${b.x}, ${b.y}), c(${c.x}, ${c.y}).`,
    );
  }

  const d = 2 * (u.x * v.y - u.y * v.x);
  const circumcenter = {
    x: a.x + (v.y * d00 - u.y * d11) / d,
    y: a.y + (u.x * d11 - v.x * d00) / d,
  };

  return {
    circumcenter,
    circumradiusSquared:
      (a.x - circumcenter.x) ** 2 + (a.y - circumcenter.y) ** 2,
    u,
    v,
    d00,
    d01,
    d11,
    invDenom: 1 / det,
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
 *
 * @param point - The point to calculate barycentric coordinates for
 * @param a - The first vertex of the triangle
 * @param cache - Precomputed triangle data
 * @returns Barycentric weights {u, v, w} if point is inside triangle, undefined otherwise
 * @see {@link assertValidNumber}
 */
export function calculateBarycentricWeights(
  point: Vector2Like,
  a: Vector2Like,
  cache: {
    u: Vector2Like;
    v: Vector2Like;
    d00: number;
    d01: number;
    d11: number;
    invDenom: number;
    min: Vector2Like;
    max: Vector2Like;
  },
): { u: number; v: number; w: number } | undefined {
  assertValidNumber(point.x, "point.x");
  assertValidNumber(point.y, "point.y");

  assertValidNumber(a.x, "a.x");
  assertValidNumber(a.y, "a.y");

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

  const aToPoint = { x: point.x - a.x, y: point.y - a.y };

  const d20 = aToPoint.x * cache.u.x + aToPoint.y * cache.u.y;
  const d21 = aToPoint.x * cache.v.x + aToPoint.y * cache.v.y;

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

  return { u: aW, v: bW, w: cW };
}

/**
 * Determines if a point is strictly inside a circle (excluding the boundary).
 *
 * @param origin - The center point of the circle
 * @param radiusSquared - The squared radius of the circle
 * @param point - The point to test
 * @returns True if the point is strictly inside the circle
 * @see {@link assertValidNumber}
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
