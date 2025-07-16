import { AnimationState } from "../../src/states/AnimationState";

export class MockAnimationState extends AnimationState {
  public triggerOnEnter(): void {
    this.onEnterInternal();
  }

  public triggerOnExit(): void {
    this.onExitInternal();
  }

  protected onTickInternal(deltaTime: number): void {}

  protected setInfluenceInternal(influence: number): void {}
}
