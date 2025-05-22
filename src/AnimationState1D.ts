import type { AnimationAction } from "three";
import { MathUtils } from "three";
import { AnimationState } from "./AnimationState";
import { AnimationStateEvent } from "./AnimationStateEvent";

const MIN_ACTION_COUNT = 2;

/**
 * Represents an animation action and its corresponding value in the 1D animation space.
 * 
 * @interface Action
 */
export interface Action {
  /** The THREE.js animation action to control */
  action: AnimationAction;
  /** The position value of this action in the 1D space (typically between 0 and 1) */
  value: number;
}

/**
 * Manages a one-dimensional blend space between multiple animations.
 * This class can control and blend between multiple animations arranged along a 1D axis.
 * 
 * @class AnimationState1D
 * @extends {AnimationState}
 */
export class AnimationState1D extends AnimationState {
  /** Array of actions and their positions in the 1D space */
  private readonly actions: Action[] = [];
  /** Internal storage for the current power value */
  private powerInternal = 0;
  /** Current blend position in the 1D space */
  private blend = 0;

  /**
   * Creates an instance of AnimationState1D.
   * The actions will be sorted by their value to create a continuous 1D blend space.
   * 
   * @param {Action[]} actions - Array of animation actions and their positions in the 1D space.
   * Must contain at least 2 actions.
   * @throws {Error} If less than 2 actions are provided
   */
  constructor(actions: Action[]) {
    super();
    if (actions.length < MIN_ACTION_COUNT) {
      throw new Error("Need at least 2 actions");
    }

    for (const action of actions) {
      this.actions.push(action);
      action.action.weight = 0;
    }

    this.actions.sort((a, b) => a.value - b.value);

    const first = this.actions[0];
    const last = this.actions[this.actions.length - 1];

    first.value = 0;
    last.value = 1;
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
  public set power(value: number) {
    const clampedValue = MathUtils.clamp(value, 0, 1);

    if (this.powerInternal !== clampedValue) {
      if (this.powerInternal === 0 && clampedValue > 0) {
        this.emit(AnimationStateEvent.ENTER, this);
      } else if (this.powerInternal > 0 && clampedValue === 0) {
        this.emit(AnimationStateEvent.EXIT, this);
      }

      this.powerInternal = clampedValue;
      this.update();
    }
  }

  /**
   * Sets the current position in the 1D blend space.
   * This determines which animations are active and how they are blended.
   * 
   * @param {number} value - The position in the blend space (will be clamped between 0 and 1)
   */
  public setBlend(value: number): void {
    this.blend = MathUtils.clamp(value, 0, 1);
    this.update();
  }

  /**
   * Updates the weight of a single animation action based on the current state.
   * Handles starting and stopping the animation as needed.
   * 
   * @private
   * @param {AnimationAction} action - The animation action to update
   * @param {number} weight - The new weight to set
   */
  private updateAction(action: AnimationAction, weight: number): void {
    if (weight === 0 && action.weight > 0) {
      action.stop();
    } else if (weight > 0 && action.weight === 0) {
      action.play();
    }
    action.weight = weight;
  }

  /**
   * Updates all animation weights based on the current blend and power values.
   * This method handles the actual blending between animations.
   * 
   * @private
   */
  private update(): void {
    for (let i = 0; i < this.actions.length - 1; i++) {
      const left = this.actions[i];
      const right = this.actions[i + 1];

      if (this.blend < left.value) {
        this.updateAction(right.action, 0);
      } else if (this.blend > right.value) {
        this.updateAction(left.action, 0);
      } else {
        const difference =
          (this.blend - left.value) / (right.value - left.value);
        this.updateAction(left.action, (1 - difference) * this.powerInternal);
        this.updateAction(right.action, difference * this.powerInternal);
      }
    }
  }
}