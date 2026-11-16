import { type AnimationAction, LoopOnce, LoopRepeat } from "three";

import { assertValidNumber, assertValidPositiveNumber } from "./assertions.js";
import { type Anchor, fract, getNextAnchorIndex } from "./miscellaneous.js";

/**
 * Stops the action, resets its playback state and builds an anchor for it.
 *
 * @param action - The animation action of the anchor
 * @param isSynchronized - Whether the action follows the phase of its sync group
 * @param phaseOffset - Shift of the action against the sync group phase, in cycles
 * @throws {Error} When the clip duration is not a positive finite number
 * @throws {Error} When the phase offset is not a finite number
 * @throws {Error} When a synchronized action does not use LoopRepeat
 */
export function buildAnchor(
  action: AnimationAction,
  isSynchronized: boolean,
  phaseOffset: number,
): Anchor {
  const duration = action.getClip().duration;
  assertValidPositiveNumber(duration, "Clip duration");
  assertValidNumber(phaseOffset, "Phase offset");

  if (isSynchronized && action.loop !== LoopRepeat) {
    throw new Error("A synchronized action must use LoopRepeat");
  }

  action.stop();
  action.time = 0;
  action.weight = 0;
  action.paused = false;
  action.enabled = false;

  return {
    index: getNextAnchorIndex(),
    action,
    weight: 0,
    duration,
    invDuration: 1 / duration,
    isLoopOnce: action.loop === LoopOnce,
    isSynchronized,
    phaseOffset: fract(phaseOffset),
  };
}
