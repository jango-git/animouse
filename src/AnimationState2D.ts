import type { AnimationAction } from "three";
import { MathUtils, Vector2 } from "three";
import { AnimationState } from "./AnimationState";
import { AnimationStateEvent } from "./AnimationStateEvent";

/**
 * Manages a two-dimensional blend space between multiple animations.
 * This class controls animations arranged in a 2D space with a center state and four directional states (positive/negative X/Y).
 * 
 * @class AnimationState2D
 * @extends {AnimationState}
 */
export class AnimationState2D extends AnimationState {
  /** Animation action for positive X direction (right) */
  private readonly xPositive: AnimationAction;
  /** Animation action for negative X direction (left) */
  private readonly xNegative: AnimationAction;
  /** Animation action for positive Y direction (up) */
  private readonly yPositive: AnimationAction;
  /** Animation action for negative Y direction (down) */
  private readonly yNegative: AnimationAction;
  /** Animation action for the center/neutral state */
  private readonly center: AnimationAction;
  /** Internal storage for the current power value */
  private powerInternal: number;
  /** Current blend position in 2D space */
  private readonly blend: Vector2;

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

    this.xPositive = xPositive;
    this.xPositive.weight = 0;

    this.xNegative = xNegative;
    this.xNegative.weight = 0;

    this.yPositive = yPositive;
    this.yPositive.weight = 0;

    this.yNegative = yNegative;
    this.yNegative.weight = 0;

    this.center = center;
    this.center.weight = 0;

    this.powerInternal = 0;
    this.blend = new Vector2(0, 0);
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
      this.update();
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
    this.update();
  }

  /**
   * Updates the weight of a single animation action based on the current state.
   * Handles starting and stopping the animation as needed.
   * 
   * @private
   * @param {AnimationAction} action - The animation action to update
   * @param {number} weight - The new weight to set
   */
  private updateAction(action: AnimationAction, weight: number): void {
    if (weight === 0 && action.weight > 0) {
      action.stop();
    } else if (weight > 0 && action.weight === 0) {
      action.play();
    }
    action.weight = weight;
  }

  /**
   * Updates all animation weights based on the current blend and power values.
   * This method handles the actual blending between animations in 2D space.
   * When blend vector is near zero, only the center animation plays.
   * Otherwise, animations are blended based on the direction and magnitude of the blend vector.
   * 
   * @private
   */
  private update(): void {
    const epsilon = 1e-5;
    const squaredLength = this.blend.lengthSq();

    if (squaredLength < epsilon) {
      this.updateAction(this.center, this.power);
      this.updateAction(this.xPositive, 0);
      this.updateAction(this.xNegative, 0);
      this.updateAction(this.yPositive, 0);
      this.updateAction(this.yNegative, 0);
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

      this.updateAction(this.xPositive, normalized.x > 0 ? powerX : 0);
      this.updateAction(this.xNegative, normalized.x < 0 ? powerX : 0);
      this.updateAction(this.yPositive, normalized.y > 0 ? powerY : 0);
      this.updateAction(this.yNegative, normalized.y < 0 ? powerY : 0);
      this.updateAction(this.center, powerC);
    }
  }
}