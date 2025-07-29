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
  iterationEventType: AnimationStateEvent;
}
