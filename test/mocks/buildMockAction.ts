import type { AnimationActionLoopStyles } from "three";
import type { FreeformAction } from "../../src/states/FreeformBlendTree";
import type { LinearAction } from "../../src/states/LinearBlendTree";
import type { PolarAction } from "../../src/states/PolarBlendTree";
import { buildMockAnimationAction } from "./buildMockAnimationAction";

export function buildMockLinearAction(
  value: number,
  loop?: AnimationActionLoopStyles,
  duration?: number,
): LinearAction {
  return { action: buildMockAnimationAction(1, loop, duration), value };
}

export function buildMockPolarAction(
  radius: number,
  azimuth: number,
  loop?: AnimationActionLoopStyles,
  duration?: number,
): PolarAction {
  return {
    action: buildMockAnimationAction(1, loop, duration),
    radius,
    azimuth,
  };
}

export function buildMockFreeformAction(
  x: number,
  y: number,
  loop?: AnimationActionLoopStyles,
  duration?: number,
): FreeformAction {
  return {
    action: buildMockAnimationAction(1, loop, duration),
    x,
    y,
  };
}
