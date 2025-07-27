import type { AnimationAction } from "three";
import { LoopOnce } from "three";
import { AnimationStateEvent } from "../mescellaneous/AnimationStateEvent";
import {
  assertValidNumber,
  assertValidPositiveNumber,
  EPSILON,
} from "../mescellaneous/assertions";
import type { Anchor } from "../mescellaneous/miscellaneous";
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
export interface LinearAnchor extends Anchor {
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
   *
   * @param linearActions - Array of linear actions defining the blend space.
   *                       Must contain at least 2 actions with unique, finite values.
   * @throws {Error} When fewer than 2 actions are provided
   * @throws {Error} When any action has a non-finite value (NaN, ±Infinity)
   * @throws {Error} When any action has a value outside JavaScript's safe integer range
   * @throws {Error} When multiple actions have the same value (duplicate values)
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

      const duration = animationAction.getClip().duration;
      assertValidPositiveNumber(duration, "Clip duration");

      this.anchors.push({
        action: animationAction,
        weight: 0,
        duration,
        previousTime: 0,
        hasFiredIterationEvent: false,
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

  /**
   * Sets the blend value to determine animation weights along the linear axis.
   * The value is clamped to the range defined by the minimum and maximum
   * action values. When the blend changes, animation weights are recalculated
   * to interpolate between the two closest actions.
   *
   * @param value - The target blend value. Will be clamped to the valid range.
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
   */
  protected ["onTickInternal"](): void {
    for (const anchor of this.anchors) {
      this.updateAnchorTime(anchor);
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
      this.updateAnchor(this.lastLeftAnchor);
    }
    if (this.lastRightAnchor) {
      this.updateAnchor(this.lastRightAnchor);
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
        this.updateAnchor(this.lastLeftAnchor, 0);
      }

      if (this.lastRightAnchor) {
        this.updateAnchor(this.lastRightAnchor, 0);
      }

      this.updateAnchor(firstAnchor, 1);
      this.lastLeftAnchor = firstAnchor;
      this.lastRightAnchor = undefined;
      return;
    }

    const lastAnchor = this.anchors[this.anchors.length - 1];
    if (this.currentBlend >= lastAnchor.value) {
      if (this.lastRightAnchor && this.lastRightAnchor !== lastAnchor) {
        this.updateAnchor(this.lastRightAnchor, 0);
      }

      if (this.lastLeftAnchor) {
        this.updateAnchor(this.lastLeftAnchor, 0);
      }

      this.updateAnchor(lastAnchor, 1);
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
        this.updateAnchor(this.lastLeftAnchor, 0);
      }

      if (
        this.lastRightAnchor &&
        this.lastRightAnchor !== lAnchor &&
        this.lastRightAnchor !== rAnchor
      ) {
        this.updateAnchor(this.lastRightAnchor, 0);
      }

      const difference =
        (this.currentBlend - lAnchor.value) / (rAnchor.value - lAnchor.value);
      this.updateAnchor(lAnchor, 1 - difference);
      this.updateAnchor(rAnchor, difference);

      this.lastLeftAnchor = lAnchor;
      this.lastRightAnchor = rAnchor;
    }
  }
}
