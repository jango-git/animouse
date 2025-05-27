import type { AnimationAction } from "three";
import { MathUtils } from "three";
import { AnimationState } from "./AnimationState";
import { AnimationStateEvent } from "./AnimationStateEvent";
import { powerSymbol, updateSymbol } from "./symbols";

/**
 * Represents a simple animation state that controls a single animation with a power value.
 * This class manages animations that only require a single weight parameter (0D control).
 * Useful for basic animations like jumping, attacking, or any non-directional action.
 *
 * Key features:
 * - Controls a single THREE.js AnimationAction
 * - Manages animation weight/power from 0 to 1
 * - Tracks animation progress and loop iterations
 * - Emits lifecycle events (enter, exit, iteration)
 *
 * @class AnimationState0D
 * @extends {AnimationState}
 * @see {@link AnimationState} For base class documentation
 * @see {@link AnimationStateEvent} For emitted events
 *
 * @example
 * ```typescript
 * // Create a basic jump animation state
 * const jumpAction = mixer.clipAction(jumpClip);
 * const jumpState = new AnimationState0D(jumpAction);
 *
 * // Add to state machine
 * const machine = new AnimationStateMachine(idleState, mixer);
 * machine.addEventTransition("jump", {
 *   to: jumpState,
 *   duration: 0.2
 * });
 * ```
 */
export class AnimationState0D extends AnimationState {
  private readonly action: AnimationAction;
  private readonly clipDuration: number;

  private hasEmittedIterationEvent = false;
  private previousTime = 0;
  private powerInternal = 0;

  /**
   * Creates an instance of AnimationState0D.
   * Initializes the animation action with zero weight and prepares it for playback control.
   *
   * @param {AnimationAction} action - The THREE.js animation action to control.
   *                                  Must be created from an AnimationMixer via clipAction().
   * @throws {Error} If the action is not properly initialized with an AnimationClip
   */
  constructor(action: AnimationAction) {
    super();
    this.action = action;
    this.action.weight = 0;
    this.clipDuration = action.getClip().duration;
  }

  /**
   * Gets the current progress of the animation from start to end.
   * Progress is calculated as the current time divided by total duration,
   * clamped between 0 and 1.
   *
   * @returns {number} A value between 0 (start) and 1 (end) representing the animation's progress
   * @example
   * ```typescript
   * if (state.progress >= 0.5) {
   *   // Animation is at least halfway complete
   * }
   * ```
   */
  public get progress(): number {
    return MathUtils.clamp(this.action.time / this.clipDuration, 0, 1);
  }

  /**
   * Gets the current power/weight of the animation.
   * Power determines how strongly this animation influences the final pose,
   * where 0 means no influence and 1 means full influence.
   *
   * @returns {number} The current power value between 0 and 1
   * @see [powerSymbol] For setting the power value
   */
  public get power(): number {
    return this.powerInternal;
  }

  /**
   * Sets the power/weight of the animation.
   * This is an internal method that should only be called by AnimationStateMachine.
   * It handles:
   * - Starting/stopping the animation when power changes between 0 and positive
   * - Emitting ENTER/EXIT events on state changes
   * - Updating the animation's weight to match the power value
   * - Resetting animation time when stopped
   *
   * @internal
   * @param {number} value - The desired power value (will be clamped between 0 and 1)
   * @emits {AnimationStateEvent.ENTER} When power changes from 0 to positive
   * @emits {AnimationStateEvent.EXIT} When power changes from positive to 0
   */
  public set [powerSymbol](value: number) {
    if (this.powerInternal !== value) {
      if (this.powerInternal === 0 && value > 0) {
        this.action.play();
        this.emit(AnimationStateEvent.ACTIVATED, this);
      } else if (this.powerInternal > 0 && value === 0) {
        this.action.stop();
        this.emit(AnimationStateEvent.DEACTIVATED, this);

        this.previousTime = 0;
        this.action.time = 0;
      }

      this.powerInternal = MathUtils.clamp(value, 0, 1);
      this.action.weight = this.powerInternal;
    }
  }

  /**
   * Updates the animation state.
   * This is an internal method that should only be called by AnimationStateMachine.
   * It handles:
   * - Detecting when animations complete an iteration
   * - Emitting ITERATION events at appropriate times
   * - Tracking animation playback time
   *
   * An iteration is detected when either:
   * - The animation time decreases (loop back to start)
   * - The animation reaches its full duration
   *
   * @internal
   * @emits {AnimationStateEvent.ITERATION} When an animation completes one full play cycle
   */
  public [updateSymbol](): void {
    const currentTime = this.action.time;

    if (
      currentTime < this.previousTime ||
      (currentTime >= this.clipDuration && !this.hasEmittedIterationEvent)
    ) {
      this.emit(AnimationStateEvent.ITERATION, this);
      this.hasEmittedIterationEvent = true;
    } else if (currentTime < this.clipDuration) {
      this.hasEmittedIterationEvent = false;
    }

    this.previousTime = currentTime;
  }
}
