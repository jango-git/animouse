import type { Callback } from "eventail";
import { LoopOnce, type AnimationAction } from "three";
import { AnimationStateEvent } from "../mescellaneous/AnimationStateEvent";
import {
  assertValidPositiveNumber,
  assertValidUnitRange,
} from "../mescellaneous/assertions";
import {
  getNextAnchorIndex,
  type Anchor,
} from "../mescellaneous/miscellaneous";
import { AnimationState } from "./AnimationState";

/**
 * Animation state that wraps a single Three.js AnimationAction.
 * Manages the lifecycle of a single animation clip, handling playback,
 * weight control, and iteration events.
 *
 * This state automatically detects animation completion and restart events,
 * emitting appropriate state events based on the animation's loop type.
 */
export class ClipState extends AnimationState {
  /**
   * Internal anchor that wraps the AnimationAction with additional tracking data.
   */
  private readonly anchor: Anchor;

  /**
   * Creates a new ClipState from a Three.js AnimationAction.
   * Initializes the animation to a stopped state and configures iteration events
   * based on the animation's loop type. Sets up anchor with duration tracking
   * and event state management.
   *
   * @param animationAction - The Three.js AnimationAction to wrap (finite duration required)
   * @throws {Error} When the animation clip duration is not a positive finite number
   * @see {@link assertValidPositiveNumber} for duration validation details
   */
  constructor(animationAction: AnimationAction) {
    super();
    const duration = animationAction.getClip().duration;
    assertValidPositiveNumber(duration, "Clip duration");

    animationAction.stop();
    animationAction.time = 0;
    animationAction.weight = 0;
    animationAction.paused = false;
    animationAction.enabled = false;

    this.anchor = {
      index: getNextAnchorIndex(),
      action: animationAction,
      get weight(): number {
        throw new Error("ClipState weight is not accessible");
      },
      duration,
      invDuration: 1 / duration,
      iterationEventType:
        animationAction.loop === LoopOnce
          ? AnimationStateEvent.FINISH
          : AnimationStateEvent.ITERATE,
    };
  }

  /**
   * Registers a callback to be called when the animation reaches a specific time.
   * The callback will be invoked every time the animation crosses the specified time threshold.
   *
   * @param unitTime - Time in unit range [0, 1] when the callback should be invoked
   * @param callback - Function to call when the time event occurs, receives the action and state as parameters
   */
  public onTimeEvent(unitTime: number, callback: Callback): void {
    this.onTimeEventInternal(this.anchor, unitTime, callback, false);
  }

  /**
   * Registers a callback to be called once when the animation reaches a specific time.
   * The callback will be invoked only the first time the animation crosses the specified time threshold.
   *
   * @param unitTime - Time in unit range [0, 1] when the callback should be invoked
   * @param callback - Function to call when the time event occurs, receives the action and state as parameters
   */
  public onceTimeEvent(unitTime: number, callback: Callback): void {
    this.onTimeEventInternal(this.anchor, unitTime, callback, true);
  }

  /**
   * Removes a previously registered time event callback.
   * Unregisters the callback from the specified time point and cleans up associated resources.
   *
   * @param unitTime - Time in unit range [0, 1] where the callback was registered
   * @param callback - The callback function to remove
   */
  public offTimeEvent(unitTime: number, callback: Callback): void {
    this.offTimeEventInternal(this.anchor, unitTime, callback);
  }

  /**
   * Internal method to set the influence of this animation state.
   * Controls animation playback: starts animation when influence becomes positive,
   * stops when influence becomes zero, and adjusts weight for intermediate values.
   * Resets animation time and event tracking state on playback transitions.
   *
   * @param influence - The new influence value in range [0, 1] (finite number)
   * @throws {Error} When influence is not a finite number or is outside the range [0, 1]
   * @internal This method is intended to be called only by the animation state machine
   * @see {@link AnimationStateEvent.PLAY} for play event details
   * @see {@link AnimationStateEvent.STOP} for stop event details
   */
  protected ["setInfluenceInternal"](influence: number): void {
    assertValidUnitRange(influence, "Influence");

    if (this.influenceInternal === influence) {
      return;
    }

    this.influenceInternal = influence;
    const anchor = this.anchor;
    const animationAction = anchor.action;

    if (influence > 0 && animationAction.weight === 0) {
      animationAction.enabled = true;
      animationAction.paused = false;
      animationAction.time = 0;
      animationAction.play();
      this.emit(AnimationStateEvent.PLAY, animationAction, this);
    } else if (influence === 0 && animationAction.weight > 0) {
      animationAction.stop();
      animationAction.time = 0;
      animationAction.paused = false;
      animationAction.enabled = false;
      this.emit(AnimationStateEvent.STOP, animationAction, this);
    }

    animationAction.weight = influence;
  }

  /**
   * Internal method called on each frame to update animation state.
   * Delegates to the inherited updateAnchorTime method to handle time tracking
   * and iteration event emission based on animation progress.
   *
   * @internal This method is intended to be called only by the animation state machine
   * @see {@link updateAnchorTime} for time tracking and event emission details
   */
  protected ["onTickInternal"](deltaTime: number): void {
    if (this.influence === 0) {
      throw new Error(
        `${this.name}: cannot update anchor time because the animation influence is zero`,
      );
    }
    this.processTimeEvents(this.anchor, deltaTime);
    this.updateAnchorTime(this.anchor, deltaTime);
  }

  protected override ["onEnterInternal"](): void {
    super.onEnterInternal();
    if (this.influence > 0) {
      this.resetFinishedAction(this.anchor);
    }
  }
}
