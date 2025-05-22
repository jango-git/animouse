/**
 * Enum representing animation state transition events.
 * These events are emitted when an animation state's power level transitions between zero and non-zero.
 * 
 * @enum {string}
 */
export enum AnimationStateEvent {
  /**
   * Emitted when an animation state's power changes from 0 to a positive value.
   * This indicates that the animation is beginning to have an influence.
   */
  ENTER = "ENTER",

  /**
   * Emitted when an animation state's power changes from a positive value to 0.
   * This indicates that the animation has completely faded out.
   */
  EXIT = "EXIT",
}