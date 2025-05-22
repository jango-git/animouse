import type { AnimationAction } from "three";
import { MathUtils } from "three";
import { AnimationState } from "./AnimationState";
import { AnimationStateEvent } from "./AnimationStateEvent";

/**
 * Represents a simple animation state that controls a single animation with a power value.
 * This class manages animations that only require a single weight parameter (0D control).
 * 
 * @class AnimationState0D
 * @extends {AnimationState}
 */
export class AnimationState0D extends AnimationState {
  /** The THREE.js animation action being controlled */
  private readonly action: AnimationAction;

  /** Internal storage for the current power value */
  private powerInternal: number;

  /**
   * Creates an instance of AnimationState0D.
   * 
   * @param {AnimationAction} action - The THREE.js animation action to control
   */
  constructor(action: AnimationAction) {
    super();
    this.action = action;
    this.action.weight = 0;
    this.powerInternal = 0;
  }

  /**
   * Gets the current power level of the animation.
   * A power of 0 means the animation is stopped, while 1 means full strength.
   * 
   * @returns {number} The current power value between 0 and 1
   */
  public get power(): number {
    return this.powerInternal;
  }

  /**
   * Sets the power level of the animation.
   * When power changes from 0 to positive, the animation starts playing.
   * When power changes from positive to 0, the animation stops.
   * 
   * @param {number} value - The desired power value (will be clamped between 0 and 1)
   * @emits {AnimationStateEvent.ENTER} When power changes from 0 to positive
   * @emits {AnimationStateEvent.EXIT} When power changes from positive to 0
   */
  public set power(value: number) {
    if (this.powerInternal !== value) {
      if (this.powerInternal === 0 && value > 0) {
        this.action.play();
        this.emit(AnimationStateEvent.ENTER, this);
      } else if (this.powerInternal > 0 && value === 0) {
        this.emit(AnimationStateEvent.EXIT, this);
        this.action.stop();
      }

      this.powerInternal = MathUtils.clamp(value, 0, 1);
      this.action.weight = this.powerInternal;
    }
  }
}