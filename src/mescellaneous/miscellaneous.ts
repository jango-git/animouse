import type { AnimationAction, Vector2Like } from "three";
import type { StateEvent } from "./AnimationStateEvent";

/**
 * Two times PI (2π), commonly used for full circle calculations.
 */
export const PI2 = Math.PI * 2;

/**
 * Small epsilon value used for floating-point comparisons.
 */
export const EPSILON = 1e-6;

export interface Anchor {
  action: AnimationAction;
  weight: number;
  previousTime: number;
  duration: number;
  hasFiredIterationEvent: boolean;
  iterationEventType: StateEvent;
}

/**
 * Normalizes an azimuth angle to the range [0, 2π).
 *
 * @param azimuth - The azimuth angle in radians
 * @returns The normalized azimuth in the range [0, 2π)
 */
export function calculateNormalizedAzimuth(azimuth: number): number {
  azimuth = azimuth % PI2;
  if (azimuth < 0) {
    azimuth += PI2;
  }
  return azimuth;
}

/**
 * Calculates the shortest angular distance between two azimuth angles.
 *
 * @param from - The starting azimuth angle in radians
 * @param to - The ending azimuth angle in radians
 * @returns The shortest angular distance between the angles, in range [0, π]
 */
export function calculateAngularDistance(from: number, to: number): number {
  const delta = Math.abs(to - from);
  return Math.min(delta, PI2 - delta);
}

/**
 * Determines if an azimuth angle falls within a specified angular range.
 * Handles ranges that wrap around the 0/2π boundary.
 *
 * @param azimuth - The azimuth angle to test, in radians
 * @param rangeStart - The start of the angular range, in radians
 * @param rangeEnd - The end of the angular range, in radians
 * @returns True if the azimuth is within the range, false otherwise
 */
export function isAzimuthBetween(
  azimuth: number,
  rangeStart: number,
  rangeEnd: number,
): boolean {
  if (rangeStart <= rangeEnd) {
    return azimuth >= rangeStart && azimuth <= rangeEnd;
  }

  return azimuth >= rangeStart || azimuth <= rangeEnd;
}

/**
 * Calculates the squared Euclidean distance between two points.
 * Using squared distance avoids the expensive square root operation.
 *
 * @param x1 - X coordinate of the first point
 * @param y1 - Y coordinate of the first point
 * @param x2 - X coordinate of the second point
 * @param y2 - Y coordinate of the second point
 * @returns The squared distance between the two points
 */
export function calculateDistanceSquared(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2;
}

/**
 * Calculates the squared distance from a point to a line segment (edge).
 * This function assumes the edge has non-zero length.
 *
 * @param edge - A tuple containing the two endpoints of the edge
 * @param x - X coordinate of the point
 * @param y - Y coordinate of the point
 * @returns The squared distance from the point to the closest point on the edge
 */
export function calculateDistanceToEdgeSquared(
  [p1, p2]: [Vector2Like, Vector2Like],
  x: number,
  y: number,
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const t = ((x - p1.x) * dx + (y - p1.y) * dy) / (dx * dx + dy * dy);
  const clampedT = t <= 0 ? 0 : t >= 1 ? 1 : t;

  const deltaX = x - (p1.x + clampedT * dx);
  const deltaY = y - (p1.y + clampedT * dy);

  return deltaX ** 2 + deltaY ** 2;
}
