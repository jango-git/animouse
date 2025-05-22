import type { AnimationAction } from "three";
import { MathUtils } from "three";
import { AnimationState } from "./AnimationState";
import { AnimationStateEvent } from "./AnimationStateEvent";

export class AnimationState0D extends AnimationState {
  private readonly action: AnimationAction;
  private powerPrivate: number;

  constructor(action: AnimationAction) {
    super();
    this.action = action;
    this.action.weight = 0;
    this.powerPrivate = 0;
  }

  public get power(): number {
    return this.powerPrivate;
  }

  public set power(value: number) {
    if (this.powerPrivate !== value) {
      if (this.powerPrivate === 0 && value > 0) {
        this.action.play();
        this.emit(AnimationStateEvent.ENTER, this);
      } else if (this.powerPrivate > 0 && value === 0) {
        this.emit(AnimationStateEvent.EXIT, this);
        this.action.stop();
      }

      this.powerPrivate = MathUtils.clamp(value, 0, 1);
      this.action.weight = this.powerPrivate;
    }
  }
}
