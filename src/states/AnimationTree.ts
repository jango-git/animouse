import { type AnimationAction, LoopRepeat } from "three";

import { buildAnchor } from "../miscellaneous/buildAnchor.js";
import type { Anchor } from "../miscellaneous/miscellaneous.js";
import type { SyncOptions, TimeEventCallback } from "./AnimationState.js";
import { AnimationState } from "./AnimationState.js";

/**
 * Animation action of a blend tree and how it follows the phase.
 *
 * @public
 */
export interface BlendAction extends SyncOptions {
  /** The Three.js animation action to be played */
  action: AnimationAction;
}

/**
 * Abstract base class for blend trees in the animation state machine.
 * Concrete trees compute the weights of their actions from a blend position. AnimationState
 * plays them.
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
  public onTimeEvent(action: AnimationAction, unitTime: number, callback: TimeEventCallback): void {
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
    callback: TimeEventCallback,
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
    callback: TimeEventCallback,
  ): void {
    const anchor = this.actionToAnchor.get(action);
    if (!anchor) {
      throw new Error(`Action is not registered`);
    }

    this.offTimeEventInternal(anchor, unitTime, callback);
  }

  /**
   * Builds the anchor of a blend action and registers it for time events.
   * LoopRepeat actions are synchronized unless the blend action says otherwise.
   *
   * @param blendAction - The action and its synchronization settings
   * @throws {Error} When the clip duration is not a positive finite number
   * @throws {Error} When the phase offset is not a finite number
   * @throws {Error} When a synchronized action does not use LoopRepeat
   */
  protected buildBlendAnchor(blendAction: BlendAction): Anchor {
    const action = blendAction.action;
    const anchor = buildAnchor(
      action,
      blendAction.isSynchronized ?? action.loop === LoopRepeat,
      blendAction.phaseOffset ?? 0,
    );
    this.actionToAnchor.set(action, anchor);
    return anchor;
  }

  /**
   * Applies a new weight distribution. Active anchors missing from the map get zero weight.
   * Clears the map afterwards.
   *
   * @param weights - New weights of the anchors, before the tree influence is applied
   */
  protected commitWeights(weights: Map<Anchor, number>): void {
    for (const anchor of this.activeAnchors) {
      if (!weights.has(anchor)) {
        this.updateAnchorWeight(anchor, 0);
      }
    }
    for (const [anchor, weight] of weights) {
      this.updateAnchorWeight(anchor, weight);
    }
    weights.clear();
  }
}
