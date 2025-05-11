import { Emitter } from "eventail";
import { AnimationAction, MathUtils } from "three";
import { AnimationStateEvent } from "./AnimationStateEvent";

export type Action = {
  action: AnimationAction;
  value: number;
};

export class AnimationState1D extends Emitter {
  private actions: Action[] = [];
  private powerPrivate = 0;
  private blend = 0;

  public constructor(actions: Action[]) {
    super();
    if (actions.length < 2) throw new Error("Need at least 2 actions");

    for (const action of actions) {
      this.actions.push(action);
      action.action.weight = 0;
    }

    this.actions.sort((a, b) => a.value - b.value);

    const first = this.actions[0];
    const last = this.actions[this.actions.length - 1];

    if (!first || !last) {
      throw new Error("Invalid animation action");
    }

    first.value = 0;
    last.value = 1;
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

  public setBlend(value: number): void {
    this.blend = MathUtils.clamp(value, 0, 1);
    this.update();
  }

  private updateAction(action: AnimationAction, weight: number): void {
    if (weight === 0 && action.weight > 0) action.stop();
    else if (weight > 0 && action.weight === 0) action.play();
    action.weight = weight;
  }

  private update(): void {
    for (let i = 0; i < this.actions.length - 1; i++) {
      const left = this.actions[i];
      const right = this.actions[i + 1];

      if (!left || !right) {
        throw new Error("Invalid animation action");
      }

      if (this.blend < left.value) {
        this.updateAction(right.action, 0);
      } else if (this.blend > right.value) {
        this.updateAction(left.action, 0);
      } else {
        const difference =
          (this.blend - left.value) / (right.value - left.value);
        this.updateAction(left.action, (1 - difference) * this.powerPrivate);
        this.updateAction(right.action, difference * this.powerPrivate);
      }
    }
  }
}
