import { LoopOnce, type AnimationAction } from "three";
import { StateEvent } from "../mescellaneous/AnimationStateEvent";
import type { Anchor } from "../mescellaneous/miscellaneous";
import { AnimationState } from "./AnimationState";

export class ClipState extends AnimationState {
  private readonly anchor: Anchor;
  private influenceInternal = 0;

  constructor(action: AnimationAction) {
    super();
    action.time = 0;
    action.weight = 0;

    this.anchor = {
      action,
      previousTime: 0,
      duration: action.getClip().duration,
      hasFiredIterationEvent: false,
      iterationEventType:
        action.loop === LoopOnce ? StateEvent.FINISH : StateEvent.ITERATE,
    };
  }

  public get influence(): number {
    return this.influenceInternal;
  }

  protected ["setInfluenceInternal"](influence: number): void {
    if (influence === this.influenceInternal) {
      return;
    }

    this.influenceInternal = influence;
    const action = this.anchor.action;

    if (influence === 0 && action.weight > 0) {
      action.stop();
      action.time = 0;
      action.weight = 0;
      this.emit(StateEvent.STOP, action, this);
      this.emit(StateEvent.EXIT, action, this);
      return;
    }

    if (influence > 0 && action.weight === 0) {
      action.play();
      action.weight = influence;
      this.emit(StateEvent.PLAY, action, this);
      this.emit(StateEvent.ENTER, action, this);
      return;
    }

    action.weight = influence;
  }

  protected ["onTickInternal"](): void {
    const anchor = this.anchor;
    const action = anchor.action;
    const time = action.time;
    const duration = anchor.duration;

    if (
      time < anchor.previousTime ||
      (!anchor.hasFiredIterationEvent && time >= duration)
    ) {
      this.emit(anchor.iterationEventType, action, this);
      anchor.hasFiredIterationEvent = true;
    } else if (time < duration) {
      anchor.hasFiredIterationEvent = false;
    }

    anchor.previousTime = time;
  }
}
