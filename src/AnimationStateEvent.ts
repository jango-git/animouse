/**
 * Enum representing animation state transition and lifecycle events.
 * These events are emitted to indicate important state changes in animations.
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

  /**
   * Emitted when an animation completes one full iteration of its cycle.
   * This can be used to trigger actions or transitions at natural animation boundaries.
   * For looping animations, this will be emitted each time the animation loops back to the start.
   */
  ITERATION = "ITERATION",
}