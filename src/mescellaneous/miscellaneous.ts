import type { AnimationAction } from "three";
import type { AnimationStateEvent } from "./AnimationStateEvent";

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
  /** The iteration event type for this anchor */
  iterationEventType: AnimationStateEvent;
}
