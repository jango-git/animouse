import { Emitter } from "eventail";
import { AnimationAction, MathUtils, Vector2 } from "three";
import { EEvent } from "./EEvent";

const MIN_WEIGHT = 0;
const MAX_WEIGHT = 1;

/**
 * A 2D animation state machine that blends between directional animations
 * based on a 2D blend vector and power level. Emits events when entering/exiting active state.
 * @extends Emitter
 */
export class State2D extends Emitter {
  private readonly xPositive: AnimationAction;
  private readonly xNegative: AnimationAction;
  private readonly yPositive: AnimationAction;
  private readonly yNegative: AnimationAction;
  private readonly center: AnimationAction;
  private rawPower: number;
  private blend: Vector2;

  /**
   * Creates a new State2D instance for controlling directional animations
   * @param {AnimationAction} xPositive - Action for positive X direction (right)
   * @param {AnimationAction} xNegative - Action for negative X direction (left)
   * @param {AnimationAction} yPositive - Action for positive Y direction (up/forward)
   * @param {AnimationAction} yNegative - Action for negative Y direction (down/backward)
   * @param {AnimationAction} center - Action for neutral/center position
   */
  public constructor(
    xPositive: AnimationAction,
    xNegative: AnimationAction,
    yPositive: AnimationAction,
    yNegative: AnimationAction,
    center: AnimationAction,
  ) {
    super();

    this.xPositive = xPositive;
    this.xPositive.weight = MIN_WEIGHT;

    this.xNegative = xNegative;
    this.xNegative.weight = MIN_WEIGHT;

    this.yPositive = yPositive;
    this.yPositive.weight = MIN_WEIGHT;

    this.yNegative = yNegative;
    this.yNegative.weight = MIN_WEIGHT;

    this.center = center;
    this.center.weight = MIN_WEIGHT;

    this.rawPower = MIN_WEIGHT;
    this.blend = new Vector2(0, 0);
  }

  /**
   * Gets the current power level affecting all animations
   * @returns {number} Current power level between 0 and 1
   */
  public get power(): number {
    return this.rawPower;
  }

  /**
   * Sets the power level affecting all animations
   * @param {number} newValue - New power level (will be clamped to 0-1)
   * @emits {EEvent.enter} When transitioning from 0 to a positive power level
   * @emits {EEvent.exit} When transitioning from positive power level to 0
   */
  public set power(newValue: number) {
    const clampedValue = MathUtils.clamp(newValue, MIN_WEIGHT, MAX_WEIGHT);
    if (this.rawPower === clampedValue) return;

    if (this.rawPower === MIN_WEIGHT && clampedValue > MIN_WEIGHT) {
      this.emit(EEvent.enter, this);
    } else if (this.rawPower > MIN_WEIGHT && clampedValue === MIN_WEIGHT) {
      this.emit(EEvent.exit, this);
    }

    this.rawPower = clampedValue;
    this.update();
  }

  /**
   * Sets the 2D blend vector determining directional blending
   * @param {number} x - X component of blend vector (-1 to 1)
   * @param {number} y - Y component of blend vector (-1 to 1)
   * @description The vector will be normalized and clamped to unit length
   */
  public setBlend(x: number, y: number): void {
    this.blend.set(x, y);
    this.blend.clampLength(0, 1);
    this.update();
  }

  /**
   * Updates an individual action's state based on new weight
   * @private
   * @param {AnimationAction} action - The animation action to update
   * @param {number} weight - New weight value (0-1)
   */
  private updateAction(action: AnimationAction, weight: number): void {
    if (weight === MIN_WEIGHT && action.weight > MIN_WEIGHT) action.stop();
    else if (weight > MIN_WEIGHT && action.weight === MIN_WEIGHT) action.play();
    action.weight = weight;
  }

  /**
   * Updates all animation weights based on current power and blend values
   * @private
   * @description Implements directional blending logic:
   * - When blend vector length ≈ 0: uses center animation
   * - Otherwise: blends between directional animations based on vector direction
   * - Maintains smooth transitions between all states
   */
  private update(): void {
    const epsilon = Number.EPSILON;
    const squaredLength = this.blend.lengthSq();

    if (squaredLength < epsilon) {
      this.updateAction(this.center, this.power);
      this.updateAction(this.xPositive, MIN_WEIGHT);
      this.updateAction(this.xNegative, MIN_WEIGHT);
      this.updateAction(this.yPositive, MIN_WEIGHT);
      this.updateAction(this.yNegative, MIN_WEIGHT);
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

      const powerX = weightX * this.rawPower;
      const powerY = weightY * this.rawPower;
      const powerC = weightC * this.rawPower;

      this.updateAction(
        this.xPositive,
        normalized.x > MIN_WEIGHT ? powerX : MIN_WEIGHT,
      );
      this.updateAction(
        this.xNegative,
        normalized.x < MIN_WEIGHT ? powerX : MIN_WEIGHT,
      );
      this.updateAction(
        this.yPositive,
        normalized.y > MIN_WEIGHT ? powerY : MIN_WEIGHT,
      );
      this.updateAction(
        this.yNegative,
        normalized.y < MIN_WEIGHT ? powerY : MIN_WEIGHT,
      );
      this.updateAction(this.center, powerC);
    }
  }
}
