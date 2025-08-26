import type { Callback } from "eventail";
import type { AnimationAction } from "three";
import { AnimationStateEvent } from "../mescellaneous/AnimationStateEvent";
import { assertValidUnitRange } from "../mescellaneous/assertions";
import type { Anchor } from "../mescellaneous/miscellaneous";
import { AnimationState } from "./AnimationState";

/**
 * Abstract base class for animation trees in the animation state machine.
 * Manages multiple animation actions with their weights.
 *
 * Animation trees organize animation actions and handle playback and weight distribution.
 */
export abstract class AnimationTree extends AnimationState {
  /**
   * Map linking animation actions to their corresponding anchors.
   * Used to look up anchor information when registering time-based events.
   */
  protected readonly actionToAnchor = new Map<AnimationAction, Anchor>();

  /**
   * Registers a callback to be called when the specified animation action reaches a specific time.
   * The callback will be invoked every time the animation crosses the specified time threshold.
   *
   * @param action - The animation action to monitor for time events
   * @param unitTime - Time in unit range [0, 1] when the callback should be invoked
   * @param callback - Function to call when the time event occurs, receives the action and state as parameters
   * @throws {Error} When the action is not registered in this animation tree
   */
  public onTimeEvent(
    action: AnimationAction,
    unitTime: number,
    callback: Callback,
  ): void {
    const anchor = this.actionToAnchor.get(action);
    if (!anchor) {
      throw new Error(`Action is not registered`);
    }

    this.onTimeEventInternal(anchor, unitTime, callback, false);
  }

  /**
   * Registers a callback to be called once when the specified animation action reaches a specific time.
   * The callback will be invoked only the first time the animation crosses the specified time threshold.
   *
   * @param action - The animation action to monitor for time events
   * @param unitTime - Time in unit range [0, 1] when the callback should be invoked
   * @param callback - Function to call when the time event occurs, receives the action and state as parameters
   * @throws {Error} When the action is not registered in this animation tree
   */
  public onceTimeEvent(
    action: AnimationAction,
    unitTime: number,
    callback: Callback,
  ): void {
    const anchor = this.actionToAnchor.get(action);
    if (!anchor) {
      throw new Error(`Action is not registered`);
    }

    this.onTimeEventInternal(anchor, unitTime, callback, true);
  }

  /**
   * Removes a previously registered time event callback for the specified animation action.
   * Unregisters the callback from the specified time point and cleans up associated resources.
   *
   * @param action - The animation action to remove the time event from
   * @param unitTime - Time in unit range [0, 1] where the callback was registered
   * @param callback - The callback function to remove
   * @throws {Error} When the action is not registered in this animation tree
   */
  public offTimeEvent(
    action: AnimationAction,
    unitTime: number,
    callback: Callback,
  ): void {
    const anchor = this.actionToAnchor.get(action);
    if (!anchor) {
      throw new Error(`Action is not registered`);
    }

    this.offTimeEventInternal(anchor, unitTime, callback);
  }

  /**
   * Sets the influence of this animation tree.
   * Updates anchor influences while maintaining their relative weights.
   *
   * @param influence - The new influence value in range [0, 1]
   * @throws {Error} When influence is not a finite number or is outside the range [0, 1]
   * @internal Called only by the animation state machine
   */
  protected ["setInfluenceInternal"](influence: number): void {
    assertValidUnitRange(influence, "Animation tree influence");

    if (influence !== this.influenceInternal) {
      this.influenceInternal = influence;
      this.updateAnchorsInfluence();
    }
  }

  /**
   * Updates the weight of a specific animation anchor.
   * Handles animation lifecycle: starting, stopping, and weight adjustments.
   * Combines the raw weight with the tree's influence to get the final action weight.
   *
   * Transitions from zero to non-zero weight start playback and emit PLAY event.
   * Transitions from non-zero to zero weight stop playback and emit STOP event.
   *
   * @param anchor - The animation anchor containing the action and parameters to update
   * @param weight - The raw weight value before applying tree influence. If not provided, uses the anchor's current weight
   * @throws {Error} When weight is not a finite number or is outside the range [0, 1]
   */
  protected updateAnchorWeight(
    anchor: Anchor,
    weight: number = anchor.weight,
  ): void {
    assertValidUnitRange(weight, "Anchor weight");
    anchor.weight = weight;

    const combinedWeight = weight * this.influenceInternal;
    const animationAction = anchor.action;

    if (combinedWeight === animationAction.weight) {
      return;
    }

    if (combinedWeight > 0 && animationAction.weight === 0) {
      animationAction.enabled = true;
      animationAction.paused = false;
      animationAction.time = 0;
      animationAction.play();
      this.emit(AnimationStateEvent.PLAY, animationAction, this);
    } else if (combinedWeight === 0 && animationAction.weight > 0) {
      animationAction.stop();
      animationAction.time = 0;
      animationAction.paused = false;
      animationAction.enabled = false;
      this.emit(AnimationStateEvent.STOP, animationAction, this);
    }

    animationAction.weight = combinedWeight;
  }

  /**
   * Updates influence for all anchors in the animation tree.
   * Called when the tree's influence changes but relative weights remain the same.
   * Implementations should apply the new influence to all anchors
   * while maintaining their existing relative weight distribution.
   */
  protected abstract updateAnchorsInfluence(): void;
}
