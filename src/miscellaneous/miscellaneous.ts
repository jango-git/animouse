import type { AnimationAction } from "three";

/**
 * Small epsilon value used for floating-point comparisons.
 */
export const EPSILON = 1e-6;

/**
 * Two times PI (2π), commonly used for full circle calculations.
 */
export const PI2 = Math.PI * 2;

let lastAnchorIndex = 0;

/**
 * Gets the next unique anchor index.
 * @returns The next available anchor index
 */
export function getNextAnchorIndex(): number {
  return lastAnchorIndex++;
}

/**
 * Animation anchor with timing and state information.
 */
export interface Anchor {
  /** The index of the anchor */
  index: number;
  /** The animation action */
  action: AnimationAction;
  /** The weight of the animation action */
  weight: number;
  /** The duration of the animation */
  duration: number;
  /** The inverse duration of the animation */
  invDuration: number;
  /** Whether the action plays once, so its end fires signalFinish instead of signalIterate */
  isLoopOnce: boolean;
  /** Whether the action plays at the phase of its blend tree instead of its own time */
  isSynchronized: boolean;
  /** Part of the cycle in [0, 1) added to the sync group phase before it is mapped to the clip time */
  phaseOffset: number;
}

/**
 * Returns the fractional part of a number, in [0, 1) for negative numbers too.
 */
export function fract(value: number): number {
  return value - Math.floor(value);
}
