import { AnimationState } from "../../src/states/AnimationState";

export class AnimationStateProxy extends AnimationState {
  public invokeOnEnter(): void {
    this.onEnterInternal();
  }

  public invokeOnExit(): void {
    this.onExitInternal();
  }

  protected onTickInternal(deltaTime: number): void {}

  protected setInfluenceInternal(influence: number): void {}
}
