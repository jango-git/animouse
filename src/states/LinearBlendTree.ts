import { assertValidNumber } from "../miscellaneous/assertions.js";
import { type Anchor, EPSILON } from "../miscellaneous/miscellaneous.js";
import { AnimationTree, type BlendAction } from "./AnimationTree.js";

/**
 * Configuration for a linear animation action in the blend tree.
 * Associates an animation action with a position value on the linear blend axis.
 */
export interface LinearAction extends BlendAction {
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
 * Manages animation actions positioned along a linear axis, blending
 * between adjacent animations based on a blend value. Interpolates weights
 * between the two closest animations.
 *
 * Action values can be any finite numbers and must be unique.
 *
 * @example
 * ```typescript
 * const blendTree = new LinearBlendTree([
 *   { action: idleAction, value: 0 },
 *   { action: walkAction, value: 0.5 },
 *   { action: runAction, value: 1 }
 * ]);
 *
 * blendTree.setBlend(0.3);
 * ```
 */
export class LinearBlendTree extends AnimationTree {
  private readonly anchors: LinearAnchor[] = [];
  private readonly tempAnchorMap = new Map<LinearAnchor, number>();

  private currentBlend = 0;

  /**
   * Creates a new linear blend tree with the specified animation actions.
   * Actions are sorted by their value along the linear axis.
   *
   * @param linearActions - Array of linear actions defining the blend space.
   *                       Must contain at least 2 actions with unique, finite values.
   * @throws {Error} When fewer than 2 actions are provided
   * @throws {Error} When any action has a non-finite value
   * @throws {Error} When multiple actions have the same value
   * @throws {Error} When any animation clip duration is not positive
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
      const anchor = Object.assign(this.buildBlendAnchor(linearAction), {
        value: linearAction.value,
      });
      this.anchors.push(anchor);
    }

    this.anchors.sort((a, b) => a.value - b.value);
    this.updateAnchors();
  }

  public get blendValue(): number {
    return this.currentBlend;
  }

  /**
   * Sets the blend value to determine animation weights along the linear axis.
   * Recalculates weights to interpolate between the two closest actions.
   * Values outside the action range give full weight to the nearest boundary action.
   *
   * @param value - The target blend value
   * @throws {Error} When the blend value is not a finite number
   */
  public setBlend(value: number): void {
    assertValidNumber(value, "Blend value");

    if (value !== this.currentBlend) {
      this.currentBlend = value;
      this.updateAnchors();
    }
  }

  /**
   * Recalculates and updates animation weights based on the current blend value.
   * Performs linear interpolation between the two actions closest to the blend point.
   */
  private updateAnchors(): void {
    const weights = this.tempAnchorMap;
    const firstAnchor = this.anchors[0];
    const lastAnchor = this.anchors[this.anchors.length - 1];

    if (this.currentBlend <= firstAnchor.value) {
      weights.set(firstAnchor, 1);
    } else if (this.currentBlend >= lastAnchor.value) {
      weights.set(lastAnchor, 1);
    } else {
      let l = 1;
      let r = this.anchors.length - 1;

      while (l < r) {
        const m = (l + r) >>> 1;
        this.anchors[m].value < this.currentBlend ? (l = m + 1) : (r = m);
      }

      const lAnchor = this.anchors[l - 1];
      const rAnchor = this.anchors[l];
      const difference = (this.currentBlend - lAnchor.value) / (rAnchor.value - lAnchor.value);
      weights.set(lAnchor, 1 - difference);
      weights.set(rAnchor, difference);
    }

    this.commitWeights(weights);
  }
}
