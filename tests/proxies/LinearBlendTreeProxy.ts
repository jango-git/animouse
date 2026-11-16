import { LinearBlendTree } from "../../src/states/LinearBlendTree";
import { tickState } from "./tickState";

export class LinearBlendTreeProxy extends LinearBlendTree {
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
