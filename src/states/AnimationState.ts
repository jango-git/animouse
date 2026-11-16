import {
  Ferrsign1,
  Ferrsign2,
  type FerrsignView1,
  type FerrsignView2,
  type Unsubscribe,
} from "ferrsign";
import { type AnimationAction, LoopOnce } from "three";

import { assertValidNonNegativeNumber, assertValidUnitRange } from "../miscellaneous/assertions.js";
import { type Anchor, fract } from "../miscellaneous/miscellaneous.js";
import { SyncGroup } from "../SyncGroup.js";

/**
 * How an action of a state follows the phase of the state's sync group.
 *
 * @public
 */
export interface SyncOptions {
  /**
   * Whether the action plays at the phase of the sync group. A synchronized action must use
   * LoopRepeat. Blend trees synchronize LoopRepeat actions by default, ClipState does not.
   */
  isSynchronized?: boolean;
  /** Shift of the action against the phase, in cycles of its clip. Defaults to 0. */
  phaseOffset?: number;
}

/**
 * Callback of a time event, called with the action that crossed the time and the state that owns
 * it.
 */
export type TimeEventCallback = (action: AnimationAction, state: AnimationState) => void;

/**
 * Callbacks registered at one time of one anchor, with the functions that unsubscribe each of them.
 */
interface TimeEvent {
  signal: Ferrsign2<AnimationAction, AnimationState>;
  unsubscribers: Map<TimeEventCallback, Unsubscribe>;
}

/**
 * Abstract base class for animation states in the animation state machine.
 *
 * A state plays a set of weighted actions. The weight of each action is its weight in the state
 * times the state influence. Synchronized actions play at the phase of the state's sync group,
 * the others at their own time. The state sets `time` and `timeScale` of its actions every
 * frame, so the playback speed is set by `timeScale` of the state.
 *
 * Extended by concrete animation states and controlled by the animation state machine.
 */
export abstract class AnimationState {
  /**
   * The name identifier for this animation state.
   * Used to identify and reference the state within the animation state machine.
   */
  public name = "";

  /**
   * Internal storage for the state's influence value.
   * Represents the weight/contribution of this state in the animation state machine.
   */
  protected influenceInternal = 0;

  protected readonly signalEnterInternal = new Ferrsign1<AnimationState>();
  protected readonly signalExitInternal = new Ferrsign1<AnimationState>();
  protected readonly signalPlayInternal = new Ferrsign2<AnimationAction, AnimationState>();
  protected readonly signalStopInternal = new Ferrsign2<AnimationAction, AnimationState>();
  protected readonly signalIterateInternal = new Ferrsign2<AnimationAction, AnimationState>();
  protected readonly signalFinishInternal = new Ferrsign2<AnimationAction, AnimationState>();

  /**
   * Time events of each anchor, keyed by the unit time rounded to hundredths.
   */
  protected readonly timeEvents = new Map<Anchor, Map<number, TimeEvent>>();

  /** Anchors with a positive weight, before the state influence is applied */
  protected readonly activeAnchors = new Set<Anchor>();

  /** Snapshot of the active anchors for one tick, since event callbacks may change the weights */
  private readonly tickAnchors: Anchor[] = [];

  private timeScaleInternal = 1;
  private syncGroupInternal = new SyncGroup();

  /**
   * Playback speed of the state, 1 by default. It scales the phase rate of synchronized actions
   * and the time scale of the others.
   *
   * @throws {Error} When set to a negative or non-finite number
   */
  public get timeScale(): number {
    return this.timeScaleInternal;
  }

  /**
   * Sync group whose phase the synchronized actions follow. Every state has its own group until
   * a shared one is set.
   *
   * @throws {Error} When set while the state has a positive influence
   */
  public get syncGroup(): SyncGroup {
    return this.syncGroupInternal;
  }

  /**
   * Gets the current influence (weight) of this animation state.
   * The influence determines how much this state contributes to the overall animation.
   *
   * @returns The current influence value, always in range [0, 1]
   */
  public get influence(): number {
    return this.influenceInternal;
  }

  /**
   * Fires when the state becomes active, with the state.
   */
  public get signalEnter(): FerrsignView1<AnimationState> {
    return this.signalEnterInternal;
  }

  /**
   * Fires when the state becomes inactive, with the state.
   */
  public get signalExit(): FerrsignView1<AnimationState> {
    return this.signalExitInternal;
  }

  /**
   * Fires when an action of the state starts playing, with the action and the state.
   */
  public get signalPlay(): FerrsignView2<AnimationAction, AnimationState> {
    return this.signalPlayInternal;
  }

  /**
   * Fires when an action of the state stops playing, with the action and the state.
   */
  public get signalStop(): FerrsignView2<AnimationAction, AnimationState> {
    return this.signalStopInternal;
  }

  /**
   * Fires each time a looping action of the state completes a loop, with the action and the
   * state.
   */
  public get signalIterate(): FerrsignView2<AnimationAction, AnimationState> {
    return this.signalIterateInternal;
  }

