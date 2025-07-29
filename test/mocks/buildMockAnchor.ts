import type { AnimationActionLoopStyles } from "three";
import { LoopOnce, LoopRepeat } from "three";
import { AnimationStateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import type { Anchor } from "../../src/mescellaneous/miscellaneous";
import { buildMockAnimationAction } from "./buildMockAnimationAction";

export function buildMockAnchor(
  anchorWeight: number,
  animationWeight: number,
  loop: AnimationActionLoopStyles = LoopRepeat,
  duration = 1.0,
): Anchor {
  const action = buildMockAnimationAction(animationWeight, loop, duration);
  return {
    action,
    weight: anchorWeight,
    previousTime: 0,
    duration: action.getClip().duration,
    hasFiredIterationEvent: false,
    iterationEventType:
      action.loop === LoopOnce
        ? AnimationStateEvent.FINISH
        : AnimationStateEvent.ITERATE,
  };
}
