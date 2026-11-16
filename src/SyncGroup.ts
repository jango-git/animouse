import { fract } from "./miscellaneous/miscellaneous.js";

/**
 * Phase shared by the synchronized actions of one or more animation states.
 *
 * The phase is the position in the cycle from 0 to 1. Each frame it advances by
 * `deltaTime * sum(w * timeScale) / sum(w * duration)`, summed over the synchronized actions of
 * the playing states in the group, where `w` is the action weight times the state influence and
 * `timeScale` is the state time scale. States that share a group stay in step through a
 * transition, and a state that enters the group joins at the current phase. The phase restarts
 * from 0 when a state enters the group while no other state of it plays.
 *
 * Every state has its own group unless it is given a shared one.
 *
 * @example
 * ```typescript
 * const locomotion = new SyncGroup();
 * walkTree.syncGroup = locomotion;
 * runTree.syncGroup = locomotion;
 * ```
 *
 * @public
 */
export class SyncGroup {
  /** Phase at the start of the current frame */
  protected frameStartPhase = 0;

  /** Distance the phase moves during the current frame, in cycles */
  protected frameDelta = 0;

  /** Cycles per second of the current frame */
  protected frameRate = 0;

  private phaseInternal = 0;

  /** Number of states of the group with a positive influence */
  private playingStateCount = 0;

  private weightedTimeScaleSum = 0;
  private weightedDurationSum = 0;

  /**
   * Current position in the cycle, in [0, 1).
   */
  public get phase(): number {
    return this.phaseInternal;
  }

  /**
   * Called when a state of the group starts playing. Restarts the phase if no other state of the
   * group plays.
   *
   * @internal Called only by animation states
   */
  protected ["attachInternal"](): void {
    if (this.playingStateCount === 0) {
      this.phaseInternal = 0;
    }
    this.playingStateCount++;
  }

  /**
   * Called when a state of the group stops playing.
   *
   * @internal Called only by animation states
   */
  protected ["detachInternal"](): void {
    this.playingStateCount--;
  }

  /**
   * Adds a synchronized action to the cycle length of the current frame.
   *
   * @param weight - Action weight times the influence of its state
   * @param timeScale - Time scale of the state
   * @param duration - Clip duration in seconds
   * @internal Called only by animation states
   */
  protected ["contributeInternal"](weight: number, timeScale: number, duration: number): void {
    this.weightedTimeScaleSum += weight * timeScale;
    this.weightedDurationSum += weight * duration;
  }

  /**
   * Advances the phase by one frame from the contributions collected since the previous frame.
   *
   * @param deltaTime - Time the mixer advances during this frame, in seconds
   * @internal Called only by the animation state machine
   */
  protected ["advanceInternal"](deltaTime: number): void {
    this.frameRate =
      this.weightedDurationSum > 0 ? this.weightedTimeScaleSum / this.weightedDurationSum : 0;
    this.frameStartPhase = this.phaseInternal;
    this.frameDelta = deltaTime * this.frameRate;
    this.phaseInternal = fract(this.phaseInternal + this.frameDelta);
    this.weightedTimeScaleSum = 0;
    this.weightedDurationSum = 0;
  }
}
