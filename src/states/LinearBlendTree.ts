import { LoopOnce, MathUtils, type AnimationAction } from "three";
import { StateEvent } from "../mescellaneous/AnimationStateEvent";
import type { Anchor } from "../mescellaneous/miscellaneous";
import { AnimationTree } from "./AnimationTree";

export interface LinearAction {
  action: AnimationAction;
  value: number;
}

interface LinearAnchor extends Anchor {
  value: number;
}

export class LinearBlendTree extends AnimationTree {
  private readonly anchors: LinearAnchor[] = [];
  private blend = 0;

  constructor(actions: LinearAction[]) {
    super();
    if (actions.length < 2) {
      throw new Error("Need at least 2 actions");
    }

    for (const action of actions) {
      this.anchors.push({
        action: action.action,
        value: action.value,
        duration: action.action.getClip().duration,
        previousTime: 0,
        hasFiredIterationEvent: false,
        iterationEventType:
          action.action.loop === LoopOnce
            ? StateEvent.FINISH
            : StateEvent.ITERATE,
      });
      action.action.time = 0;
      action.action.weight = 0;
    }

    this.anchors.sort((a, b) => a.value - b.value);
  }

  public setBlend(value: number): void {
    const clampedValue = MathUtils.clamp(
      value,
      this.anchors[0].value,
      this.anchors[this.anchors.length - 1].value,
    );
    if (clampedValue !== this.blend) {
      this.blend = clampedValue;
      this.updateAnchorsInfluence();
    }
  }

  protected ["onTickInternal"](): void {
    for (const anchor of this.anchors) {
      const action = anchor.action;
      const time = action.time;
      const duration = anchor.duration;

      if (
        time < anchor.previousTime ||
        (!anchor.hasFiredIterationEvent && time >= duration)
      ) {
        this.emit(anchor.iterationEventType, action, this);
        anchor.hasFiredIterationEvent = true;
      } else if (time < duration) {
        anchor.hasFiredIterationEvent = false;
      }

      anchor.previousTime = time;
    }
  }

  protected updateAnchorsInfluence(): void {
    for (let i = 0; i < this.anchors.length - 1; i++) {
      const l = this.anchors[i];
      const r = this.anchors[i + 1];

      if (this.blend < l.value) {
        this.updateAnchorWeight(r, 0);
      } else if (this.blend > r.value) {
        this.updateAnchorWeight(l, 0);
      } else {
        const difference = (this.blend - l.value) / (r.value - l.value);
        this.updateAnchorWeight(l, (1 - difference) * this.influenceInternal);
        this.updateAnchorWeight(r, difference * this.influenceInternal);
      }
    }
  }
}
