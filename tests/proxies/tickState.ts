import type { AnimationState } from "../../src/states/AnimationState";

/**
 * Runs one frame of a single state the way the animation machine does: the state adds its
 * synchronized actions to its sync group, the group advances, then the state ticks.
 */
export function tickState(state: AnimationState, deltaTime: number): void {
  state["prepareTickInternal"]();
  state.syncGroup["advanceInternal"](deltaTime);
  state["onTickInternal"](deltaTime);
}
