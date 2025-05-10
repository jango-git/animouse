import { Emitter } from "eventail";
import { AnimationAction, MathUtils, Vector2 } from "three";
import { EEvent } from "./EEvent";

const MIN_WEIGHT = 0;
const MAX_WEIGHT = 1;

export class State2D extends Emitter {
  private readonly xPositive: AnimationAction;
  private readonly xNegative: AnimationAction;
  private readonly yPositive: AnimationAction;
  private readonly yNegative: AnimationAction;
  private readonly center: AnimationAction;
  private rawPower: number;
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

  public get power(): number {
    return this.rawPower;
  }

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

  public setBlend(x: number, y: number): void {
    this.blend.set(x, y);
    this.blend.clampLength(0, 1);
    this.update();
  }

  private updateAction(action: AnimationAction, weight: number): void {
    if (weight === MIN_WEIGHT && action.weight > MIN_WEIGHT) action.stop();
    else if (weight > MIN_WEIGHT && action.weight === MIN_WEIGHT) action.play();
    action.weight = weight;
  }

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
