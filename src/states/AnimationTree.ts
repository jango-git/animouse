import { StateEvent } from "../mescellaneous/AnimationStateEvent";
import type { Anchor } from "../mescellaneous/miscellaneous";
import { AnimationState } from "./AnimationState";

/**
 * Abstract base class for animation trees in the animation state machine.
 * Provides foundation for different tree types (linear, polar, freeform, etc.)
 * and manages animation anchors with their weights.
 *
 * Animation trees organize and control multiple animation actions through
 * a hierarchical structure, automatically managing playback and weight distribution.
 */
export abstract class AnimationTree extends AnimationState {
  /**
   * Internal method to set the influence of this animation tree.
   * When influence changes, triggers an update of anchor influences while
   * maintaining their relative weights unchanged.
   *
   * @param influence - The new influence value in range [0, 1]
   * @internal This method is intended to be called only by the animation state machine
   */
  protected ["setInfluenceInternal"](influence: number): void {
    if (influence !== this.influenceInternal) {
      this.influenceInternal = influence;
      this.updateAnchorsInfluence();
    }
  }

  /**
   * Updates the weight of a specific animation anchor (AnimationAction + parameters).
   * Handles animation playback lifecycle: starting, stopping, and weight adjustments.
   * Combines the raw weight with the tree's influence to get the final action weight.
   *
   * @param anchor - The animation anchor containing the action and parameters to update
   * @param rawWeight - The raw weight value before applying tree influence
   */
  protected updateAnchorWeight(anchor: Anchor, rawWeight: number): void {
    const combinedWeight = rawWeight * this.influenceInternal;
    const action = anchor.action;

    if (combinedWeight === action.weight) {
      return;
    }

    if (combinedWeight > 0 && action.weight === 0) {
      action.play();
      action.time = 0;
      action.weight = combinedWeight;
      anchor.weight = rawWeight;
      anchor.previousTime = 0;
      anchor.hasFiredIterationEvent = false;
      this.emit(StateEvent.PLAY, action, this);
      return;
    }

    if (combinedWeight === 0 && action.weight > 0) {
      action.stop();
      action.time = 0;
      action.weight = 0;
      anchor.weight = rawWeight;
      anchor.previousTime = 0;
      anchor.hasFiredIterationEvent = false;
      this.emit(StateEvent.STOP, action, this);
      return;
    }

    action.weight = combinedWeight;
    anchor.weight = rawWeight;
  }

  /**
   * Abstract method to update influence for all anchors in the animation tree.
   * Called when the tree's influence changes but relative weights remain the same.
   * Concrete implementations should apply the new influence to all anchors
   * while maintaining their existing relative weight distribution.
   *
   * This method is called automatically when the tree's influence changes.
   */
  protected abstract updateAnchorsInfluence(): void;
}
