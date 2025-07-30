import type { AnimationAction, AnimationMixer } from "three";
import { MathUtils } from "three";
import { AnimationStateEvent } from "./mescellaneous/AnimationStateEvent";
import { assertValidNonNegativeNumber } from "./mescellaneous/assertions";
import type { AnimationState } from "./states/AnimationState";

/**
 * Condition function for event-triggered transitions.
 * Determines whether a transition should occur based on event context.
 *
 * @param from - Source state (undefined if transition can occur from any state)
 * @param to - Target state for the transition
 * @param event - Event name or identifier that triggered the evaluation
 * @param args - Additional arguments passed with the event
 * @returns True if the transition should occur, false otherwise
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- Using any here for generic condition function arguments */
type EventCondition = (
  from: AnimationState | undefined,
  to: AnimationState,
  event: string | number,
  ...args: any[]
) => boolean;

/**
 * Condition function for data-driven transitions.
 * Evaluated continuously to determine if automatic transitions should occur.
 *
 * @param from - Source state where the transition originates
 * @param to - Target state for the transition
 * @param args - Additional data arguments for condition evaluation
 * @returns True if the transition should occur, false otherwise
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- Using any here for generic condition function arguments */
type DataCondition = (
  from: AnimationState,
  to: AnimationState,
  ...args: any[]
) => boolean;

/**
 * Configuration for event-triggered transitions between animation states.
 * These transitions occur when specific events are handled by the state machine.
 */
export interface EventTransition {
  /** Optional source state. If not specified, transition can occur from any state */
  from?: AnimationState;
  /** Target state to transition to */
  to: AnimationState;
  /** Duration of the transition in seconds (finite non-negative number) */
  duration: number;
  /** Optional condition that must be met for the transition to occur */
  condition?: EventCondition;
}

/**
 * Configuration for automatic transitions that occur at animation completion.
 * These transitions are triggered when ITERATE or FINISH events are emitted.
 */
export interface AutomaticTransition {
  /** Target state to transition to */
  to: AnimationState;
  /** Duration of the transition in seconds (finite non-negative number) */
  duration: number;
}

/**
 * Configuration for data-driven transitions evaluated continuously each update.
 * These transitions occur when their condition functions return true.
 */
export interface DataTransition {
  /** Target state to transition to */
  to: AnimationState;
  /** Duration of the transition in seconds (finite non-negative number) */
  duration: number;
  /** Optional data arguments to be passed to the condition function */
  data?: any[];
  /** Condition function that determines if the transition should occur */
  condition: DataCondition;
}

/**
 * Animation state machine for managing complex state transitions and blending.
 *
 * Provides a comprehensive system for controlling animation states with support for:
 * - **Event-based transitions**: Triggered by specific events with optional conditions
 * - **Automatic transitions**: Triggered when animations complete (ITERATE/FINISH events)
 * - **Data-driven transitions**: Evaluated continuously based on condition functions
 *
 * The state machine handles smooth blending between states using configurable transition
 * durations, automatically managing animation weights and ensuring proper lifecycle events.
 * Multiple states can be active simultaneously during transitions, with weights smoothly
 * interpolated using linear interpolation.
 */
export class AnimationMachine {
  /** Internal storage for the currently active animation state */
  private currentStateInternal: AnimationState;

  /** States that are currently fading out during transitions */
  private fadingStates: AnimationState[] = [];

  /** The THREE.js animation mixer used for updating animations */
  private readonly mixer: AnimationMixer;

  /** Map of event names to their possible transitions */
  private readonly eventTransitions: Map<string | number, EventTransition[]> =
    new Map();

  /** Map of states to their automatic transitions that occur at animation end */
  private readonly automaticTransitions: Map<
    AnimationState,
    AutomaticTransition
  > = new Map();

  /** Map of states to their data-driven transitions */
  private readonly dataTransitions: Map<AnimationState, DataTransition[]> =
    new Map();

  /** Time remaining in the current transition */
  private transitionElapsedTime?: number;

