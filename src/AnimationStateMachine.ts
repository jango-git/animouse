import type { AnimationMixer} from "three";
import { MathUtils } from "three";
import type { AnimationState } from "./AnimationState";

type Condition = (...args: unknown[]) => boolean;

interface ITransition {
  from?: AnimationState;
  to: AnimationState;
  duration: number;
  condition?: Condition;
}

export class AnimationStateMachine {
  private currentState: AnimationState;
  private fadingStates: AnimationState[] = [];
  private readonly mixer: AnimationMixer;
  private readonly transitions: Map<string, ITransition[]> = new Map();
  private elapsedTime: number;

  constructor(initialState: AnimationState, mixer: AnimationMixer) {
    this.currentState = initialState;
    this.currentState.power = 1;

    this.mixer = mixer;
    this.transitions = new Map();
    this.elapsedTime = 0;
  }

  public addTransition(event: string, transition: ITransition): void {
    const transitions = this.transitions.get(event) ?? [];
    this.transitions.set(event, transitions);
    transitions.push(transition);
  }

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

  private transitionTo(state: AnimationState, duration: number): void {
    if (this.currentState === state) {return;}
    this.fadingStates = this.fadingStates.filter((s) => s !== state);

    this.fadingStates.push(this.currentState);
    this.currentState = state;

    this.elapsedTime = duration;
  }
}
