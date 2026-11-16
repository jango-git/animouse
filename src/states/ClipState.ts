import type { AnimationAction } from "three";

import { buildAnchor } from "../miscellaneous/buildAnchor.js";
import type { Anchor } from "../miscellaneous/miscellaneous.js";
import type { SyncOptions, TimeEventCallback } from "./AnimationState.js";
import { AnimationState } from "./AnimationState.js";

/**
 * Animation state that wraps a single Three.js AnimationAction.
 * Manages playback, weight control, and iteration events for a single animation clip.
 *
 * Detects animation completion and restart events, emitting appropriate
 * state events based on the animation's loop type.
 */
export class ClipState extends AnimationState {
  /**
   * Internal anchor that wraps the AnimationAction with additional tracking data.
   */
  private readonly anchor: Anchor;

  /**
   * Creates a new ClipState from a Three.js AnimationAction.
   * Initializes the animation to a stopped state and configures iteration events
   * based on the animation's loop type.
   *
   * @param animationAction - The Three.js AnimationAction to wrap
   * @param options - How the action follows the phase of the sync group. It plays at its own
   *                  time by default.
   * @throws {Error} When the animation clip duration is not a positive finite number
   * @throws {Error} When the phase offset is not a finite number
   * @throws {Error} When a synchronized action does not use LoopRepeat
   */
  constructor(animationAction: AnimationAction, options: SyncOptions = {}) {
    super();
    this.anchor = buildAnchor(
      animationAction,
      options.isSynchronized ?? false,
      options.phaseOffset ?? 0,
    );
    this.updateAnchorWeight(this.anchor, 1);
  }

  /**
   * Registers a callback to be called when the animation reaches a specific time.
   * The callback will be invoked every time the animation crosses the specified time threshold.
   *
   * @param unitTime - Time in unit range [0, 1] when the callback should be invoked
   * @param callback - Function to call when the time event occurs, receives the action and state as parameters
   */
  public onTimeEvent(unitTime: number, callback: TimeEventCallback): void {
    this.onTimeEventInternal(this.anchor, unitTime, callback, false);
  }

  /**
   * Registers a callback to be called once when the animation reaches a specific time.
   * The callback will be invoked only the first time the animation crosses the specified time threshold.
   *
   * @param unitTime - Time in unit range [0, 1] when the callback should be invoked
   * @param callback - Function to call when the time event occurs, receives the action and state as parameters
   */
  public onceTimeEvent(unitTime: number, callback: TimeEventCallback): void {
    this.onTimeEventInternal(this.anchor, unitTime, callback, true);
  }

  /**
   * Removes a previously registered time event callback.
   * Unregisters the callback from the specified time point and cleans up associated resources.
   *
   * @param unitTime - Time in unit range [0, 1] where the callback was registered
   * @param callback - The callback function to remove
   */
  public offTimeEvent(unitTime: number, callback: TimeEventCallback): void {
    this.offTimeEventInternal(this.anchor, unitTime, callback);
  }
}
