import type { Anchor } from "../../src/mescellaneous/miscellaneous";
import { AnimationTree } from "../../src/states/AnimationTree";

export class AnimationTreeProxy extends AnimationTree {
  private updateAnchorsInfluenceCallCountInternal = 0;

  public get updateAnchorsInfluenceCallCount(): number {
    return this.updateAnchorsInfluenceCallCountInternal;
  }

  public invokeSetInfluence(influence: number): void {
    this.setInfluenceInternal(influence);
  }

  public invokeUpdateAnchor(anchor: Anchor, weight?: number): void {
    this.updateAnchor(anchor, weight);
  }

  protected updateAnchorsInfluence(): void {
    this.updateAnchorsInfluenceCallCountInternal += 1;
  }

  protected onTickInternal(deltaTime: number): void {
    void deltaTime;
  }
}
