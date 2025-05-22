import { Emitter } from "eventail";

export abstract class AnimationState extends Emitter {
  public abstract get power(): number;
  public abstract set power(value: number);
}
