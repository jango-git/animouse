import type { AnimationAction } from "three";
import { MathUtils } from "three";
import { AnimationState } from "./AnimationState";
import { AnimationStateEvent } from "./AnimationStateEvent";
import { powerSymbol, updateSymbol } from "./symbols";

const MIN_ACTION_COUNT = 2;

/**
 * Represents an animation action and its corresponding value in the 1D animation space.
 * Used to define animation keyframes along a continuous parameter range.
 *
 * @interface State1Action
 * @example
 * ```typescript
 * const actions: State1Action[] = [
 *   { action: mixer.clipAction(walkClip), value: 0 },   // Slow walk
 *   { action: mixer.clipAction(jogClip), value: 0.5 },  // Medium jog
 *   { action: mixer.clipAction(runClip), value: 1 }     // Fast run
 * ];
 * ```
 */
export interface State1Action {
  action: AnimationAction;
  value: number;
}

interface Anchor {
  action: AnimationAction;
  value: number;

  duration: number;
  previousTime: number;
}

/**
 * Manages a one-dimensional blend space between multiple animations.
 * This class controls animations arranged along a single axis, automatically blending
 * between adjacent animations based on a parameter value.
 * Useful for animations that vary based on a single parameter like speed, power, or health.
 *
 * Key features:
 * - Manages multiple animations along a continuous parameter range
 * - Automatically blends between adjacent animations
 * - Maintains consistent total animation weight
 * - Normalizes input range to 0-1 for consistent control
 *
 * @class AnimationState1D
 * @extends {AnimationState}
 * @see {@link AnimationState} For base class documentation
 * @see {@link AnimationStateEvent} For emitted events
 * @example
 * ```typescript
 * // Create a speed-based locomotion system
 * const state1D = new AnimationState1D([
 *   { action: mixer.clipAction(idleClip), value: 0 },
 *   { action: mixer.clipAction(walkClip), value: 0.5 },
 *   { action: mixer.clipAction(runClip), value: 1 }
 * ]);
 *
 * // Update based on character speed
 * state1D.setBlend(characterSpeed / maxSpeed);
 * ```
 */
export class AnimationState1D extends AnimationState {
  private readonly anchors: Anchor[] = [];
  private mostActiveAction: Anchor;
  private hasEmittedIterationEvent = false;
  private powerInternal = 0;
  private blend = 0;

  /**
   * Creates an instance of AnimationState1D.
   * The actions will be sorted by their value to create a continuous 1D blend space.
   * Values will be normalized so the first action is at 0 and the last at 1.
   * Intermediate values will maintain their relative spacing.
   *
   * @param {State1Action[]} actions - Array of animation actions and their positions in the 1D space.
   * Must contain at least 2 actions to enable blending.
   * All actions should be from the same {@link AnimationMixer}.
   * @throws {Error} If less than 2 actions are provided
   * @example
   * ```typescript
   * // Create a 3-point blend space
   * const walk = mixer.clipAction(walkClip);
   * const jog = mixer.clipAction(jogClip);
   * const run = mixer.clipAction(runClip);
   *
   * const locomotion = new AnimationState1D([
   *   { action: walk, value: 0 },   // Maps to normalized 0
   *   { action: jog, value: 5 },    // Maps to normalized ~0.5
   *   { action: run, value: 10 }    // Maps to normalized 1
   * ]);
   * ```
   */
  constructor(actions: State1Action[]) {
    super();
    if (actions.length < MIN_ACTION_COUNT) {
      throw new Error("Need at least 2 actions");
    }

    for (const action of actions) {
      this.anchors.push({
        action: action.action,
        value: action.value,
        duration: action.action.getClip().duration,
        previousTime: 0,
      });
      action.action.time = 0;
      action.action.weight = 0;
    }

    this.anchors.sort((a, b) => a.value - b.value);

    const first = this.anchors[0];
    const last = this.anchors[this.anchors.length - 1];

    first.value = 0;
    last.value = 1;

    this.mostActiveAction = first;
  }

  public get progress(): number {
    return MathUtils.clamp(
      this.mostActiveAction.action.time / this.mostActiveAction.duration,
      0,
      1,
    );
  }

  /**
   * Gets the current power level of all animations in the blend space.
   * A power of 0 means all animations are stopped, while 1 means full strength.
   *
   * @returns {number} The current power value between 0 and 1
   */
  public get power(): number {
    return this.powerInternal;
  }

