import { Emitter } from "eventail";

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
   * Gets the current power level of the animation state.
   * Power determines the strength or influence of the animation, typically ranging from 0 to 1.
   * 
   * @abstract
   * @type {number}
   * @memberof AnimationState
   */
  public abstract get power(): number;

  /**
   * Sets the power level of the animation state.
   * Power determines the strength or influence of the animation, typically ranging from 0 to 1.
   * 
   * @abstract
   * @memberof AnimationState
   * @param {number} value - The power level to set (typically between 0 and 1)
   */
  public abstract set power(value: number);
}