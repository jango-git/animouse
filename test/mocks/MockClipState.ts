import { ClipState } from "../../src/states/ClipState";

export class MockClipState extends ClipState {
  public setInfluence(influence: number): void {
    this.setInfluenceInternal(influence);
  }

  public triggerTick(): void {
    this.onTickInternal();
  }

  public get testAnchor() {
    return (this as any).anchor;
  }
}
