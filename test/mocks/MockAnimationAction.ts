import { AnimationActionLoopStyles, AnimationClip, LoopRepeat } from "three";

export class MockAnimationAction {
  public time = 0;
  public weight = 0;
  public loop: AnimationActionLoopStyles = LoopRepeat;
  private clip: AnimationClip;
  private isPlaying = false;

  constructor(duration = 1.0, loop: AnimationActionLoopStyles = LoopRepeat) {
    this.loop = loop;
    this.clip = { duration } as AnimationClip;
  }

  play(): void {
    this.isPlaying = true;
  }

  stop(): void {
    this.isPlaying = false;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  getClip(): AnimationClip {
    return this.clip;
  }

  public enabled = true;
  public paused = false;
  public timeScale = 1;
  public repetitions = Infinity;
  public clampWhenFinished = false;
  public zeroSlopeAtStart = true;
  public zeroSlopeAtEnd = true;
}
