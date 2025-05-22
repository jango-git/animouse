import type { AnimationAction } from "three";
import { MathUtils } from "three";
import { AnimationState } from "./AnimationState";
import { AnimationStateEvent } from "./AnimationStateEvent";
import { powerSymbol, updateSymbol } from "./symbols";

const MIN_ACTION_COUNT = 2;

/**
 * Represents an animation action and its corresponding value in the 1D animation space.
 *
 * @interface Action
 */
export interface State1Action {
  action: AnimationAction;
  value: number;
}

interface Anchor {
  action: AnimationAction;
  value: number;

  duration: number;
  previousTime: number;
}

/**
 * Manages a one-dimensional blend space between multiple animations.
 * This class can control and blend between multiple animations arranged along a 1D axis.
 *
 * @class AnimationState1D
 * @extends {AnimationState}
 */
export class AnimationState1D extends AnimationState {
  private readonly anchors: Anchor[] = [];
  private mostActiveAction: Anchor;
  private hasEmittedIterationEvent = false;
  private powerInternal = 0;
  private blend = 0;

  /**
   * Creates an instance of AnimationState1D.
   * The actions will be sorted by their value to create a continuous 1D blend space.
   *
   * @param {State1Action[]} actions - Array of animation actions and their positions in the 1D space.
   * Must contain at least 2 actions.
   * @throws {Error} If less than 2 actions are provided
   */
  constructor(actions: State1Action[]) {
    super();
    if (actions.length < MIN_ACTION_COUNT) {
      throw new Error("Need at least 2 actions");
    }

    for (const action of actions) {
      this.anchors.push({
        action: action.action,
        value: action.value,
        duration: action.action.getClip().duration,
        previousTime: 0,
      });
      action.action.time = 0;
      action.action.weight = 0;
    }

    this.anchors.sort((a, b) => a.value - b.value);

    const first = this.anchors[0];
    const last = this.anchors[this.anchors.length - 1];

    first.value = 0;
    last.value = 1;

    this.mostActiveAction = first;
  }

  public get progress(): number {
    return MathUtils.clamp(
      this.mostActiveAction.action.time / this.mostActiveAction.duration,
      0,
      1,
    );
  }

  /**
   * Gets the current power level of all animations in the blend space.
   * A power of 0 means all animations are stopped, while 1 means full strength.
   *
   * @returns {number} The current power value between 0 and 1
   */
  public get power(): number {
    return this.powerInternal;
  }

  /**
   * Sets the power level of all animations in the blend space.
   * When power changes from 0 to positive, relevant animations start playing.
   * When power changes from positive to 0, all animations stop.
   *
   * @param {number} value - The desired power value (will be clamped between 0 and 1)
   * @emits {AnimationStateEvent.ENTER} When power changes from 0 to positive
   * @emits {AnimationStateEvent.EXIT} When power changes from positive to 0
   */
  public set [powerSymbol](value: number) {
    const clampedValue = MathUtils.clamp(value, 0, 1);

    if (this.powerInternal !== clampedValue) {
      if (this.powerInternal === 0 && clampedValue > 0) {
        this.emit(AnimationStateEvent.ENTER, this);
      } else if (this.powerInternal > 0 && clampedValue === 0) {
        this.emit(AnimationStateEvent.EXIT, this);
      }

      this.powerInternal = clampedValue;
      this.updateAnimationActions();
    }
  }

  /**
   * Sets the current position in the 1D blend space.
   * This determines which animations are active and how they are blended.
   *
   * @param {number} value - The position in the blend space (will be clamped between 0 and 1)
   */
  public setBlend(value: number): void {
    this.blend = MathUtils.clamp(value, 0, 1);
    this.updateAnimationActions();
  }

  public [updateSymbol](): void {
    const action = this.mostActiveAction.action;
    const currentTime = action.time;
    const previousTime = this.mostActiveAction.previousTime;
    const duration = this.mostActiveAction.duration;

    if (
      currentTime < previousTime ||
      (currentTime >= duration && !this.hasEmittedIterationEvent)
    ) {
      this.emit(AnimationStateEvent.ITERATION, this);
      this.hasEmittedIterationEvent = true;
    } else if (currentTime < duration) {
      this.hasEmittedIterationEvent = false;
    }

    this.mostActiveAction.previousTime = currentTime;
  }

  private updateAnimationActions(): void {
    for (let i = 0; i < this.anchors.length - 1; i++) {
      const left = this.anchors[i];
      const right = this.anchors[i + 1];

      if (this.blend < left.value) {
        this.updateAnimationAction(right.action, 0);
      } else if (this.blend > right.value) {
        this.updateAnimationAction(left.action, 0);
      } else {
        const difference =
          (this.blend - left.value) / (right.value - left.value);
        this.updateAnimationAction(
          left.action,
          (1 - difference) * this.powerInternal,
        );
        this.updateAnimationAction(
          right.action,
          difference * this.powerInternal,
        );
      }
    }

    this.mostActiveAction = this.anchors.reduce((p, c) =>
      p.action.weight > c.action.weight ? p : c,
    );
  }

  /**
   * Updates the weight of a single animation action based on the current state.
   * Handles starting and stopping the animation as needed.
   *
   * @private
   * @param {AnimationAction} action - The animation action to update
   * @param {number} weight - The new weight to set
   */
  private updateAnimationAction(action: AnimationAction, weight: number): void {
    if (weight === 0 && action.weight > 0) {
      action.stop();
    } else if (weight > 0 && action.weight === 0) {
      action.play();
    }
    action.weight = weight;
  }
}
