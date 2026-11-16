import { ClipState } from "../../src/states/ClipState";
import { tickState } from "./tickState";

export class ClipStateProxy extends ClipState {
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
