import { StateEvent } from "../mescellaneous/AnimationStateEvent";
import type { Anchor } from "../mescellaneous/miscellaneous";
import { AnimationState } from "./AnimationState";

export abstract class AnimationTree extends AnimationState {
  protected influenceInternal = 0;

  public get influence(): number {
    return this.influenceInternal;
  }

  protected ["setInfluenceInternal"](influence: number): void {
    if (influence === this.influenceInternal) {
      return;
    }

    if (influence > 0 && this.influenceInternal === 0) {
      this.emit(StateEvent.ENTER, this);
    } else if (influence === 0 && this.influenceInternal > 0) {
      this.emit(StateEvent.EXIT, this);
    }

    this.influenceInternal = influence;
  }

  protected updateAnchorWeight(anchor: Anchor, weight: number): void {
    const action = anchor.action;

    if (weight === action.weight) {
      return;
    }

    if (weight === 0 && action.weight > 0) {
      action.stop();
      action.time = 0;
      action.weight = 0;
      anchor.previousTime = 0;
      this.emit(StateEvent.STOP, action, this);
      return;
    }

    if (weight > 0 && action.weight === 0) {
      action.play();
      action.weight = weight;
      this.emit(StateEvent.PLAY, action, this);
      return;
    }

    action.weight = weight;
  }

  protected abstract updateAnchors(): void;
}
