import { ClipState } from "../../src/states/ClipState";

export class ClipStateProxy extends ClipState {
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