  /**
   * Sets the power level of all animations in the blend space.
   * When power changes from 0 to positive, relevant animations start playing.
   * When power changes from positive to 0, all animations stop.
   *
   * @param {number} value - The desired power value (will be clamped between 0 and 1)
   * @emits {AnimationStateEvent.ENTER} When power changes from 0 to positive
   * @emits {AnimationStateEvent.EXIT} When power changes from positive to 0
   */
  public set [powerSymbol](value: number) {
    const clampedValue = MathUtils.clamp(value, 0, 1);

    if (this.powerInternal !== clampedValue) {
      if (this.powerInternal === 0 && clampedValue > 0) {
        this.emit(AnimationStateEvent.ENTER, this);
      } else if (this.powerInternal > 0 && clampedValue === 0) {
        this.emit(AnimationStateEvent.EXIT, this);
      }

      this.powerInternal = clampedValue;
      this.updateAnimationActions();
    }
  }

  /**
   * Sets the current position in the 1D blend space.
   * This determines which animations are active and how they are blended.
   * The value is automatically clamped between 0 and 1.
   *
   * When the value is exactly at an action's position, only that action plays.
   * When between two actions, they are smoothly blended based on the relative distance.
   *
   * @param {number} value - The position in the blend space (0 to 1)
   * @example
   * ```typescript
   * // Play first animation only
   * state1D.setBlend(0);
   *
   * // Blend evenly between first two animations
   * state1D.setBlend(0.25);
   *
   * // Play last animation only
   * state1D.setBlend(1);
   * ```
   */
  public setBlend(value: number): void {
    this.blend = MathUtils.clamp(value, 0, 1);
    this.updateAnimationActions();
  }

  public [updateSymbol](): void {
    const action = this.mostActiveAction.action;
    const currentTime = action.time;
    const previousTime = this.mostActiveAction.previousTime;
    const duration = this.mostActiveAction.duration;

    if (
      currentTime < previousTime ||
      (currentTime >= duration && !this.hasEmittedIterationEvent)
    ) {
      this.emit(AnimationStateEvent.ITERATION, this);
      this.hasEmittedIterationEvent = true;
    } else if (currentTime < duration) {
      this.hasEmittedIterationEvent = false;
    }

    this.mostActiveAction.previousTime = currentTime;
  }

  private updateAnimationActions(): void {
    for (let i = 0; i < this.anchors.length - 1; i++) {
      const left = this.anchors[i];
      const right = this.anchors[i + 1];

      if (this.blend < left.value) {
        this.updateAnimationAction(right, 0);
      } else if (this.blend > right.value) {
        this.updateAnimationAction(left, 0);
      } else {
        const difference =
          (this.blend - left.value) / (right.value - left.value);
        this.updateAnimationAction(left, (1 - difference) * this.powerInternal);
        this.updateAnimationAction(right, difference * this.powerInternal);
      }
    }

    this.mostActiveAction = this.anchors.reduce((p, c) =>
      p.action.weight > c.action.weight ? p : c,
    );
  }

  /**
   * Updates the weight of a single animation anchor's action based on the specified weight.
   * Starts the animation if the weight transitions from zero to positive.
   * Stops and resets the animation if the weight transitions from positive to zero.
   *
   * @param {Anchor} anchor - The animation anchor containing the action to update
   * @param {number} weight - The new weight to assign to the animation action
   * @private
   */
  /**
   * Updates the weight of a single animation anchor's action based on the specified weight.
   * Handles the mechanics of starting/stopping animations and setting weights.
   *
   * - When weight becomes 0: Stops and resets the animation
   * - When weight becomes positive: Starts the animation playing
   * - Always: Updates the animation's influence weight
   *
   * @param {Anchor} anchor - The animation anchor containing the action to update
   * @param {number} weight - The new weight to assign to the animation action
   * @private
   */
  private updateAnimationAction(anchor: Anchor, weight: number): void {
    if (weight === 0 && anchor.action.weight > 0) {
      anchor.action.stop();
      anchor.action.time = 0;
      anchor.previousTime = 0;
    } else if (weight > 0 && anchor.action.weight === 0) {
      anchor.action.play();
    }
    anchor.action.weight = weight;
  }
}
