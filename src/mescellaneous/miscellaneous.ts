import type { AnimationAction, Vector2Like } from "three";
import type { StateEvent } from "./AnimationStateEvent";
import { assertValidAzimuth, assertValidNumber } from "./assertions";

/**
 * Two times PI (2π), commonly used for full circle calculations.
 */
export const PI2 = Math.PI * 2;

/**
 * Small epsilon value used for floating-point comparisons.
 */
export const EPSILON = 1e-6;

/**
 * Represents an animation anchor with timing and state information.
 */
export interface Anchor {
  /** The animation action associated with this anchor */
  action: AnimationAction;
  /** The weight of the animation action */
  weight: number;
  /** The previous time value for animation timing */
  previousTime: number;
  /** The duration of the animation */
  duration: number;
  /** Whether an iteration event has been fired for this anchor */
  hasFiredIterationEvent: boolean;
  /** The type of iteration event associated with this anchor */
  iterationEventType: StateEvent;
}

/**
 * Normalizes an azimuth angle to the range [0, 2π).
 *
 * @param value - The azimuth angle in radians
 * @returns The normalized azimuth in the range [0, 2π)
 * @throws {Error} When the value is not a valid azimuth angle
 * @see {@link assertValidAzimuth} for validation details
 */
export function calculateNormalizedAzimuth(value: number): number {
  assertValidAzimuth(value, "Invalid azimuth for normalization");

  const azimuth = value % (2 * Math.PI);
  return azimuth < 0 ? azimuth + 2 * Math.PI : azimuth;
}

/**
 * Calculates the forward angular distance between two azimuth angles.
 * Always measures distance in the positive direction, even if shorter path exists backward.
 *
 * @param from - The starting azimuth angle in radians
 * @param to - The target azimuth angle in radians
 * @returns The forward angular distance in radians
 * @throws {Error} When either azimuth value is invalid
 * @see {@link assertValidAzimuth} for validation details
 */
export function calculateAngularDistanceForward(
  from: number,
  to: number,
): number {
  assertValidAzimuth(from, "Invalid 'from' azimuth");
  assertValidAzimuth(to, "Invalid 'to' azimuth");

  const delta = to - from;
  return delta >= 0 ? delta : delta + 2 * Math.PI;
}

/**
 * Determines if an azimuth angle falls within a specified angular range.
 * Handles ranges that wrap around the 0/2π boundary.
 *
 * @param value - The azimuth angle to test, in radians
 * @param from - The start of the angular range, in radians
 * @param to - The end of the angular range, in radians
 * @returns True if the azimuth is within the range, false otherwise
 * @throws {Error} When any azimuth value is invalid
 * @see {@link assertValidAzimuth} for validation details
 */
export function isAzimuthBetween(
  value: number,
  from: number,
  to: number,
): boolean {
  assertValidAzimuth(value, "Invalid azimuth value");
  assertValidAzimuth(from, "Invalid 'from' azimuth");
  assertValidAzimuth(to, "Invalid 'to' azimuth");

  return from <= to
    ? value >= from && value <= to
    : value >= from || value <= to;
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
 * @throws {Error} When any coordinate value is invalid
 * @see {@link assertValidNumber} for validation details
 */
export function calculateDistanceSquared(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  assertValidNumber(x1, "Invalid x1 coordinate");
  assertValidNumber(y1, "Invalid y1 coordinate");
  assertValidNumber(x2, "Invalid x2 coordinate");
  assertValidNumber(y2, "Invalid y2 coordinate");

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
 * @throws {Error} When any coordinate value is invalid
 * @see {@link assertValidNumber} for validation details
 */
export function calculateDistanceToEdgeSquared(
  [p1, p2]: [Vector2Like, Vector2Like],
  x: number,
  y: number,
): number {
  assertValidNumber(p1.x, "Invalid p1.x coordinate");
  assertValidNumber(p1.y, "Invalid p1.y coordinate");
  assertValidNumber(p2.x, "Invalid p2.x coordinate");
  assertValidNumber(p2.y, "Invalid p2.y coordinate");
  assertValidNumber(x, "Invalid x coordinate");
  assertValidNumber(y, "Invalid y coordinate");

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const t = ((x - p1.x) * dx + (y - p1.y) * dy) / (dx * dx + dy * dy);
  const clampedT = t <= 0 ? 0 : t >= 1 ? 1 : t;

  const deltaX = x - (p1.x + clampedT * dx);
  const deltaY = y - (p1.y + clampedT * dy);

  return deltaX ** 2 + deltaY ** 2;
}
