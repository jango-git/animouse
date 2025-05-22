import type { AnimationAction } from "three";
import { MathUtils } from "three";
import { AnimationState } from "./AnimationState";
import { AnimationStateEvent } from "./AnimationStateEvent";
import { powerSymbol, updateSymbol } from "./symbols";

/**
 * Represents a simple animation state that controls a single animation with a power value.
 * This class manages animations that only require a single weight parameter (0D control).
 *
 * @class AnimationState0D
 * @extends {AnimationState}
 */
export class AnimationState0D extends AnimationState {
  private readonly action: AnimationAction;
  private readonly clipDuration: number;

  private hasEmittedIterationEvent = false;
  private previousTime = 0;
  private powerInternal = 0;

  constructor(action: AnimationAction) {
    super();
    this.action = action;
    this.action.weight = 0;
    this.clipDuration = action.getClip().duration;
  }

  public get progress(): number {
    return MathUtils.clamp(this.action.time / this.clipDuration, 0, 1);
  }

  public get power(): number {
    return this.powerInternal;
  }

  public set [powerSymbol](value: number) {
    if (this.powerInternal !== value) {
      if (this.powerInternal === 0 && value > 0) {
        this.action.play();
        this.emit(AnimationStateEvent.ENTER, this);
      } else if (this.powerInternal > 0 && value === 0) {
        this.emit(AnimationStateEvent.EXIT, this);
        this.action.stop();
      }

      this.powerInternal = MathUtils.clamp(value, 0, 1);
      this.action.weight = this.powerInternal;
    }
  }

  public [updateSymbol](): void {
    const currentTime = this.action.time;

    if (
      currentTime < this.previousTime ||
      (currentTime >= this.clipDuration && !this.hasEmittedIterationEvent)
    ) {
      this.emit(AnimationStateEvent.ITERATION, this);
      this.hasEmittedIterationEvent = true;
    } else if (currentTime < this.clipDuration) {
      this.hasEmittedIterationEvent = false;
    }

    this.previousTime = currentTime;
  }
}
