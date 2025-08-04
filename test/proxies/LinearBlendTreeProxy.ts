import { LinearBlendTree } from "../../src/states/LinearBlendTree";

export class LinearBlendTreeProxy extends LinearBlendTree {
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
