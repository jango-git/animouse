import type { Callback } from "eventail";
import { Eventail } from "eventail";
import { LoopOnce } from "three";
import { AnimationStateEvent } from "../mescellaneous/AnimationStateEvent";
import { assertValidUnitRange } from "../mescellaneous/assertions";
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
   * Map storing time-based event callbacks for each anchor.
   * Maps anchors to their respective time events, where each time event
   * is identified by a normalized time value and associated event name.
   */
  protected timeEvents = new Map<Anchor, Map<number, string>>();

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
   * Internal method to register a time-based event callback for an anchor.
   * Normalizes the unit time to avoid floating-point precision issues and
   * creates a unique event identifier for the time/anchor combination.
   *
   * @param anchor - The animation anchor to associate the time event with
   * @param unitTime - Time in unit range [0, 1] when the event should fire
   * @param callback - Function to call when the time event occurs
   * @param isOnce - Whether the event should fire only once or repeatedly
   * @internal This method is intended to be called only by concrete animation state implementations
   */
  protected onTimeEventInternal(
    anchor: Anchor,
    unitTime: number,
    callback: Callback,
    isOnce: boolean,
  ): void {
    assertValidUnitRange(unitTime, "Unit time");
    const roundedTime = Math.round(unitTime * 100) / 100;
    const events = this.timeEvents.get(anchor) ?? new Map<number, string>();
    this.timeEvents.set(anchor, events);
    const event = events.get(roundedTime) ?? `${roundedTime}_${anchor.index}`;
    events.set(roundedTime, event);

    isOnce ? this.once(event, callback) : this.on(event, callback);
  }

  /**
   * Internal method to unregister a time-based event callback for an anchor.
   * Removes the callback from the specified time point and cleans up empty
   * time event maps to prevent memory leaks.
   *
   * @param anchor - The animation anchor to remove the time event from
   * @param unitTime - Time in unit range [0, 1] where the event was registered
   * @param callback - The callback function to remove
   * @internal This method is intended to be called only by concrete animation state implementations
   */
  protected offTimeEventInternal(
    anchor: Anchor,
    unitTime: number,
    callback: Callback,
  ): void {
    assertValidUnitRange(unitTime, "Unit time");
    const roundedTime = Math.round(unitTime * 100) / 100;
    const events = this.timeEvents.get(anchor);
    if (!events) {
      return;
    }
    const event = events.get(roundedTime);
    if (!event) {
      return;
    }
    this.off(event, callback);
    events.delete(roundedTime);
    if (events.size === 0) {
      this.timeEvents.delete(anchor);
    }
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

  protected resetFinishedAction(anchor: Anchor): void {
    const action = anchor.action;
    if (action.loop === LoopOnce && action.time === anchor.duration) {
      action.time = 0;
      action.paused = false;
      action.enabled = true;
    }
  }

  /**
   * Processes and fires time-based events for an anchor during animation playback.
   * Checks if the animation has crossed any registered time event thresholds
   * and emits the corresponding events with the action and state as parameters.
   *
   * @param anchor - The animation anchor to process time events for
   * @param deltaTime - Time elapsed since the last frame, in milliseconds
   * @internal This method is intended to be called only by concrete animation state implementations
   */
  protected processTimeEvents(anchor: Anchor, deltaTime: number): void {
    const events = this.timeEvents.get(anchor);

    if (events) {
      const action = anchor.action;
      const invDeltaTime = deltaTime * anchor.invDuration;

      for (const [eventTime, eventName] of events) {
        const actionTime = action.time * anchor.invDuration;
        if (actionTime < eventTime && actionTime + invDeltaTime >= eventTime) {
          this.emit(eventName, action, this);
        }
      }
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
