import { Eventail } from "eventail";
import { AnimationStateEvent } from "../mescellaneous/AnimationStateEvent";
import type { Anchor } from "../mescellaneous/miscellaneous";

/**
 * Abstract base class for animation states in the animation state machine.
 * Manages state influence (weight) and provides lifecycle event handling.
 *
 * This class is designed to be extended by concrete animation states and
 * controlled by the animation state machine.
 */
export abstract class AnimationState extends Eventail {
  /**
   * The name identifier for this animation state.
   * Used to identify and reference the state within the animation state machine.
   */
  public name = "";

  /**
   * Internal storage for the state's influence value.
   * Represents the weight/contribution of this state in the animation state machine.
   */
  protected influenceInternal = 0;

  /**
   * Gets the current influence (weight) of this animation state.
   * The influence determines how much this state contributes to the overall animation.
   *
   * @returns The current influence value, always in range [0, 1]
   */
  public get influence(): number {
    return this.influenceInternal;
  }

  /**
   * Internal method called by the animation state machine when entering this state.
   * Emits the ENTER event with this state instance as data.
   *
   * @internal This method is intended to be called only by the animation state machine
   */
  protected ["onEnterInternal"](): void {
    this.emit(AnimationStateEvent.ENTER, this);
  }

  /**
   * Internal method called by the animation state machine when exiting this state.
   * Emits the EXIT event with this state instance as data.
   *
   * @internal This method is intended to be called only by the animation state machine
   */
  protected ["onExitInternal"](): void {
    this.emit(AnimationStateEvent.EXIT, this);
  }

  /**
   * Updates the anchor's time tracking and emits iteration events when appropriate.
   * Handles event firing logic based on animation time progression and anchor duration.
   * Tracks whether iteration events have been fired to prevent duplicate emissions.
   *
   * @param anchor - The anchor object containing action, duration, and event tracking state
   * @param deltaTime - Time elapsed since the last frame, in milliseconds
   * @throws {Error} When the anchor's action is not running
   * @internal This method is intended to be called only by concrete animation state implementations
   */
  protected updateAnchorTime(anchor: Anchor, deltaTime: number): void {
    const action = anchor.action;

    if (anchor.action.weight === 0) {
      throw new Error(
        `Cannot update anchor time for a non-running action: ${this.name}`,
      );
    }

    const time = action.time;
    const duration = anchor.duration;

    if (time < duration && time + deltaTime >= duration) {
      this.emit(anchor.iterationEventType, action, this);
    }
  }

  /**
   * Internal method called by the animation state machine on each frame update.
   * Concrete implementations should handle per-frame state updates here.
   *
   * @param deltaTime - Time elapsed since the last frame, in milliseconds
   * @internal This method is intended to be called only by the animation state machine
   */
  protected abstract ["onTickInternal"](deltaTime: number): void;

  /**
   * Internal method called by the animation state machine to set the state's influence.
   * Concrete implementations should update the influenceInternal property and handle
   * any influence-related logic here.
   *
   * @param influence - The new influence value to set
   * @internal This method is intended to be called only by the animation state machine
   */
  protected abstract ["setInfluenceInternal"](influence: number): void;
}
