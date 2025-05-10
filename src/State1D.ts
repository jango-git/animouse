import { Emitter } from "eventail";
import { AnimationAction, MathUtils } from "three";
import { EEvent } from "./EEvent";

const MIN_WEIGHT = 0;
const MAX_WEIGHT = 1;

/**
 * Interface describing an animation action with its associated value
 * @interface
 */
interface IAction {
  action: AnimationAction;
  value: number;
}

/**
 * A 1-dimensional state machine that blends between multiple Three.js animation actions
 * based on a blend value and power level. Emits events when entering/exiting active state.
 * @extends Emitter
 */
export class State1D extends Emitter {
  private readonly actions: readonly IAction[] = [];
  private rawPower = 0;
  private blend = 0;

  /**
   * Creates a new State1D instance for controlling multiple animation actions
   * @param {IAction[]} actions - Array of action/value pairs to control
   * @throws {Error} If fewer than 2 actions are provided
   * @throws {Error} If any action value is outside 0-1 range
   */
  public constructor(actions: IAction[]) {
    super();

    if (actions.length < 2) throw new Error("Need at least 2 actions");

    this.actions = actions
      .map((action: IAction, i: number) => {
        if (action.value < MIN_WEIGHT || action.value > MAX_WEIGHT) {
          throw new Error(
            `Action value at index ${i} must be between ${MIN_WEIGHT} and ${MAX_WEIGHT}`,
          );
        }
        return { action: action.action, value: action.value };
      })
      .sort((a, b) => a.value - b.value);

    (this.actions[0] as IAction).value = MIN_WEIGHT;
    (this.actions[this.actions.length - 1] as IAction).value = MAX_WEIGHT;
  }

  /**
   * Gets the current power level affecting all actions
   * @returns {number} Current power level between 0 and 1
   */
  public get power(): number {
    return this.rawPower;
  }

  /**
   * Sets the power level affecting all actions
   * @param {number} newValue - New power level (will be clamped to 0-1)
   * @emits {EEvent.enter} When transitioning from 0 to a positive power level
   * @emits {EEvent.exit} When transitioning from positive power level to 0
   */
  public set power(newValue: number) {
    const clampedValue = MathUtils.clamp(newValue, MIN_WEIGHT, MAX_WEIGHT);
    if (this.rawPower === clampedValue) return;

    if (this.rawPower === MIN_WEIGHT && clampedValue > MIN_WEIGHT) {
      this.emit(EEvent.enter, this);
    } else if (this.rawPower > MIN_WEIGHT && clampedValue === MIN_WEIGHT) {
      this.emit(EEvent.exit, this);
    }

    this.rawPower = clampedValue;
    this.update();
  }

  /**
   * Sets the blend value determining which actions are active
   * @param {number} value - New blend value (will be clamped to 0-1)
   */
  public setBlend(value: number): void {
    this.blend = MathUtils.clamp(value, MIN_WEIGHT, MAX_WEIGHT);
    this.update();
  }

  /**
   * Updates an individual action's state based on new weight
   * @private
   * @param {AnimationAction} action - The action to update
   * @param {number} weight - New weight value for the action
   */
  private updateAction(action: AnimationAction, weight: number): void {
    if (weight === MIN_WEIGHT && action.weight > MIN_WEIGHT) action.stop();
    else if (weight > MIN_WEIGHT && action.weight === MIN_WEIGHT) action.play();
    action.weight = weight;
  }

  /**
   * Updates all actions' weights based on current power and blend values
   * @private
   */
  private update(): void {
    for (let i = 0; i < this.actions.length - 1; i++) {
      const current = this.actions[i] as IAction;
      const next = this.actions[i + 1] as IAction;

      if (this.blend < current.value) {
        this.updateAction(next.action, MIN_WEIGHT);
      } else if (this.blend > next.value) {
        this.updateAction(current.action, MIN_WEIGHT);
      } else {
        const difference =
          (this.blend - current.value) / (next.value - current.value);

        this.updateAction(current.action, (1 - difference) * this.rawPower);
        this.updateAction(next.action, difference * this.rawPower);
      }
    }
  }
}
