/**
 * Defines events related to a blend state and its internal AnimationActions.
 *
 * - ENTER and EXIT describe when the blend state itself becomes active or inactive in the state machine.
 * - PLAY, STOP, ITERATE, and FINISH describe the lifecycle of individual AnimationActions inside this blend state.
 */
export enum AnimationStateEvent {
  /**
   * Fired when the blend state itself becomes active.
   * Indicates that a transition into this state has started.
   */
  ENTER = "enter",

  /**
   * Fired when the blend state itself becomes inactive.
   * Indicates that a transition away from this state has started.
   */
  EXIT = "exit",

  /**
   * Fired when an individual AnimationAction inside this blend state starts playing.
   * For example, when a walk or run action becomes active due to weights.
   */
  PLAY = "play",

  /**
   * Fired when an individual AnimationAction inside this blend state stops playing.
   * For example, when a walk or run action stops as its weights reach zero.
   */
  STOP = "stop",

  /**
   * Fired when an individual AnimationAction inside this blend state completes one full loop.
   * Fires every cycle for looping actions (LoopRepeat, LoopPingPong).
   */
  ITERATE = "iterate",

  /**
   * Fired when an individual AnimationAction inside this blend state reaches its natural end.
   * This applies to non-looping actions (LoopOnce) that finish playing completely.
   */
  FINISH = "finish",
}
