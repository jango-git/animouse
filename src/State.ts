import { Emitter } from "eventail";
import { AnimationAction, MathUtils } from "three";
import { EEvent } from "./EEvent";

const MIN_WEIGHT = 0;
const MAX_WEIGHT = 1;

/**
 * Represents a state managing the weight of an AnimationAction.
 * Extends EventHandler to emit enter and exit events based on the weight changes.
 */
export class State extends Emitter {
  private readonly action: AnimationAction;

  /**
   * Creates a new State instance for the given AnimationAction.
   * Initializes the action weight to the minimum value.
   * @param action - The AnimationAction to control.
   */
  public constructor(action: AnimationAction) {
    super();

    this.action = action;
    this.action.weight = MIN_WEIGHT;
  }

  /**
   * Gets the current weight (power) of the animation action.
   */
  public get power() {
    return this.action.weight;
  }

  /**
   * Sets the weight (power) of the animation action.
   * Clamps the value between MIN_WEIGHT and MAX_WEIGHT.
   * @param newValue - New weight value to set.
   */
  public set power(newValue: number) {
    const clampedValue = MathUtils.clamp(newValue, MIN_WEIGHT, MAX_WEIGHT);
    if (this.action.weight === newValue) return;

    if (this.action.weight === MIN_WEIGHT && clampedValue > MIN_WEIGHT) {
      this.action.play();
      this.emit(EEvent.ENTER, this);
    } else if (this.action.weight > MIN_WEIGHT && clampedValue === MIN_WEIGHT) {
      this.emit(EEvent.EXIT, this);
      this.action.stop();
    }

    this.action.weight = clampedValue;
  }
}
