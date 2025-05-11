import { Emitter } from "eventail";
import { AnimationAction, MathUtils } from "three";
import { AnimationStateEvent } from "./AnimationStateEvent";

export class AnimationState0D extends Emitter {
  private action: AnimationAction;
  private powerPrivate: number;

  public constructor(action: AnimationAction) {
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
        this.emit(AnimationStateEvent.enter, this);
      } else if (this.powerPrivate > 0 && value === 0) {
        this.emit(AnimationStateEvent.exit, this);
        this.action.stop();
      }

      this.powerPrivate = MathUtils.clamp(value, 0, 1);
      this.action.weight = this.powerPrivate;
    }
  }
}
