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
  ACTIVATED = "ACTIVATED",

  /**
   * Emitted when an animation state's power changes from a positive value to 0.
   * This indicates that the animation has completely faded out.
   */
  DEACTIVATED = "DEACTIVATED",

  /**
   * Emitted when an animation completes one full iteration of its cycle.
   * This can be used to trigger actions or transitions at natural animation boundaries.
   * For looping animations, this will be emitted each time the animation loops back to the start.
   */
  ITERATION = "ITERATION",

  /**
   * Emitted when a state becomes the current active state in the state machine.
   * This occurs during state transitions before any power/weight changes.
   */
  ENTER = "ENTER",

  /**
   * Emitted when a state is no longer the current active state in the state machine.
   * This occurs during state transitions before the new state is entered.
   */
  EXIT = "EXIT",
}
