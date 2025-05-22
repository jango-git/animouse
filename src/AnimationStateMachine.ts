import type { AnimationMixer } from "three";
import { MathUtils } from "three";
import type { AnimationState } from "./AnimationState";
import { AnimationStateEvent } from "./AnimationStateEvent";

/**
 * Function type for evaluating transition conditions.
 * Returns true if the transition should be allowed to occur.
 * 
 * @callback Condition
 * @param {...unknown[]} args - Arguments passed to evaluate the condition
 * @returns {boolean} True if the transition should occur, false otherwise
 */
type Condition = (...args: unknown[]) => boolean;

/**
 * Configuration for event-triggered transitions between animation states.
 * 
 * @interface AnimationEventTransition
 */
export interface AnimationEventTransition {
  /** Optional source state. If not specified, transition can occur from any state */
  from?: AnimationState;
  /** Target state to transition to */
  to: AnimationState;
  /** Duration of the transition in seconds */
  duration: number;
  /** Optional condition that must be met for the transition to occur */
  condition?: Condition;
}

/**
 * Configuration for automatic transitions that occur at the end of animations.
 * 
 * @interface AnimationAutomaticTransition
 */
export interface AnimationAutomaticTransition {
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
export interface AnimationDataTransition {
  /** Target state to transition to */
  to: AnimationState;
  /** Duration of the transition in seconds */
  duration: number;
  /** Data to be passed to the condition function */
  data: unknown[];
  /** Condition that determines if the transition should occur */
  condition: Condition;
}

/**
 * Manages complex animation state transitions with support for event-based,
 * automatic, and data-driven transitions. Handles smooth blending between
 * states and maintains proper animation weights throughout transitions.
 * 
 * @class AnimationStateMachine
 */
export class AnimationStateMachine {
  /** The currently active animation state */
  private currentState: AnimationState;

  /** States that are currently fading out during transitions */
  private fadingStates: AnimationState[] = [];

  /** The THREE.js animation mixer used for updating animations */
  private readonly mixer: AnimationMixer;

  /** Map of event names to their possible transitions */
  private readonly eventTransitions: Map<string, AnimationEventTransition[]> = new Map();

  /** Map of states to their automatic transitions that occur at animation end */
  private readonly automaticTransitions: Map<AnimationState, AnimationAutomaticTransition> = new Map();

  /** Map of states to their data-driven transitions */
  private readonly dataTransitions: Map<AnimationState, AnimationDataTransition[]> = new Map();

  /** Time remaining in the current transition */
  private elapsedTime: number;

  /**
   * Creates an instance of AnimationStateMachine.
   * 
   * @param {AnimationState} initialState - The starting animation state
   * @param {AnimationMixer} mixer - The THREE.js animation mixer to use
   */
  constructor(initialState: AnimationState, mixer: AnimationMixer) {
    this.currentState = initialState;
    this.currentState.power = 1;

    this.mixer = mixer;
    this.eventTransitions = new Map();
    this.elapsedTime = 0;
  }

  /**
   * Adds a new event-triggered transition.
   * These transitions occur when specific events are handled by the state machine.
   * 
   * @param {string} event - The event name that triggers this transition
   * @param {AnimationEventTransition} transition - The transition configuration
   */
  public addEventTransition(event: string, transition: AnimationEventTransition): void {
    const transitions = this.eventTransitions.get(event) ?? [];
    this.eventTransitions.set(event, transitions);
    transitions.push(transition);
  }

  /**
   * Adds an automatic transition that occurs when an animation completes.
   * Only one automatic transition can be set per state.
   * 
   * @param {AnimationState} from - The source state for the automatic transition
   * @param {AnimationAutomaticTransition} transition - The transition configuration
   * @throws {Error} If an automatic transition already exists for the source state
   */
  public addAutomaticTransition(from: AnimationState, transition: AnimationAutomaticTransition): void {
    if (this.automaticTransitions.has(from)) {
      throw new Error("Automatic transition already exists");
    }

    this.automaticTransitions.set(from, transition);
    from.on(AnimationStateEvent.ITERATION, this.onStateIteration, this);
  }

  /**
   * Adds a data-driven transition that is evaluated each update.
   * These transitions occur when their condition functions return true.
   * 
   * @param {AnimationState} from - The source state for the data transition
   * @param {AnimationDataTransition} transition - The transition configuration
   */
  public addDataTransition(from: AnimationState, transition: AnimationDataTransition): void {
    const transitions = this.dataTransitions.get(from) ?? [];
    this.dataTransitions.set(from, transitions);
    transitions.push(transition);
  }

  /**
   * Handles an event by checking and executing any valid transitions.
   * 
   * @param {string} eventName - The name of the event to handle
   * @param {...unknown[]} args - Additional arguments passed to transition conditions
   * @returns {boolean} True if a transition was executed, false otherwise
   */
  public handleEvent(eventName: string, ...args: unknown[]): boolean {
    const transitions = [
      ...(this.eventTransitions.get(eventName) || []),
      ...(this.eventTransitions.get("*") || []),
    ];

    for (const { from, to, duration, condition } of transitions) {
      const validFromState = !from || from === this.currentState;
      const validCondition = !condition || condition(...args);
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
    // Update current state
    this.currentState.update(deltaTime);
    
    // Update all fading states
    for (const state of this.fadingStates) {
      state.update(deltaTime);
    }

    const transition = this.dataTransitions
      .get(this.currentState)
      ?.find((transition) => transition.condition(...transition.data));

    if (transition) {
      this.transitionTo(transition.to, transition.duration);
    }

    if (this.elapsedTime > 0) {
      const t = Math.min(1, deltaTime / this.elapsedTime);

      for (const state of this.fadingStates) {
        state.power = MathUtils.lerp(state.power, 0, t);
      }

      this.currentState.power = MathUtils.lerp(this.currentState.power, 1, t);
      this.elapsedTime = Math.max(0, this.elapsedTime - deltaTime);

      if (this.elapsedTime === 0) {
        for (const state of this.fadingStates) {
          state.power = 0;
        }
        this.fadingStates = [];
        this.currentState.power = 1;
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
    if (this.currentState === state) {
      return;
    }
    this.fadingStates = this.fadingStates.filter((s) => s !== state);

    this.fadingStates.push(this.currentState);
    this.currentState = state;

    this.elapsedTime = duration;
  }

  /**
   * Handles animation iteration events for automatic transitions.
   * 
   * @private
   * @param {AnimationState} state - The state that completed an iteration
   */
  private onStateIteration(state: AnimationState): void {
    if (state === this.currentState) {
      const transition = this.automaticTransitions.get(this.currentState);
      if (transition) {
        this.transitionTo(transition.to, transition.duration);
      }
    }
  }
}