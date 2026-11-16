import { type AnimationAction, LoopOnce, LoopRepeat } from "three";

import type { Anchor } from "../../src/miscellaneous/miscellaneous";
import { AnimationTree } from "../../src/states/AnimationTree";
import { buildMockAnimationAction } from "../mocks/buildMockAnimationAction";

export class AnimationTreeProxy extends AnimationTree {
  private updateAnchorsInfluenceCallCountInternal = 0;

  public get updateAnchorsInfluenceCallCount(): number {
    return this.updateAnchorsInfluenceCallCountInternal;
  }

  public invokeSetInfluence(influence: number): void {
    this.setInfluenceInternal(influence);
  }

  public invokeUpdateAnchor(anchor: Anchor, weight?: number): void {
    this.updateAnchorWeight(anchor, weight);
  }

  public invokeIterateEvent(
    action: AnimationAction = buildMockAnimationAction(1, LoopRepeat),
  ): void {
    this.signalIterateInternal.emit(action, this);
  }

  public invokeFinishEvent(action: AnimationAction = buildMockAnimationAction(1, LoopOnce)): void {
    this.signalFinishInternal.emit(action, this);
  }

  protected override updateAnchorsInfluence(): void {
    this.updateAnchorsInfluenceCallCountInternal += 1;
  }

  protected override onTickInternal(deltaTime: number): void {
    void deltaTime;
  }
}
