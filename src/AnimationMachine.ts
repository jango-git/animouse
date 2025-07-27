import type { AnimationMixer } from "three";
import { MathUtils } from "three";
import { StateEvent } from "./mescellaneous/AnimationStateEvent";
import { assertValidNonNegativeNumber } from "./mescellaneous/assertions";
import type { AnimationState } from "./states/AnimationState";

/* eslint-disable @typescript-eslint/no-explicit-any -- Using any here for generic condition function arguments */
type EventCondition = (
  from: AnimationState | undefined,
  to: AnimationState,
  event: string | number,
  ...args: any[]
) => boolean;

/* eslint-disable @typescript-eslint/no-explicit-any -- Using any here for generic condition function arguments */
type DataCondition = (
  from: AnimationState,
  to: AnimationState,
  ...args: any[]
) => boolean;

/**
 * Configuration for event-triggered transitions between animation states.
 *
 * @interface AnimationEventTransition
 */
export interface EventTransition {
  /** Optional source state. If not specified, transition can occur from any state */
  from?: AnimationState;
  /** Target state to transition to */
  to: AnimationState;
  /** Duration of the transition in seconds */
  duration: number;
  /** Optional condition that must be met for the transition to occur */
  condition?: EventCondition;
}

/**
 * Configuration for automatic transitions that occur at the end of animations.
 *
 * @interface AnimationAutomaticTransition
 */
export interface AutomaticTransition {
  /** Target state to transition to */
  to: AnimationState;
  /** Duration of the transition in seconds */
  duration: number;
}

/**
 * Configuration for data-driven transitions that occur based on condition evaluation.
 *
 * @interface AnimationDataTransition
 */
export interface DataTransition {
  /** Target state to transition to */
  to: AnimationState;
  /** Duration of the transition in seconds */
  duration: number;
  /** Data to be passed to the condition function */
  data: unknown[];
  /** Condition that determines if the transition should occur */
  condition: DataCondition;
}

/**
 * Manages complex animation state transitions with support for event-based,
 * automatic, and data-driven transitions. Handles smooth blending between
 * states and maintains proper animation weights throughout transitions.
 *
 * @class AnimationStateMachine
 */
export class AnimationMachine {
  /** Internal storage for the currently active animation state */
  private currentStateInternal: AnimationState;

  /** States that are currently fading out during transitions */
  private fadingStates: AnimationState[] = [];

  /** The THREE.js animation mixer used for updating animations */
  private readonly mixer: AnimationMixer;

  /** Map of event names to their possible transitions */
  private readonly transitions: Map<string | number, EventTransition[]> =
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
   * Creates an instance of AnimationStateMachine.
   *
   * @param {AnimationState} initialState - The starting animation state
   * @param {AnimationMixer} mixer - The THREE.js animation mixer to use
   */
  constructor(initialState: AnimationState, mixer: AnimationMixer) {
    this.currentStateInternal = initialState;

    this.currentStateInternal["onEnterInternal"]();
    this.currentStateInternal["setInfluenceInternal"](1);

    this.mixer = mixer;
    this.transitions = new Map();
  }

  /**
   * Gets the currently active animation state.
   * @returns {AnimationState} The current animation state
   */
  public get currentState(): AnimationState {
    return this.currentStateInternal;
  }

  /**
   * Adds a new event-triggered transition.
   * These transitions occur when specific events are handled by the state machine.
   *
   * @param {string} event - The event name that triggers this transition
   * @param {EventTransition} transition - The transition configuration
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

    const transitions = this.transitions.get(event) ?? [];

    for (const someTransition of transitions) {
      if (someTransition.from === transition.from) {
        throw new Error("Event animation transition already exists");
      }
    }

    transitions.push(transition);
    this.transitions.set(event, transitions);
  }

  /**
   * Adds an automatic transition that occurs when an animation completes.
   * Only one automatic transition can be set per state.
   *
   * @param {AnimationState} from - The source state for the automatic transition
   * @param {AutomaticTransition} transition - The transition configuration
   * @throws {Error} If an automatic transition already exists for the source state
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
    from.on(StateEvent.ITERATE, this.onStateIteration, this);
    from.on(StateEvent.FINISH, this.onStateIteration, this);
  }

  /**
   * Adds a data-driven transition that is evaluated each update.
   * These transitions occur when their condition functions return true.
   *
   * @param {AnimationState} from - The source state for the data transition
   * @param {DataTransition} transition - The transition configuration
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
   * Handles an event by checking and executing any valid transitions.
   *
   * @param {string | number} event - The name of the event to handle
   * @param {...unknown[]} args - Additional arguments passed to transition conditions
   * @returns {boolean} True if a transition was executed, false otherwise
   */
  public handleEvent(event: string | number, ...args: unknown[]): boolean {
    const transitions = this.transitions.get(event);
    if (transitions === undefined) {
      throw new Error(`No transitions found for event '${event}'`);
    }

    for (const { from, to, duration, condition } of transitions) {
      const validFromState = !from || from === this.currentStateInternal;
      const validCondition = !condition || condition(from, to, event, ...args);
      if (validFromState && validCondition) {
        this.transitionTo(to, duration);
        return true;
      }
    }

    return false;
  }

  /**
   * Updates the animation state machine and all animations.
   * Evaluates data-driven transitions, updates transition progress,
   * and updates the animation mixer.
   *
   * @param {number} deltaTime - Time in seconds since the last update
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
          ...transition.data,
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
    if (this.currentStateInternal === state) {
      return;
    }
    this.fadingStates = this.fadingStates.filter((s) => s !== state);

    this.fadingStates.push(this.currentStateInternal);
    this.currentStateInternal["onExitInternal"]();

    this.currentStateInternal = state;
    this.currentStateInternal["onEnterInternal"]();

    this.transitionElapsedTime = duration;
  }

  /**
   * Handles animation iteration events for automatic transitions.
   *
   * @private
   * @param {AnimationState} state - The state that completed an iteration
   */
  private onStateIteration(state: AnimationState): void {
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
