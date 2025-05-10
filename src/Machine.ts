import { AnimationMixer, MathUtils } from "three";
import { State } from "./State";
import { State1D } from "./State1D";
import { State2D } from "./State2D";

type AnyState = State | State1D | State2D;

interface ITransition {
  from: AnyState | null;
  to: AnyState;
  condition: (...args: unknown[]) => boolean;
  duration: number;
}

/**
 * A finite state machine for managing animation state transitions with blending
 * @class
 */
export class Machine {
  private currentState: AnyState;
  private readonly fadingStates: AnyState[] = [];

  private readonly mixer: AnimationMixer;
  private readonly transitions: Map<string, ITransition[]> = new Map();
  private elapsedTime: number;

  /**
   * Creates a new animation state machine
   * @param {AnyState} initialState - The starting state for the machine
   * @param {AnimationMixer} mixer - Three.js animation mixer to drive updates
   */
  public constructor(initialState: AnyState, mixer: AnimationMixer) {
    this.currentState = initialState;
    this.currentState.power = 1;

    this.mixer = mixer;
    this.transitions = new Map();
    this.elapsedTime = 0;
  }

  /**
   * Adds a new transition between states
   * @param {AnyState | null} from - Source state (null for any state)
   * @param {AnyState} to - Target state
   * @param {number} duration - Transition duration in seconds
   * @param {string} [eventName="*"] - Event name that triggers this transition
   * @param {Function} [condition=()=>true] - Condition callback that must return true
   */
  public addTransition(
    from: AnyState | null,
    to: AnyState,
    duration: number,
    eventName = "*",
    condition = (): boolean => true,
  ): void {
    const transitions = this.transitions.get(eventName) || [];
    this.transitions.set(eventName, transitions);
    transitions.push({ from, to, condition, duration });
  }

  /**
   * Processes an event and checks for valid transitions
   * @param {string} eventName - Name of the event to process
   * @param {unknown} data - Additional data to pass to condition callbacks
   * @returns {boolean} True if a transition occurred, false otherwise
   */
  public handleEvent(eventName: string, data: unknown): boolean {
    const transitions = [
      ...(this.transitions.get(eventName) || []),
      ...(this.transitions.get("*") || []),
    ];

    for (const { from, to, duration, condition } of transitions) {
      const validFromState = !from || from === this.currentState;
      if (validFromState && condition(data)) {
        this.transitionTo(to, duration);
        return true;
      }
    }

    return false;
  }

  /**
   * Updates the state machine and all animations
   * @param {number} deltaTime - Time elapsed since last update in seconds
   * @description Handles:
   * - Transition progress between states
   * - Power level interpolation
   * - Animation mixer updates
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
        for (const state of this.fadingStates) state.power = 0;
        this.fadingStates.length = 0;
        this.currentState.power = 1;
      }
    }

    this.mixer.update(deltaTime);
  }

  /**
   * Initiates a transition to a new state
   * @private
   * @param {AnyState} state - Target state to transition to
   * @param {number} duration - Transition duration in seconds
   */
  private transitionTo(state: AnyState, duration: number): void {
    if (this.currentState === state) return;

    this.fadingStates.splice(
      0,
      this.fadingStates.length,
      ...this.fadingStates.filter((s) => s !== state),
    );

    const lastState = this.currentState;
    this.currentState = state;

    this.fadingStates.push(lastState);
    this.elapsedTime = duration;
  }
}
