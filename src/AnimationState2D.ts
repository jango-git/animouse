import type { AnimationAction } from "three";
import { MathUtils, Vector2 } from "three";
import { AnimationState } from "./AnimationState";
import { AnimationStateEvent } from "./AnimationStateEvent";

interface Anchor {
  action: AnimationAction;
  duration: number;
  previousTime: number;
}

/**
 * Manages a two-dimensional blend space between multiple animations.
 * This class controls animations arranged in a 2D space with a center state and four directional states (positive/negative X/Y).
 *
 * @class AnimationState2D
 * @extends {AnimationState}
 */
export class AnimationState2D extends AnimationState {
  private readonly xPositive: Anchor;
  private readonly xNegative: Anchor;
  private readonly yPositive: Anchor;
  private readonly yNegative: Anchor;
  private readonly center: Anchor;

  private mostActiveAction: Anchor;
  private hasEmittedIterationEvent = false;
  private powerInternal = 0;
  private readonly blend: Vector2 = new Vector2(0, 0);

  /**
   * Creates an instance of AnimationState2D.
   * Initializes a 2D blend space with five animations: one for each cardinal direction and one for center.
   *
   * @param {AnimationAction} xPositive - Animation for positive X direction (right)
   * @param {AnimationAction} xNegative - Animation for negative X direction (left)
   * @param {AnimationAction} yPositive - Animation for positive Y direction (up)
   * @param {AnimationAction} yNegative - Animation for negative Y direction (down)
   * @param {AnimationAction} center - Animation for the center/neutral state
   */
  constructor(
    xPositive: AnimationAction,
    xNegative: AnimationAction,
    yPositive: AnimationAction,
    yNegative: AnimationAction,
    center: AnimationAction,
  ) {
    super();

    this.xPositive = {
      action: xPositive,
      duration: xPositive.getClip().duration,
      previousTime: 0,
    };
    this.xPositive.action.time = 0;
    this.xPositive.action.weight = 0;

    this.xNegative = {
      action: xNegative,
      duration: xNegative.getClip().duration,
      previousTime: 0,
    };
    this.xNegative.action.time = 0;
    this.xNegative.action.weight = 0;

    this.yPositive = {
      action: yPositive,
      duration: yPositive.getClip().duration,
      previousTime: 0,
    };
    this.yPositive.action.time = 0;
    this.yPositive.action.weight = 0;

    this.yNegative = {
      action: yNegative,
      duration: yNegative.getClip().duration,
      previousTime: 0,
    };
    this.yNegative.action.time = 0;
    this.yNegative.action.weight = 0;

    this.center = {
      action: center,
      duration: center.getClip().duration,
      previousTime: 0,
    };
    this.center.action.time = 0;
    this.center.action.weight = 0;

    this.mostActiveAction = this.center;
  }

  /**
   * Gets the current progress of the most active animation from start to end.
   *
   * @returns {number} A value between 0 and 1 representing the progress through the animation
   */
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
  public set power(value: number) {
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
   * Sets the current position in the 2D blend space.
   * This determines which animations are active and how they are blended.
   * The position is automatically clamped to a unit circle.
   *
   * @param {number} x - The X coordinate in the blend space
   * @param {number} y - The Y coordinate in the blend space
   */
  public setBlend(x: number, y: number): void {
    this.blend.set(x, y);
    this.blend.clampLength(0, 1);
    this.updateAnimationActions();
  }

  public update(): void {
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

  /**
   * Updates all animation weights based on the current blend and power values.
   * This method handles the actual blending between animations in 2D space.
   * When blend vector is near zero, only the center animation plays.
   * Otherwise, animations are blended based on the direction and magnitude of the blend vector.
   * Also tracks the most active animation for iteration events.
   *
   * @public
   */
  private updateAnimationActions(): void {
    const epsilon = 1e-5;
    const squaredLength = this.blend.lengthSq();

    if (squaredLength < epsilon) {
      this.updateAnimationAction(this.center.action, this.power);
      this.updateAnimationAction(this.xPositive.action, 0);
      this.updateAnimationAction(this.xNegative.action, 0);
      this.updateAnimationAction(this.yPositive.action, 0);
      this.updateAnimationAction(this.yNegative.action, 0);
      this.mostActiveAction = this.center;
    } else {
      const length = Math.sqrt(this.blend.length());
      const normalized = this.blend.clone().divideScalar(length);
      const absX = Math.abs(normalized.x);
      const absY = Math.abs(normalized.y);
      const maxXY = Math.max(absX, absY);
      const sumXY = absX + absY;
      const centerWeight = 1 - maxXY;

      const weightX = sumXY > 0 ? absX / (sumXY + centerWeight) : 0;
      const weightY = sumXY > 0 ? absY / (sumXY + centerWeight) : 0;
      const weightC = 1 - (weightX + weightY);

      const powerX = weightX * this.powerInternal;
      const powerY = weightY * this.powerInternal;
      const powerC = weightC * this.powerInternal;

      this.updateAnimationAction(
        this.xPositive.action,
        normalized.x > 0 ? powerX : 0,
      );
      this.updateAnimationAction(
        this.xNegative.action,
        normalized.x < 0 ? powerX : 0,
      );
      this.updateAnimationAction(
        this.yPositive.action,
        normalized.y > 0 ? powerY : 0,
      );
      this.updateAnimationAction(
        this.yNegative.action,
        normalized.y < 0 ? powerY : 0,
      );
      this.updateAnimationAction(this.center.action, powerC);

      this.mostActiveAction = [
        this.xPositive,
        this.xNegative,
        this.yPositive,
        this.yNegative,
        this.center,
      ].reduce((p, c) => (c.action.weight > p.action.weight ? c : p));
    }
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
