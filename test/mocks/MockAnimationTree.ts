import type { Anchor } from "../../src/mescellaneous/miscellaneous";
import { AnimationTree } from "../../src/states/AnimationTree";

export enum MockAnimationTreeEvents {
  UPDATE_ANCHORS_INFLUENCE = "update_anchors_influence",
}

export class MockAnimationTree extends AnimationTree {
  private updateAnchorsInfluenceCountInternal = 0;

  constructor(private readonly anchors: Anchor[] = []) {
    super();
  }

  public get updateAnchorsInfluenceCount(): number {
    return this.updateAnchorsInfluenceCountInternal;
  }

  public setInfluence(influence: number): void {
    this.setInfluenceInternal(influence);
  }

  public updateAnchorPublic(anchor: Anchor, weight?: number): void {
    this.updateAnchor(anchor, weight);
  }

  protected updateAnchorsInfluence(): void {
    this.updateAnchorsInfluenceCountInternal += 1;
    for (const anchor of this.anchors) {
      this.updateAnchor(anchor);
    }
  }

  protected onTickInternal(deltaTime: number): void {}
}
