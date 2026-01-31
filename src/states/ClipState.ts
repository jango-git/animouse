import type { Callback } from "eventail";
import { LoopOnce, type AnimationAction } from "three";
import { AnimationStateEvent } from "../mescellaneous/AnimationStateEvent";
import { assertValidPositiveNumber, assertValidUnitRange } from "../mescellaneous/assertions";
import { getNextAnchorIndex, type Anchor } from "../mescellaneous/miscellaneous";
import { AnimationState } from "./AnimationState";

/**
 * Animation state that wraps a single Three.js AnimationAction.
 * Manages playback, weight control, and iteration events for a single animation clip.
 *
 * Detects animation completion and restart events, emitting appropriate
 * state events based on the animation's loop type.
 */
export class ClipState extends AnimationState {
  /**
   * Internal anchor that wraps the AnimationAction with additional tracking data.
   */
  private readonly anchor: Anchor;

  /**
   * Creates a new ClipState from a Three.js AnimationAction.
   * Initializes the animation to a stopped state and configures iteration events
   * based on the animation's loop type.
   *
   * @param animationAction - The Three.js AnimationAction to wrap
   * @throws {Error} When the animation clip duration is not a positive finite number
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
   * Sets the influence of this animation state.
   * Starts animation when influence becomes positive, stops when zero.
   * Resets animation time on playback transitions.
   *
   * @param influence - The new influence value in range [0, 1]
   * @throws {Error} When influence is not a finite number or is outside the range [0, 1]
   * @internal Called only by the animation state machine
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
   * Called on each frame to update animation state.
   * Handles time tracking and iteration event emission.
   *
   * @internal Called only by the animation state machine
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
