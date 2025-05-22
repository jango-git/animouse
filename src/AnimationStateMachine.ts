import type { AnimationMixer} from "three";
import { MathUtils } from "three";
import type { AnimationState } from "./AnimationState";

/**
 * Function type for evaluating transition conditions.
 * Returns true if the transition should be allowed to occur.
 * 
 * @callback Condition
 * @param {...unknown[]} args - Arguments passed to the event handler
 * @returns {boolean} True if the transition should occur, false otherwise
 */
type Condition = (...args: unknown[]) => boolean;

/**
 * Interface describing a transition between animation states.
 * 
 * @interface ITransition
 */
interface ITransition {
  /**
   * The source state of the transition.
   * If undefined, the transition can occur from any state.
   */
  from?: AnimationState;

  /**
   * The destination state of the transition.
   */
  to: AnimationState;

  /**
   * The duration of the transition in seconds.
   * This determines how long it takes to blend from the source to destination state.
   */
  duration: number;

  /**
   * Optional condition that must be met for the transition to occur.
   * If undefined, the transition can occur whenever the event is triggered.
   */
  condition?: Condition;
}

/**
 * Manages transitions between animation states in response to events.
 * This class handles the logic for switching between different animation states,
 * including smooth blending transitions over time.
 * 
 * @class AnimationStateMachine
 */
export class AnimationStateMachine {
  /** The currently active animation state */
  private currentState: AnimationState;

  /** States that are currently fading out */
  private fadingStates: AnimationState[] = [];

  /** The THREE.js animation mixer used for updating animations */
  private readonly mixer: AnimationMixer;

  /** Map of event names to their possible transitions */
  private readonly transitions: Map<string, ITransition[]> = new Map();

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
    this.transitions = new Map();
    this.elapsedTime = 0;
  }

  /**
   * Adds a new transition that can be triggered by an event.
   * 
   * @param {string} event - The event name that triggers this transition
   * @param {ITransition} transition - The transition configuration
   */
  public addTransition(event: string, transition: ITransition): void {
    const transitions = this.transitions.get(event) ?? [];
    this.transitions.set(event, transitions);
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
      ...(this.transitions.get(eventName) || []),
      ...(this.transitions.get("*") || []),
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
   * This should be called every frame with the time delta.
   * 
   * @param {number} deltaTime - Time in seconds since the last update
   */
  public update(deltaTime: number): void {
    if (this.elapsedTime > 0) {
      const t = Math.min(1, deltaTime / this.elapsedTime);

      for (const state of this.fadingStates) {
        state.power = MathUtils.lerp(state.power, 0, t);
      }

      this.currentState.power = MathUtils.lerp(this.currentState.power, 1, t);
      this.elapsedTime = Math.max(0, this.elapsedTime - deltaTime);

      if (this.elapsedTime === 0) {
        for (const state of this.fadingStates) {state.power = 0;}
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
    if (this.currentState === state) {return;}
    this.fadingStates = this.fadingStates.filter((s) => s !== state);

    this.fadingStates.push(this.currentState);
    this.currentState = state;

    this.elapsedTime = duration;
  }
}