import { Emitter } from "eventail";
import { AnimationAction, MathUtils } from "three";
import { EEvent } from "./EEvent";

const MIN_WEIGHT = 0;
const MAX_WEIGHT = 1;

interface IAction {
  action: AnimationAction;
  value: number;
}

export class State1D extends Emitter {
  private readonly actions: readonly IAction[] = [];
  private _power: number = 0;
  private blend: number = 0;

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

  public setBlend(value: number) {
    this.blend = MathUtils.clamp(value, MIN_WEIGHT, MAX_WEIGHT);
    this.update();
  }

  private updateAction(action: AnimationAction, weight: number) {
    if (weight === MIN_WEIGHT && action.weight > MIN_WEIGHT) action.stop();
    else if (weight > MIN_WEIGHT && action.weight === MIN_WEIGHT) action.play();
    action.weight = weight;
  }

  private update() {
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

        this.updateAction(current.action, (1 - difference) * this._power);
        this.updateAction(next.action, difference * this._power);
      }
    }
  }

  public get power() {
    return this._power;
  }

  public set power(newValue: number) {
    const clampedValue = MathUtils.clamp(newValue, MIN_WEIGHT, MAX_WEIGHT);
    if (this._power === clampedValue) return;

    if (this._power === MIN_WEIGHT && clampedValue > MIN_WEIGHT) {
      this.emit(EEvent.ENTER, this);
    } else if (this._power > MIN_WEIGHT && clampedValue === MIN_WEIGHT) {
      this.emit(EEvent.EXIT, this);
    }

    this._power = clampedValue;
    this.update();
  }
}
