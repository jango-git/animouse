import { FreeformBlendTree } from "../../src/states/FreeformBlendTree";

export class FreeformBlendTreeProxy extends FreeformBlendTree {
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
