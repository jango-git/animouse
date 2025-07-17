import { PolarBlendTree } from "../../src/states/PolarBlendTree";

export class PolarBlendTreeProxy extends PolarBlendTree {
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
