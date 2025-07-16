import { AnimationActionLoopStyles, LoopOnce, LoopRepeat } from "three";
import { StateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import { Anchor } from "../../src/mescellaneous/miscellaneous";
import { FreeformAnchor } from "../../src/states/FreeformBlendTree";
import { LinearAnchor } from "../../src/states/LinearBlendTree";
import { PolarAnchor } from "../../src/states/PolarBlendTree";
import { buildMockAnimationAction } from "./buildMockAnimationAction";

export function buildMockAnchor(
  weight: number = 0,
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
  weight: number = 0,
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
  weight: number = 0,
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
  weight: number = 0,
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
