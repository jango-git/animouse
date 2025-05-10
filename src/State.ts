import { Emitter } from "eventail";
import { AnimationAction, MathUtils } from "three";
import { EEvent } from "./EEvent";

const MIN_WEIGHT = 0;
const MAX_WEIGHT = 1;

export class State extends Emitter {
  private readonly action: AnimationAction;

  public constructor(action: AnimationAction) {
    super();

    this.action = action;
    this.action.weight = MIN_WEIGHT;
  }

  public get power(): number {
    return this.action.weight;
  }

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
