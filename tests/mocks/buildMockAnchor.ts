import type { AnimationActionLoopStyles } from "three";
import { LoopOnce, LoopRepeat } from "three";
import { AnimationStateEvent } from "../../src/miscellaneous/AnimationStateEvent";
import { getNextAnchorIndex, type Anchor } from "../../src/miscellaneous/miscellaneous";
import { buildMockAnimationAction } from "./buildMockAnimationAction";

export function buildMockAnchor(
  anchorWeight: number,
  animationWeight: number,
  loop: AnimationActionLoopStyles = LoopRepeat,
  duration = 1.0,
): Anchor {
  const action = buildMockAnimationAction(animationWeight, loop, duration);
  const clipDuration = action.getClip().duration;
  return {
    index: getNextAnchorIndex(),
    action,
    weight: anchorWeight,
    duration: clipDuration,
    invDuration: 1 / clipDuration,
    iterationEventType:
      action.loop === LoopOnce ? AnimationStateEvent.FINISH : AnimationStateEvent.ITERATE,
  };
}
