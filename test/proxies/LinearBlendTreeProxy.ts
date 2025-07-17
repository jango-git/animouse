import { LinearBlendTree } from "../../src/states/LinearBlendTree";

export class LinearBlendTreeProxy extends LinearBlendTree {
  public invokeSetInfluence(influence: number): void {
    this.setInfluenceInternal(influence);
  }

  public invokeOnTick(): void {
    this.onTickInternal();
  }

  public invokeOnEnter(): void {
    this.onEnterInternal();
  }

  public invokeOnExit(): void {
    this.onExitInternal();
  }
}
