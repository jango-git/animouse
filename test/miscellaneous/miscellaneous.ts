import * as assert from "uvu/assert";
import {
  calculateAngularDistanceForward,
  calculateNormalizedAzimuth,
  isAzimuthBetween,
} from "../../src/mescellaneous/miscellaneous";

export const EPSILON = 1e-6;
export const PI2 = Math.PI * 2;

export function assertEqualWithTolerance(
  actual: number,
  expected: number,
  message?: string,
): void {
  assert.ok(
    Math.abs(actual - expected) < EPSILON,
    message ?? `Expected ${expected}, got ${actual}`,
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
