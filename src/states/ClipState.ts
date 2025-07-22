import { LoopOnce, type AnimationAction } from "three";
import { StateEvent } from "../mescellaneous/AnimationStateEvent";
import type { Anchor } from "../mescellaneous/miscellaneous";
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
   * based on the animation's loop type.
   *
   * @param animationAction - The Three.js AnimationAction to wrap
   */
  constructor(animationAction: AnimationAction) {
    super();
    const duration = animationAction.getClip().duration;
    if (duration <= 0) {
      throw new Error("Action duration must be greater than zero");
    }

    animationAction.stop();
    animationAction.time = 0;
    animationAction.weight = 0;

    this.anchor = {
      action: animationAction,
      weight: 1,
      previousTime: 0,
      duration,
      hasFiredIterationEvent: false,
      iterationEventType:
        animationAction.loop === LoopOnce
          ? StateEvent.FINISH
          : StateEvent.ITERATE,
    };
  }

  /**
   * Internal method to set the influence of this animation state.
   * Controls animation playback: starts animation when influence becomes positive,
   * stops when influence becomes zero, and adjusts weight for intermediate values.
   *
   * @param influence - The new influence value in range [0, 1]
   * @internal This method is intended to be called only by the animation state machine
   */
  protected ["setInfluenceInternal"](influence: number): void {
    if (!Number.isFinite(influence)) {
      throw new Error("Invalid influence value: not a finite number");
    }

    if (Math.abs(influence) > Number.MAX_SAFE_INTEGER) {
      throw new Error("Invalid influence value: exceeds maximum safe integer");
    }

    if (influence < 0 || influence > 1) {
      throw new Error("Invalid influence value: out of range [0, 1]");
    }

    this.influenceInternal = influence;
    const anchor = this.anchor;
    const animationAction = anchor.action;

    if (influence === 0 && animationAction.weight > 0) {
      animationAction.stop();
      animationAction.time = 0;
      animationAction.weight = 0;
      anchor.hasFiredIterationEvent = false;
      this.emit(StateEvent.STOP, animationAction, this);
      return;
    }

    if (influence > 0 && animationAction.weight === 0) {
      animationAction.play();
      animationAction.time = 0;
      animationAction.weight = influence;
      anchor.hasFiredIterationEvent = false;
      this.emit(StateEvent.PLAY, animationAction, this);
      return;
    }

    animationAction.weight = influence;
  }

  /**
   * Internal method called on each frame to track animation progress.
   * Detects animation completion, restart events, and emits appropriate
   * iteration events (FINISH for LoopOnce, ITERATE for looped animations).
   *
   * @internal This method is intended to be called only by the animation state machine
   */
  protected ["onTickInternal"](): void {
    const anchor = this.anchor;
    const animationAction = anchor.action;
    const time = animationAction.time;
    const duration = anchor.duration;

    if (
      !anchor.hasFiredIterationEvent &&
      (time >= duration || time < anchor.previousTime)
    ) {
      this.emit(anchor.iterationEventType, animationAction, this);
      anchor.hasFiredIterationEvent = true;
    } else if (time < duration) {
      anchor.hasFiredIterationEvent = false;
    }

    anchor.previousTime = time;
  }
}
