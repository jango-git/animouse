/**
 * Events related to animation states and their internal AnimationActions.
 *
 * ENTER and EXIT describe when the state becomes active or inactive.
 * PLAY, STOP, ITERATE, and FINISH describe the lifecycle of individual AnimationActions.
 */
export enum AnimationStateEvent {
  /**
   * Fired when the state becomes active.
   */
  ENTER = "enter",

  /**
   * Fired when the state becomes inactive.
   */
  EXIT = "exit",

  /**
   * Fired when an AnimationAction starts playing.
   */
  PLAY = "play",

  /**
   * Fired when an AnimationAction stops playing.
   */
  STOP = "stop",

  /**
   * Fired when an AnimationAction completes one full loop.
   * Fires every cycle for looping actions.
   */
  ITERATE = "iterate",

  /**
   * Fired when an AnimationAction reaches its natural end.
   * Applies to non-looping actions that finish playing completely.
   */
  FINISH = "finish",
}