  /**
   * Fires when a `LoopOnce` action of the state reaches its end, with the action and the state.
   */
  public get signalFinish(): FerrsignView2<AnimationAction, AnimationState> {
    return this.signalFinishInternal;
  }

  public set timeScale(value: number) {
    assertValidNonNegativeNumber(value, "State time scale");
    this.timeScaleInternal = value;
  }

  public set syncGroup(value: SyncGroup) {
    if (this.influenceInternal > 0) {
      throw new Error(`${this.name}: cannot change the sync group of a playing state`);
    }
    this.syncGroupInternal = value;
  }

  /**
   * Called by the animation state machine when entering this state.
   * Emits signalEnter with this state instance as data.
   *
   * @internal Called only by the animation state machine
   */
  protected ["onEnterInternal"](): void {
    this.signalEnterInternal.emit(this);
    if (this.influenceInternal > 0) {
      for (const anchor of this.activeAnchors) {
        this.resetFinishedAction(anchor);
      }
    }
  }

  /**
   * Called by the animation state machine when exiting this state.
   * Emits signalExit with this state instance as data.
   *
   * @internal Called only by the animation state machine
   */
  protected ["onExitInternal"](): void {
    this.signalExitInternal.emit(this);
  }

  /**
   * Registers a time event callback for an anchor.
   * The unit time is rounded to hundredths, so callbacks at nearby times share one event.
   *
   * @param anchor - The animation anchor to associate the time event with
   * @param unitTime - Time in unit range [0, 1] when the event should fire
   * @param callback - Function to call when the time event occurs
   * @param isOnce - Whether the event should fire only once or repeatedly
   * @internal Called only by concrete animation state implementations
   */
  protected onTimeEventInternal(
    anchor: Anchor,
    unitTime: number,
    callback: TimeEventCallback,
    isOnce: boolean,
  ): void {
    assertValidUnitRange(unitTime, "Unit time");
    const roundedTime = Math.round(unitTime * 100) / 100;

    let events = this.timeEvents.get(anchor);
    if (events === undefined) {
      events = new Map<number, TimeEvent>();
      this.timeEvents.set(anchor, events);
    }

    let event = events.get(roundedTime);
    if (event === undefined) {
      event = { signal: new Ferrsign2(), unsubscribers: new Map() };
      events.set(roundedTime, event);
    }

    const unsubscribe = isOnce ? event.signal.once(callback) : event.signal.on(callback);
    event.unsubscribers.set(callback, unsubscribe);
  }

  /**
   * Unregisters a time event callback.
   * Does nothing if the callback is not registered at that time. Drops the time event once it has
   * no callbacks left.
   *
   * @param anchor - The animation anchor to remove the time event from
   * @param unitTime - Time in unit range [0, 1] where the event was registered
   * @param callback - The callback function to remove
   * @internal Called only by concrete animation state implementations
   */
  protected offTimeEventInternal(
    anchor: Anchor,
    unitTime: number,
    callback: TimeEventCallback,
  ): void {
    assertValidUnitRange(unitTime, "Unit time");
    const roundedTime = Math.round(unitTime * 100) / 100;
    const events = this.timeEvents.get(anchor);
    const event = events?.get(roundedTime);
    const unsubscribe = event?.unsubscribers.get(callback);
    if (events === undefined || event === undefined || unsubscribe === undefined) {
      return;
    }

    unsubscribe();
    event.unsubscribers.delete(callback);
    if (event.unsubscribers.size === 0) {
      events.delete(roundedTime);
      if (events.size === 0) {
        this.timeEvents.delete(anchor);
      }
    }
  }

  /**
   * Called by the animation state machine to set the state's influence.
   * Joins or leaves the sync group and applies the influence to all active actions.
   *
   * @param influence - The new influence value in range [0, 1]
   * @throws {Error} When influence is not a finite number or is outside the range [0, 1]
   * @internal Called only by the animation state machine
   */
  protected ["setInfluenceInternal"](influence: number): void {
    assertValidUnitRange(influence, "Influence");

    if (influence === this.influenceInternal) {
      return;
    }

    if (this.influenceInternal === 0) {
      this.syncGroupInternal["attachInternal"]();
    } else if (influence === 0) {
      this.syncGroupInternal["detachInternal"]();
    }

    this.influenceInternal = influence;
    this.updateAnchorsInfluence();
  }

  /**
   * Called by the animation state machine before the sync groups advance. Adds the synchronized
   * actions to the cycle length of the sync group.
   *
   * @internal Called only by the animation state machine
   */
  protected ["prepareTickInternal"](): void {
    for (const anchor of this.activeAnchors) {
      if (anchor.isSynchronized) {
        this.syncGroupInternal["contributeInternal"](
          anchor.weight * this.influenceInternal,
          this.timeScaleInternal,
          anchor.duration,
        );
      }
    }
  }

