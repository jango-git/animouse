import { FreeformBlendTree } from "../../src/states/FreeformBlendTree";
import { tickState } from "./tickState";

export class FreeformBlendTreeProxy extends FreeformBlendTree {
  public invokeSetInfluence(influence: number): void {
    this.setInfluenceInternal(influence);
  }

  public invokeOnTick(deltaTime: number): void {
    tickState(this, deltaTime);
  }

  public invokeOnEnter(): void {
    this.onEnterInternal();
  }

  public invokeOnExit(): void {
    this.onExitInternal();
  }
}
