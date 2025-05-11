import { Emitter } from "eventail";
import { AnimationAction, MathUtils, Vector2 } from "three";
import { AnimationStateEvent } from "./AnimationStateEvent";

export class AnimationState2D extends Emitter {
  private xPositive: AnimationAction;
  private xNegative: AnimationAction;
  private yPositive: AnimationAction;
  private yNegative: AnimationAction;
  private center: AnimationAction;
  private powerPrivate: number;
  private blend: Vector2;

  public constructor(
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

    this.powerPrivate = 0;
    this.blend = new Vector2(0, 0);
  }

  public get power(): number {
    return this.powerPrivate;
  }

  public set power(value: number) {
    const clampedValue = MathUtils.clamp(value, 0, 1);
    if (this.powerPrivate !== clampedValue) {
      if (this.powerPrivate === 0 && clampedValue > 0) {
        this.emit(AnimationStateEvent.enter, this);
      } else if (this.powerPrivate > 0 && clampedValue === 0) {
        this.emit(AnimationStateEvent.exit, this);
      }

      this.powerPrivate = clampedValue;
      this.update();
    }
  }

  public setBlend(x: number, y: number): void {
    this.blend.set(x, y);
    this.blend.clampLength(0, 1);
    this.update();
  }

  private updateAction(action: AnimationAction, weight: number): void {
    if (weight === 0 && action.weight > 0) action.stop();
    else if (weight > 0 && action.weight === 0) action.play();
    action.weight = weight;
  }

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

      const powerX = weightX * this.powerPrivate;
      const powerY = weightY * this.powerPrivate;
      const powerC = weightC * this.powerPrivate;

      this.updateAction(this.xPositive, normalized.x > 0 ? powerX : 0);
      this.updateAction(this.xNegative, normalized.x < 0 ? powerX : 0);
      this.updateAction(this.yPositive, normalized.y > 0 ? powerY : 0);
      this.updateAction(this.yNegative, normalized.y < 0 ? powerY : 0);
      this.updateAction(this.center, powerC);
    }
  }
}
