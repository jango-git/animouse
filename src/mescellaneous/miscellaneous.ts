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
 * Gets the next unique anchor index for animation anchors.
 * Each call returns an incrementing integer starting from 0.
 * @returns The next available anchor index
 */
export function getNextAnchorIndex(): number {
  return lastAnchorIndex++;
}

/**
 * Represents an animation anchor with timing and state information.
 */
export interface Anchor {
  /** The index of the anchor */
  index: number;
  /** The animation action associated with this anchor */
  action: AnimationAction;
  /** The weight of the animation action */
  weight: number;
  /** The duration of the animation */
  duration: number;
  /** The inverse duration of the animation */
  invDuration: number;
  /** The type of iteration event associated with this anchor */
  iterationEventType: AnimationStateEvent;
}
