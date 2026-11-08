import { FreeformBlendTree } from "../../src/states/FreeformBlendTree";

export class FreeformBlendTreeProxy extends FreeformBlendTree {
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
