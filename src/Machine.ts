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

export class Machine {
  private currentState: AnyState;
  private readonly fadingStates: AnyState[] = [];

  private readonly mixer: AnimationMixer;
  private readonly transitions: Map<string, ITransition[]> = new Map();
  private elapsedTime: number;

  public constructor(initialState: AnyState, mixer: AnimationMixer) {
    this.currentState = initialState;
    this.currentState.power = 1;

    this.mixer = mixer;
    this.transitions = new Map();
    this.elapsedTime = 0;
  }

  public addTransition(
    from: AnyState | null,
    to: AnyState,
    duration: number,
    eventName = "*",
    condition = () => true,
  ) {
    const transitions = this.transitions.get(eventName) || [];
    this.transitions.set(eventName, transitions);
    transitions.push({ from, to, condition, duration });
  }

  public handleEvent(eventName: string, data: any) {
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

  private transitionTo(state: AnyState, duration: number) {
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

  public update(deltaTime: number) {
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
}
