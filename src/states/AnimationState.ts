import { Eventail } from "eventail";
import { StateEvent } from "../mescellaneous/AnimationStateEvent";

export abstract class AnimationState extends Eventail {
  public abstract get influence(): number;

  protected ["onEnterInternal"](): void {
    this.emit(StateEvent.ENTER, this);
  }

  protected ["onExitInternal"](): void {
    this.emit(StateEvent.EXIT, this);
  }

  protected abstract ["onTickInternal"](deltaTime: number): void;

  protected abstract ["setInfluenceInternal"](influence: number): void;
}