  /**
   * Creates a new animation state machine with the specified initial state.
   * Immediately activates the initial state with full influence and enters it.
   *
   * @param initialState - The starting animation state to activate
   * @param mixer - The THREE.js animation mixer for updating animations
   */
  constructor(initialState: AnimationState, mixer: AnimationMixer) {
    this.currentStateInternal = initialState;

    this.currentStateInternal["onEnterInternal"]();
    this.currentStateInternal["setInfluenceInternal"](1);

    this.mixer = mixer;
    this.eventTransitions = new Map();
  }

  /**
   * Gets the currently active animation state.
   * During transitions, this returns the state being transitioned to.
   *
   * @returns The current active animation state
   */
  public get currentState(): AnimationState {
    return this.currentStateInternal;
  }

  /**
   * Adds a new event-triggered transition to the state machine.
   * Multiple transitions can be registered for the same event with different source states.
   * When an event is handled, the first matching transition will be executed.
   *
   * @param event - The event name or identifier that triggers this transition
   * @param transition - The transition configuration with target state and duration
   * @throws {Error} When transition duration is not a finite non-negative number
   * @throws {Error} When transition creates a recursive loop (from === to)
   * @throws {Error} When transition already exists for the same event and source state
   * @see {@link assertValidNonNegativeNumber} for duration validation details
   */
  public addEventTransition(
    event: string | number,
    transition: EventTransition,
  ): void {
    assertValidNonNegativeNumber(
      transition.duration,
      "Event transition duration",
    );

    if (transition.from === transition.to) {
      throw new Error(
        "Event animation transition can't create a recursive loop to itself",
      );
    }

    const transitions = this.eventTransitions.get(event) ?? [];

    for (const someTransition of transitions) {
      if (someTransition.from === transition.from) {
        throw new Error("Event animation transition already exists");
      }
    }

    transitions.push(transition);
    this.eventTransitions.set(event, transitions);
  }

  /**
   * Adds an automatic transition that occurs when an animation completes.
   * Listens for ITERATE and FINISH events from the source state to trigger transitions.
   * Only one automatic transition can be registered per source state.
   *
   * @param from - The source state that will trigger the automatic transition
   * @param transition - The transition configuration with target state and duration
   * @throws {Error} When transition duration is not a finite non-negative number
   * @throws {Error} When transition creates a recursive loop (from === to)
   * @throws {Error} When an automatic transition already exists for the source state
   * @see {@link assertValidNonNegativeNumber} for duration validation details
   * @see {@link AnimationStateEvent.ITERATE} for iteration event details
   * @see {@link AnimationStateEvent.FINISH} for completion event details
   */
  public addAutomaticTransition(
    from: AnimationState,
    transition: AutomaticTransition,
  ): void {
    assertValidNonNegativeNumber(
      transition.duration,
      "Automatic transition duration",
    );

    if (from === transition.to) {
      throw new Error(
        "Automatic animation transition can't create a recursive loop to itself",
      );
    }

    if (this.automaticTransitions.has(from)) {
      throw new Error("Automatic transition already exists");
    }

    this.automaticTransitions.set(from, transition);
    from.on(AnimationStateEvent.ITERATE, this.onStateIteration, this);
    from.on(AnimationStateEvent.FINISH, this.onStateIteration, this);
  }

  /**
   * Adds a data-driven transition that is evaluated continuously during updates.
   * The condition function is called each frame when the source state is active.
   * Multiple data transitions can be registered per state, but only one per target.
   *
   * @param from - The source state where the transition can originate
   * @param transition - The transition configuration with condition and target state
   * @throws {Error} When transition duration is not a finite non-negative number
   * @throws {Error} When transition creates a recursive loop (from === to)
   * @throws {Error} When a data transition to the same target already exists
   * @see {@link assertValidNonNegativeNumber} for duration validation details
   */
  public addDataTransition(
    from: AnimationState,
    transition: DataTransition,
  ): void {
    assertValidNonNegativeNumber(
      transition.duration,
      "Data transition duration",
    );

    if (from === transition.to) {
      throw new Error(
        "Automatic animation transition can't create a recursive loop to itself",
      );
    }

    const transitions = this.dataTransitions.get(from) ?? [];

    for (const someTransition of transitions) {
      if (someTransition.to === transition.to) {
        throw new Error("Data animation transition already exists");
      }
    }

    transitions.push(transition);
    this.dataTransitions.set(from, transitions);
  }

