import { AnimationAction } from "three";
import { StateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import type { Anchor } from "../../src/mescellaneous/miscellaneous";
import { MockAnimationAction } from "./MockAnimationAction";

export class MockAnchor implements Anchor {
  public action: AnimationAction;
  public weight = 0;
  public previousTime = 0;
  public duration = 1.0;
  public hasFiredIterationEvent = false;
  public iterationEventType = StateEvent.ITERATE;

  constructor(weight = 0, duration = 1.0) {
    this.action = new MockAnimationAction() as any;
    this.weight = weight;
    this.duration = duration;
  }
}
