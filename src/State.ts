import { Emitter } from "eventail";
import { AnimationAction, MathUtils } from "three";
import { EEvent } from "./EEvent";

const MIN_WEIGHT = 0;
const MAX_WEIGHT = 1;

/**
 * A state controller for Three.js animation actions that manages weight transitions
 * and emits events when entering/exiting the state.
 * @extends Emitter
 */
export class State extends Emitter {
  private readonly action: AnimationAction;

  /**
   * Creates a new State instance for controlling an animation action
   * @param {AnimationAction} action - The Three.js AnimationAction to control
   */
  public constructor(action: AnimationAction) {
    super();

    this.action = action;
    this.action.weight = MIN_WEIGHT;
  }

  /**
   * Gets the current power (weight) of the animation state
   * @returns {number} The current weight value between MIN_WEIGHT and MAX_WEIGHT
   */
  public get power(): number {
    return this.action.weight;
  }

  /**
   * Sets the power (weight) of the animation state
   * @param {number} newValue - The new weight value to set (will be clamped)
   * @emits {EEvent.enter} When transitioning from MIN_WEIGHT to a positive weight
   * @emits {EEvent.exit} When transitioning from a positive weight to MIN_WEIGHT
   */
  public set power(newValue: number) {
    const clampedValue = MathUtils.clamp(newValue, MIN_WEIGHT, MAX_WEIGHT);
    if (this.action.weight === newValue) return;

    if (this.action.weight === MIN_WEIGHT && clampedValue > MIN_WEIGHT) {
      this.action.play();
      this.emit(EEvent.enter, this);
    } else if (this.action.weight > MIN_WEIGHT && clampedValue === MIN_WEIGHT) {
      this.emit(EEvent.exit, this);
      this.action.stop();
    }

    this.action.weight = clampedValue;
  }
}
