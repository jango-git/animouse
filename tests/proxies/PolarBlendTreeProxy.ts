import { PolarBlendTree } from "../../src/states/PolarBlendTree";
import { tickState } from "./tickState";

export class PolarBlendTreeProxy extends PolarBlendTree {
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
