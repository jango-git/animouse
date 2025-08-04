import type { AnimationAction } from "three";
import { LoopOnce } from "three";
import { AnimationStateEvent } from "../mescellaneous/AnimationStateEvent";
import {
  assertValidNumber,
  assertValidPositiveNumber,
} from "../mescellaneous/assertions";
import { EPSILON, type Anchor } from "../mescellaneous/miscellaneous";
import { AnimationTree } from "./AnimationTree";

/**
 * Configuration for a linear animation action in the blend tree.
 * Associates an animation action with a position value on the linear blend axis.
 */
export interface LinearAction {
  /** The animation action to be played */
  action: AnimationAction;
  /** Position value on the linear blend axis where this action is positioned */
  value: number;
}

/**
 * Internal anchor structure for linear blend tree.
 * Extends the base Anchor with position value for linear interpolation.
 *
 * @internal
 */
interface LinearAnchor extends Anchor {
  /** Position value on the linear blend axis for this anchor */
  value: number;
}

/**
 * Linear blend tree implementation for 1D animation blending.
 *
 * Manages a collection of animation actions positioned along a linear axis,
 * automatically blending between adjacent animations based on a blend value.
 * The blend tree interpolates weights between the two closest animations
 * to create smooth transitions across the linear space.
 *
 * Note: Action values are not limited to the 0-1 range. You can use any
 * numeric values, including negative values, that make sense for your
 * application (e.g., speed in m/s, or any custom metric). However, all
 * values must be finite numbers within JavaScript's safe range and must
 * be unique (no duplicate values allowed).
 *
 * @example
 * ```typescript
 * const idleAction = mixer.clipAction(idleClip);
 * const walkAction = mixer.clipAction(walkClip);
 * const runAction = mixer.clipAction(runClip);
 *
 * const blendTree = new LinearBlendTree([
 *   { action: idleAction, value: 0 },
 *   { action: walkAction, value: 0.5 },
 *   { action: runAction, value: 1 }
 * ]);
 *
 * // Set blend to 0.3 - results in:
 * // idleAction weight: 0.4 (40%)
 * // walkAction weight: 0.6 (60%)
 * // runAction weight: 0.0 (0%)
 * blendTree.setBlend(0.3);
 * ```
 */
export class LinearBlendTree extends AnimationTree {
  private readonly anchors: LinearAnchor[] = [];

  private lastLeftAnchor?: LinearAnchor;
  private lastRightAnchor?: LinearAnchor;

  private currentBlend = 0;

  /**
   * Creates a new linear blend tree with the specified animation actions.
   * Actions are automatically sorted by their value along the linear axis.
   * Initializes all actions to stopped state and validates clip durations.
   *
   * @param linearActions - Array of linear actions defining the blend space.
   *                       Must contain at least 2 actions with unique, finite values.
   * @throws {Error} When fewer than 2 actions are provided
   * @throws {Error} When any action has a non-finite value (NaN, ±Infinity)
   * @throws {Error} When any action has a value outside JavaScript's safe integer range
   * @throws {Error} When multiple actions have the same value (duplicate values)
   * @throws {Error} When any animation clip duration is not a positive finite number
   * @see {@link assertValidNumber} for value validation details
   * @see {@link assertValidPositiveNumber} for duration validation details
   */
  constructor(linearActions: LinearAction[]) {
    super();

    if (linearActions.length < 2) {
      throw new Error("Need at least 2 actions");
    }

    for (let i = 0; i < linearActions.length; i++) {
      const value = linearActions[i].value;
      assertValidNumber(value, `Linear action at index ${i} value`);
    }

    for (let i = 0; i < linearActions.length - 1; i++) {
      const value = linearActions[i].value;
      for (let j = i + 1; j < linearActions.length; j++) {
        if (Math.abs(value - linearActions[j].value) < EPSILON) {
          throw new Error(
            `Duplicate value found, value: ${value}. All action values must be unique.`,
          );
        }
      }
    }

    for (const linearAction of linearActions) {
      const animationAction = linearAction.action;

      animationAction.stop();
      animationAction.time = 0;
      animationAction.weight = 0;
      animationAction.paused = false;
      animationAction.enabled = false;

      const duration = animationAction.getClip().duration;
      assertValidPositiveNumber(duration, "Clip duration");

      this.anchors.push({
        action: animationAction,
        weight: 0,
        duration,
        iterationEventType:
          animationAction.loop === LoopOnce
            ? AnimationStateEvent.FINISH
            : AnimationStateEvent.ITERATE,
        value: linearAction.value,
      });
    }

    this.anchors.sort((a, b) => a.value - b.value);
    this.updateAnchors();
  }

