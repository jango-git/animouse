import { Emitter } from "eventail";
import { powerSymbol, updateSymbol } from "./symbols";

/**
 * Abstract base class for animation states that can be controlled via power level.
 * Extends the Emitter class to provide event handling capabilities for animation state changes.
 *
 * @abstract
 * @class AnimationState
 * @extends {Emitter}
 */
export abstract class AnimationState extends Emitter {
  /**
   * Gets the current progress of the animation from start to end.
   *
   * @abstract
   * @type {number}
   * @returns {number} A value between 0 and 1 representing the progress through the animation
   */
  public abstract get progress(): number;

  /**
   * Gets the current power level of the animation state.
   * Power determines the strength or influence of the animation, typically ranging from 0 to 1.
   *
   * @abstract
   * @type {number}
   * @returns {number} The current power value between 0 and 1
   */
  public abstract get power(): number;

  /**
   * Sets the power level of the animation state.
   * Power determines the strength or influence of the animation, typically ranging from 0 to 1.
   * This property can only be modified by the AnimationStateMachine.
   *
   * @abstract
   * @param {number} value - The power level to set (typically between 0 and 1)
   * @emits {AnimationStateEvent.ENTER} When power changes from 0 to positive
   * @emits {AnimationStateEvent.EXIT} When power changes from positive to 0
   */
  public abstract set [powerSymbol](value: number);

  /**
   * Updates the animation state.
   * This method should be called every frame to handle animation events and state changes.
   * This method can only be called by the AnimationStateMachine.
   *
   * @abstract
   * @param {number} deltaTime - Time in seconds since the last update
   * @emits {AnimationStateEvent.ITERATION} When an animation completes a full iteration
   */
  public abstract [updateSymbol](deltaTime: number): void;
}
