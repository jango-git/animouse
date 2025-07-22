import * as assert from "uvu/assert";

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

export function lerpWeights(
  value: number,
  left: number,
  right: number,
): [number, number] {
  if (left >= right) {
    throw new Error("Left must be less than right");
  }

  const weight = (value - left) / (right - left);
  const inverseWeight = 1 - weight;
  return [inverseWeight, weight];
}

export function getAngularDistanceForward(from: number, to: number): number {
  const delta = to - from;
  return delta >= 0 ? delta : delta + PI2;
}

export function normalizeAzimuth(azimuth: number): number {
  azimuth = azimuth % PI2;
  if (azimuth < 0) {
    azimuth += PI2;
  }
  return azimuth;
}

export function isAzimuthBetween(
  azimuth: number,
  from: number,
  to: number,
): boolean {
  return from <= to
    ? azimuth >= from && azimuth <= to
    : azimuth >= from || azimuth <= to;
}

export function lerpAngularWeightsForward(
  value: number,
  left: number,
  right: number,
): [number, number] {
  const lNormalized = normalizeAzimuth(left);
  const rNormalized = normalizeAzimuth(right);
  const vNormalized = normalizeAzimuth(value);

  if (lNormalized <= rNormalized) {
    const weight = (vNormalized - lNormalized) / (rNormalized - lNormalized);
    const inverseWeight = 1 - weight;
    return [inverseWeight, weight];
  } else {
    const weight = (vNormalized - lNormalized) / (rNormalized - lNormalized);
    const inverseWeight = 1 - weight;
    return [inverseWeight, weight];
  }

  // const range = (r - l + PI2) % PI2;
  // if (range === 0) {
  //   throw new Error("Left and right azimuths must not be equal (mod 2π)");
  // }
  // const offset = (v - l + PI2) % PI2;
  // const weight = offset / range;
  // return [1 - weight, weight];
}
