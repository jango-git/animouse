import type { AnimationActionLoopStyles } from "three";
import { LoopOnce, LoopRepeat } from "three";
import { StateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import type { Anchor } from "../../src/mescellaneous/miscellaneous";
import type { FreeformAnchor } from "../../src/states/FreeformBlendTree";
import type { LinearAnchor } from "../../src/states/LinearBlendTree";
import type { PolarAnchor } from "../../src/states/PolarBlendTree";
import { buildMockAnimationAction } from "./buildMockAnimationAction";

export function buildMockAnchor(
  weight = 0,
  loop: AnimationActionLoopStyles = LoopRepeat,
  duration = 1.0,
): Anchor {
  const action = buildMockAnimationAction(loop, duration);
  return {
    action,
    weight,
    previousTime: 0,
    duration: action.getClip().duration,
    hasFiredIterationEvent: false,
    iterationEventType:
      action.loop === LoopOnce ? StateEvent.FINISH : StateEvent.ITERATE,
  };
}

export function buildMockLinearAnchor(
  weight = 0,
  loop: AnimationActionLoopStyles = LoopRepeat,
  duration = 1.0,
): LinearAnchor {
  const action = buildMockAnimationAction(loop, duration);
  return {
    action,
    weight,
    previousTime: 0,
    duration: action.getClip().duration,
    hasFiredIterationEvent: false,
    iterationEventType:
      action.loop === LoopOnce ? StateEvent.FINISH : StateEvent.ITERATE,
    value: 0,
  };
}

export function buildMockRadialAnchor(
  weight = 0,
  loop: AnimationActionLoopStyles = LoopRepeat,
  duration = 1.0,
): PolarAnchor {
  const action = buildMockAnimationAction(loop, duration);
  return {
    action,
    weight,
    previousTime: 0,
    duration: action.getClip().duration,
    hasFiredIterationEvent: false,
    iterationEventType:
      action.loop === LoopOnce ? StateEvent.FINISH : StateEvent.ITERATE,
    radius: 0,
    azimuth: 0,
  };
}

export function buildMockFreeformAnchor(
  weight = 0,
  loop: AnimationActionLoopStyles = LoopRepeat,
  duration = 1.0,
): FreeformAnchor {
  const action = buildMockAnimationAction(loop, duration);
  return {
    action,
    weight,
    previousTime: 0,
    duration: action.getClip().duration,
    hasFiredIterationEvent: false,
    iterationEventType:
      action.loop === LoopOnce ? StateEvent.FINISH : StateEvent.ITERATE,
    x: 0,
    y: 0,
  };
}
