import { AnimationState } from "../../src/states/AnimationState";

export class AnimationStateProxy extends AnimationState {
  public invokeOnEnter(): void {
    this.onEnterInternal();
  }

  public invokeOnExit(): void {
    this.onExitInternal();
  }
}
