import type { AnimationActionLoopStyles } from "three";
import { LoopOnce, LoopRepeat } from "three";
import { AnimationStateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import type { Anchor } from "../../src/mescellaneous/miscellaneous";
import type { FreeformAnchor } from "../../src/states/FreeformBlendTree";
import type { LinearAnchor } from "../../src/states/LinearBlendTree";
import type { PolarAnchor } from "../../src/states/PolarBlendTree";
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

export function buildMockLinearAnchor(
  anchorWeight: number,
  animationWeight: number,
  loop: AnimationActionLoopStyles = LoopRepeat,
  duration = 1.0,
): LinearAnchor {
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
    value: 0,
  };
}

export function buildMockRadialAnchor(
  anchorWeight: number,
  animationWeight: number,
  loop: AnimationActionLoopStyles = LoopRepeat,
  duration = 1.0,
): PolarAnchor {
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
    radius: 0,
    azimuth: 0,
  };
}

export function buildMockFreeformAnchor(
  anchorWeight: number,
  animationWeight: number,
  loop: AnimationActionLoopStyles = LoopRepeat,
  duration = 1.0,
): FreeformAnchor {
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
    x: 0,
    y: 0,
  };
}
