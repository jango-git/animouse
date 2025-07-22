import * as assert from "uvu/assert";

export function assertEqualWithTolerance(
  actual: number,
  expected: number,
  message?: string,
): void {
  const EPSILON = 1e-10;
  assert.ok(
    Math.abs(actual - expected) < EPSILON,
    message ?? `Expected ${expected}, got ${actual}`,
  );
}
