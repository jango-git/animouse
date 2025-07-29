import type { Vector2Like } from "three";
import * as assert from "uvu/assert";
import {
  calculateAngularDistanceForward,
  calculateNormalizedAzimuth,
  isAzimuthBetween,
} from "../../src/mescellaneous/math";

export const EPSILON = 1e-6;
export const PI2 = Math.PI * 2;

export function assertEqualWithTolerance(
  actual: number,
  expected: number,
  subject: string,
): void {
  assert.ok(
    Math.abs(actual - expected) < EPSILON,
    `${subject}: expected ${expected}, got ${actual}`,
  );
}

export function lerpLinear(
  value: number,
  from: number,
  to: number,
): [number, number] {
  const weight = (value - from) / (to - from);
  const inverseWeight = 1 - weight;
  return [inverseWeight, weight];
}

export function lerpAngular(
  value: number,
  from: number,
  to: number,
): [number, number] {
  const vNormalized = calculateNormalizedAzimuth(value);
  const lNormalized = calculateNormalizedAzimuth(from);
  const rNormalized = calculateNormalizedAzimuth(to);

  if (isAzimuthBetween(vNormalized, lNormalized, rNormalized)) {
    const distance = calculateAngularDistanceForward(lNormalized, rNormalized);
    const lDistance = calculateAngularDistanceForward(lNormalized, vNormalized);

    const weight = lDistance / distance;
    const inverseWeight = 1 - weight;
    return [inverseWeight, weight];
  } else {
    const distance = calculateAngularDistanceForward(rNormalized, lNormalized);
    const lDistance = calculateAngularDistanceForward(rNormalized, vNormalized);

    const weight = lDistance / distance;
    const inverseWeight = 1 - weight;
    return [weight, inverseWeight];
  }
}

export function isPointInTriangle(
  point: Vector2Like,
  a: Vector2Like,
  b: Vector2Like,
  c: Vector2Like,
): boolean {
  const signedArea = (
    v0: Vector2Like,
    v1: Vector2Like,
    v2: Vector2Like,
  ): number => (v1.x - v0.x) * (v2.y - v0.y) - (v2.x - v0.x) * (v1.y - v0.y);

  const areaABC = signedArea(a, b, c);
  const w1 = signedArea(point, b, c) / areaABC;
  const w2 = signedArea(point, c, a) / areaABC;
  const w3 = signedArea(point, a, b) / areaABC;

  return w1 >= 0 && w2 >= 0 && w3 >= 0;
}

export function lerpBarycentric(
  point: Vector2Like,
  a: Vector2Like,
  b: Vector2Like,
  c: Vector2Like,
): [number, number, number] {
  const edgeClosestPoint = (v0: Vector2Like, v1: Vector2Like): Vector2Like => {
    const dx = v1.x - v0.x;
    const dy = v1.y - v0.y;
    const l2 = dx * dx + dy * dy;
    const t = ((point.x - v0.x) * dx + (point.y - v0.y) * dy) / l2;
    const clampedT = Math.max(0, Math.min(1, t));
    return {
      x: v0.x + clampedT * dx,
      y: v0.y + clampedT * dy,
    };
  };

  const signedArea = (
    v0: Vector2Like,
    v1: Vector2Like,
    v2: Vector2Like,
  ): number => (v1.x - v0.x) * (v2.y - v0.y) - (v2.x - v0.x) * (v1.y - v0.y);

  const areaABC = signedArea(a, b, c);
  const w1 = signedArea(point, b, c) / areaABC;
  const w2 = signedArea(point, c, a) / areaABC;
  const w3 = signedArea(point, a, b) / areaABC;

  const inside = isPointInTriangle(point, a, b, c);

  if (inside) {
    return [w1, w2, w3];
  } else {
    const candidates = [
      edgeClosestPoint(a, b),
      edgeClosestPoint(b, c),
      edgeClosestPoint(c, a),
    ];

    let minDist2 = Infinity;
    let closest: Vector2Like = candidates[0];
    for (const pt of candidates) {
      const dx = pt.x - point.x;
      const dy = pt.y - point.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < minDist2) {
        minDist2 = dist2;
        closest = pt;
      }
    }

    const w1c = signedArea(closest, b, c) / areaABC;
    const w2c = signedArea(closest, c, a) / areaABC;
    const w3c = signedArea(closest, a, b) / areaABC;

    return [w1c, w2c, w3c];
  }
}
