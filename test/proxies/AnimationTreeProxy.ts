import { LoopOnce, LoopRepeat, type AnimationAction } from "three";
import { AnimationStateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import type { Anchor } from "../../src/mescellaneous/miscellaneous";
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
    aciton: AnimationAction = buildMockAnimationAction(1, LoopRepeat),
  ): void {
    this.emit(AnimationStateEvent.ITERATE, aciton, this);
  }

  public invokeFinishEvent(
    aciton: AnimationAction = buildMockAnimationAction(1, LoopOnce),
  ): void {
    this.emit(AnimationStateEvent.FINISH, aciton, this);
  }

  protected updateAnchorsInfluence(): void {
    this.updateAnchorsInfluenceCallCountInternal += 1;
  }

  protected onTickInternal(deltaTime: number): void {
    void deltaTime;
  }
}
