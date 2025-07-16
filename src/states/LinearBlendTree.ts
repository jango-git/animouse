import { LoopOnce, MathUtils, type AnimationAction } from "three";
import { StateEvent } from "../mescellaneous/AnimationStateEvent";
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

    const values = new Set<number>();
    for (let i = 0; i < linearActions.length; i++) {
      const value = linearActions[i].value;

      if (!Number.isFinite(value)) {
        throw new Error(`Action at index ${i} has non-finite value: ${value}`);
      }

      if (Math.abs(value) > Number.MAX_SAFE_INTEGER) {
        throw new Error(
          `Action at index ${i} has value outside safe range: ${value}`,
        );
      }

      if (values.has(value)) {
        throw new Error(
          `Duplicate value found: ${value}. All action values must be unique.`,
        );
      }

      values.add(value);
    }

    for (const linearAction of linearActions) {
      const animationAction = linearAction.action;
      animationAction.time = 0;
      animationAction.weight = 0;

      this.anchors.push({
        action: animationAction,
        weight: 0,
        duration: animationAction.getClip().duration,
        previousTime: 0,
        hasFiredIterationEvent: false,
        iterationEventType:
          animationAction.loop === LoopOnce
            ? StateEvent.FINISH
            : StateEvent.ITERATE,
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
    const clampedValue = MathUtils.clamp(
      value,
      this.anchors[0].value,
      this.anchors[this.anchors.length - 1].value,
    );
    if (clampedValue !== this.currentBlend) {
      this.currentBlend = clampedValue;
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
      const action = anchor.action;
      const time = action.time;
      const duration = anchor.duration;

      if (
        time < anchor.previousTime ||
        (!anchor.hasFiredIterationEvent && time >= duration)
      ) {
        this.emit(anchor.iterationEventType, action, this);
        anchor.hasFiredIterationEvent = true;
      } else if (time < duration) {
        anchor.hasFiredIterationEvent = false;
      }

      anchor.previousTime = time;
    }
  }

  /**
   * Updates the influence for all anchors in the linear blend tree.
   * Called when the tree's influence changes but relative weights remain the same.
   * Applies the current tree influence to all anchors while maintaining
   * their existing weight distribution from the linear blending.
   */
  protected updateAnchorsInfluence(): void {
    for (let i = 0; i < this.anchors.length - 1; i++) {
      this.updateAnchor(this.anchors[i]);
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
    for (let i = 0; i < this.anchors.length - 1; i++) {
      const l = this.anchors[i];
      const r = this.anchors[i + 1];

      if (this.currentBlend < l.value) {
        this.updateAnchor(r, 0);
      } else if (this.currentBlend > r.value) {
        this.updateAnchor(l, 0);
      } else {
        const difference = (this.currentBlend - l.value) / (r.value - l.value);
        this.updateAnchor(l, 1 - difference);
        this.updateAnchor(r, difference);
      }
    }
  }
}