  /**
   * Handles an event by checking and executing the first matching transition.
   * Evaluates all registered transitions for the event in registration order,
   * executing the first one that matches the current state and passes conditions.
   *
   * @param event - The event name or identifier to handle
   * @param args - Additional arguments passed to transition condition functions
   * @returns True if a transition was executed, false if no matching transition found
   */
  public handleEvent(event: string | number, ...args: unknown[]): boolean {
    const transitions = this.eventTransitions.get(event);
    if (transitions === undefined) {
      return false;
    }

    for (const { from, to, duration, condition } of transitions) {
      const isValidFromState = !from || from === this.currentStateInternal;
      const isValidCondition =
        !condition || condition(from, to, event, ...args);

      if (isValidFromState && isValidCondition) {
        this.transitionTo(to, duration);
        return true;
      }
    }

    return false;
  }

  /**
   * Updates the animation state machine and all animations for one frame.
   *
   * The update process:
   * 1. Updates current state and all fading states with frame timing
   * 2. Evaluates data-driven transitions for potential state changes
   * 3. Progresses active transitions by interpolating state influences
   * 4. Cleans up completed transitions and resets influences
   * 5. Updates the THREE.js animation mixer
   *
   * @param deltaTime - Time elapsed since last update in seconds (finite non-negative number)
   * @throws {Error} When deltaTime is not a finite non-negative number
   * @see {@link assertValidNonNegativeNumber} for deltaTime validation details
   */
  public update(deltaTime: number): void {
    assertValidNonNegativeNumber(deltaTime, "Delta time");

    // Update current state
    this.currentStateInternal["onTickInternal"](deltaTime);

    // Update all fading states
    for (const state of this.fadingStates) {
      state["onTickInternal"](deltaTime);
    }

    const transition = this.dataTransitions
      .get(this.currentStateInternal)
      ?.find((transition) =>
        transition.condition(
          this.currentStateInternal,
          transition.to,
          ...(transition.data ?? []),
        ),
      );

    if (transition) {
      this.transitionTo(transition.to, transition.duration);
    }

    if (this.transitionElapsedTime !== undefined) {
      const t =
        this.transitionElapsedTime === 0
          ? 1
          : Math.min(1, deltaTime / this.transitionElapsedTime);

      for (const state of this.fadingStates) {
        state["setInfluenceInternal"](MathUtils.lerp(state.influence, 0, t));
      }

      this.currentStateInternal["setInfluenceInternal"](
        MathUtils.lerp(this.currentStateInternal.influence, 1, t),
      );
      this.transitionElapsedTime = Math.max(
        0,
        this.transitionElapsedTime - deltaTime,
      );

      if (this.transitionElapsedTime === 0) {
        for (const state of this.fadingStates) {
          state["setInfluenceInternal"](0);
        }
        this.fadingStates = [];
        this.currentStateInternal["setInfluenceInternal"](1);
        this.transitionElapsedTime = undefined;
      }
    }

    this.mixer.update(deltaTime);
  }

  /**
   * Transitions to a new animation state over the specified duration.
   *
   * @private
   * @param {AnimationState} state - The state to transition to
   * @param {number} duration - The duration of the transition in seconds
   */
  private transitionTo(state: AnimationState, duration: number): void {
    if (this.currentStateInternal !== state) {
      this.fadingStates = this.fadingStates.filter((s) => s !== state);

      this.fadingStates.push(this.currentStateInternal);
      this.currentStateInternal["onExitInternal"]();

      this.currentStateInternal = state;
      this.currentStateInternal["onEnterInternal"]();

      this.transitionElapsedTime = duration;
    }
  }

  /**
   * Handles animation iteration events for automatic transitions.
   *
   * @private
   * @param {AnimationState} state - The state that completed an iteration
   */
  private onStateIteration(
    action: AnimationAction,
    state: AnimationState,
  ): void {
    if (state === this.currentStateInternal) {
      const transition = this.automaticTransitions.get(
        this.currentStateInternal,
      );
      if (transition) {
        this.transitionTo(transition.to, transition.duration);
      }
    }
  }
}
