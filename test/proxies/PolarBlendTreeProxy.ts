import { PolarBlendTree } from "../../src/states/PolarBlendTree";

export class PolarBlendTreeProxy extends PolarBlendTree {
  public invokeSetInfluence(influence: number): void {
    this.setInfluenceInternal(influence);
  }

  public invokeOnTick(deltaTime: number): void {
    this.onTickInternal(deltaTime);
  }

  public invokeOnEnter(): void {
    this.onEnterInternal();
  }

  public invokeOnExit(): void {
    this.onExitInternal();
  }
}