  /**
   * Called by the animation state machine on each frame update, after the sync groups advance
   * and before the mixer does. Places the actions on the frame and fires their events.
   *
   * @param deltaTime - Time the mixer advances during this frame, in seconds
   * @throws {Error} When the state influence is zero
   * @internal Called only by the animation state machine
   */
  protected ["onTickInternal"](deltaTime: number): void {
    if (this.influenceInternal === 0) {
      throw new Error(
        `${this.name}: cannot update anchor time because the animation influence is zero`,
      );
    }

    const group = this.syncGroupInternal;
    const anchors = this.tickAnchors;
    anchors.length = 0;
    for (const anchor of this.activeAnchors) {
      anchors.push(anchor);
    }

    for (const anchor of anchors) {
      const action = anchor.action;

      if (anchor.isSynchronized) {
        const unitTime = fract(group["frameStartPhase"] + anchor.phaseOffset);
        action.time = unitTime * anchor.duration;
        action.timeScale = group["frameRate"] * anchor.duration;
        this.advanceAnchor(anchor, unitTime, group["frameDelta"]);
      } else {
        action.timeScale = this.timeScaleInternal;
        const unitScale = action.paused ? 0 : this.timeScaleInternal * anchor.invDuration;
        this.advanceAnchor(anchor, action.time * anchor.invDuration, deltaTime * unitScale);
      }
    }
  }

  /**
   * Applies the state influence to all active anchors, keeping their relative weights.
   */
  protected updateAnchorsInfluence(): void {
    for (const anchor of this.activeAnchors) {
      this.updateAnchorWeight(anchor);
    }
  }

  /**
   * Updates the weight of an anchor and combines it with the state influence.
   * A combined weight that rises from zero starts the action, at the current phase if it is
   * synchronized, and emits signalPlay. One that falls to zero stops the action and emits
   * signalStop.
   *
   * @param anchor - The anchor to update
   * @param weight - The weight before the state influence is applied, the current one by default
   * @throws {Error} When weight is not a finite number or is outside the range [0, 1]
   */
  protected updateAnchorWeight(anchor: Anchor, weight: number = anchor.weight): void {
    assertValidUnitRange(weight, "Anchor weight");
    anchor.weight = weight;
    if (weight > 0) {
      this.activeAnchors.add(anchor);
    } else {
      this.activeAnchors.delete(anchor);
    }

    const combinedWeight = weight * this.influenceInternal;
    const animationAction = anchor.action;

    if (combinedWeight === animationAction.weight) {
      return;
    }

    if (combinedWeight > 0 && animationAction.weight === 0) {
      animationAction.enabled = true;
      animationAction.paused = false;
      animationAction.time = anchor.isSynchronized
        ? fract(this.syncGroupInternal.phase + anchor.phaseOffset) * anchor.duration
        : 0;
      animationAction.timeScale = this.timeScaleInternal;
      animationAction.play();
      this.signalPlayInternal.emit(animationAction, this);
    } else if (combinedWeight === 0 && animationAction.weight > 0) {
      animationAction.stop();
      animationAction.time = 0;
      animationAction.paused = false;
      animationAction.enabled = false;
      this.signalStopInternal.emit(animationAction, this);
    }

    animationAction.weight = combinedWeight;
  }

  /**
   * Fires the time events, signalIterate and signalFinish that an anchor passes during a tick.
   * A looping action that passes the end of its cycle also fires the events at the start of the
   * next cycle.
   *
   * @param anchor - The anchor of the playing action
   * @param unitTime - Position of the action at the start of the tick, in cycles of its clip
   * @param unitDelta - Distance the action moves during the tick, in cycles of its clip
   * @throws {Error} When the anchor's action is not running
   */
  private advanceAnchor(anchor: Anchor, unitTime: number, unitDelta: number): void {
    const action = anchor.action;

    if (action.weight === 0) {
      throw new Error(`Cannot update anchor time for a non-running action: ${this.name}`);
    }

    const unitEnd = unitTime + unitDelta;
    const isCycleEnd = unitTime < 1 && unitEnd >= 1;
    const events = this.timeEvents.get(anchor);

    if (events) {
      const wrappedEnd = isCycleEnd && !anchor.isLoopOnce ? unitEnd - 1 : -1;

      for (const [eventTime, event] of events) {
        if ((unitTime < eventTime && unitEnd >= eventTime) || eventTime <= wrappedEnd) {
          event.signal.emit(action, this);
        }
      }
    }

    if (isCycleEnd) {
      const signal = anchor.isLoopOnce ? this.signalFinishInternal : this.signalIterateInternal;
      signal.emit(action, this);
    }
  }

  private resetFinishedAction(anchor: Anchor): void {
    const action = anchor.action;
    if (action.loop === LoopOnce && action.time === anchor.duration) {
      action.time = 0;
      action.paused = false;
      action.enabled = true;
    }
  }
}