  public get blendValue(): number {
    return this.currentBlend;
  }

  /**
   * Sets the blend value to determine animation weights along the linear axis.
   * When the blend changes, animation weights are recalculated to interpolate
   * between the two closest actions. Values outside the action range are
   * handled by giving full weight to the nearest boundary action.
   *
   * @param value - The target blend value (finite number)
   * @throws {Error} When the blend value is not a finite number
   * @see {@link assertValidNumber} for value validation details
   */
  public setBlend(value: number): void {
    assertValidNumber(value, "Blend value");

    if (value !== this.currentBlend) {
      this.currentBlend = value;
      this.updateAnchors();
    }
  }

  /**
   * Internal method called by the animation state machine on each frame update.
   * Tracks animation progress and emits iteration events when animations
   * complete or restart. Monitors all active anchors for timing changes.
   *
   * @internal This method is called exclusively by the animation state machine
   * @see {@link updateAnchorTime} for time tracking and event emission details
   */
  protected ["onTickInternal"](deltaTime: number): void {
    if (this.influence === 0) {
      throw new Error(
        `${this.name}: cannot update anchor time because the animation influence is zero`,
      );
    }

    if (this.lastLeftAnchor?.weight) {
      this.updateAnchorTime(this.lastLeftAnchor, deltaTime);
    }
    if (this.lastRightAnchor?.weight) {
      this.updateAnchorTime(this.lastRightAnchor, deltaTime);
    }
  }

  /**
   * Updates the influence for all anchors in the linear blend tree.
   * Called when the tree's influence changes but relative weights remain the same.
   * Applies the current tree influence to all anchors while maintaining
   * their existing weight distribution from the linear blending.
   */
  protected updateAnchorsInfluence(): void {
    if (this.lastLeftAnchor) {
      this.updateAnchorWeight(this.lastLeftAnchor);
    }
    if (this.lastRightAnchor) {
      this.updateAnchorWeight(this.lastRightAnchor);
    }
  }

  /**
   * Recalculates and updates animation weights based on the current blend value.
   * Performs linear interpolation between the two actions closest to the blend point.
   * Actions outside the interpolation range receive zero weight.
   *
   * The interpolation uses the formula:
   * - Left weight = 1 - difference
   * - Right weight = difference
   * Where difference = (blend - leftValue) / (rightValue - leftValue)
   */
  private updateAnchors(): void {
    const firstAnchor = this.anchors[0];
    if (this.currentBlend <= firstAnchor.value) {
      if (this.lastLeftAnchor && this.lastLeftAnchor !== firstAnchor) {
        this.updateAnchorWeight(this.lastLeftAnchor, 0);
      }

      if (this.lastRightAnchor) {
        this.updateAnchorWeight(this.lastRightAnchor, 0);
      }

      this.updateAnchorWeight(firstAnchor, 1);
      this.lastLeftAnchor = firstAnchor;
      this.lastRightAnchor = undefined;
      return;
    }

    const lastAnchor = this.anchors[this.anchors.length - 1];
    if (this.currentBlend >= lastAnchor.value) {
      if (this.lastRightAnchor && this.lastRightAnchor !== lastAnchor) {
        this.updateAnchorWeight(this.lastRightAnchor, 0);
      }

      if (this.lastLeftAnchor) {
        this.updateAnchorWeight(this.lastLeftAnchor, 0);
      }

      this.updateAnchorWeight(lastAnchor, 1);
      this.lastRightAnchor = lastAnchor;
      this.lastLeftAnchor = undefined;
      return;
    }

    {
      let l = 1;
      let r = this.anchors.length - 1;

      while (l < r) {
        const m = (l + r) >>> 1;
        this.anchors[m].value < this.currentBlend ? (l = m + 1) : (r = m);
      }

      const lAnchor = this.anchors[l - 1];
      const rAnchor = this.anchors[l];

      if (
        this.lastLeftAnchor &&
        this.lastLeftAnchor !== lAnchor &&
        this.lastLeftAnchor !== rAnchor
      ) {
        this.updateAnchorWeight(this.lastLeftAnchor, 0);
      }

      if (
        this.lastRightAnchor &&
        this.lastRightAnchor !== lAnchor &&
        this.lastRightAnchor !== rAnchor
      ) {
        this.updateAnchorWeight(this.lastRightAnchor, 0);
      }

      const difference =
        (this.currentBlend - lAnchor.value) / (rAnchor.value - lAnchor.value);
      this.updateAnchorWeight(lAnchor, 1 - difference);
      this.updateAnchorWeight(rAnchor, difference);

      this.lastLeftAnchor = lAnchor;
      this.lastRightAnchor = rAnchor;
    }
  }
}
