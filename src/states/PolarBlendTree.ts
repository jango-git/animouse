import type { AnimationAction } from "three";
import { LoopOnce } from "three";
import { AnimationStateEvent } from "../mescellaneous/AnimationStateEvent";
import {
  assertValidNonNegativeNumber,
  assertValidNumber,
  assertValidPositiveNumber,
} from "../mescellaneous/assertions";
import { EPSILON, getNextAnchorIndex, type Anchor } from "../mescellaneous/miscellaneous";

import {
  calculateAngularDistanceForward,
  calculateNormalizedAzimuth,
  isAzimuthBetween,
} from "../mescellaneous/math";
import { AnimationTree } from "./AnimationTree";

/** Minimum number of actions required for polar blend tree triangulation */
const MIN_POLAR_ACTIONS = 2;

/**
 * Configuration for a polar animation action in the blend tree.
 * Associates an animation action with polar coordinates (radius, azimuth).
 *
 * @public
 */
export interface PolarAction {
  /** The Three.js animation action to be played */
  action: AnimationAction;
  /** Radial distance from the origin. Must be finite and positive. */
  radius: number;
  /** Angular position in radians. Must be finite. Will be normalized to [0, 2π) range. */
  azimuth: number;
}

/**
 * Configuration options for polar blend tree behavior.
 *
 * @public
 */
export interface PolarBlendTreeOptions {
  /** Animation action to play at the center (origin) of the polar space */
  centerAction: AnimationAction;
  /** Whether the blend tree should loop azimuthal blending at 2π */
  isLooped: boolean;
}

/**
 * Internal anchor structure for polar blend tree.
 * Extends the base Anchor with polar coordinates for interpolation.
 *
 * @internal
 */
interface PolarAnchor extends Anchor {
  /** Radial distance from the origin */
  radius: number;
  /** Angular position in normalized [0, 2π) range */
  azimuth: number;
}

/**
 * Represents a ray (constant azimuth line) in polar space containing anchors at different radii.
 * Used for organizing anchors by angular direction for efficient interpolation.
 *
 * @internal
 */
interface Ray {
  /** Angular direction of this ray in normalized [0, 2π) range */
  azimuth: number;
  /** Anchors positioned along this ray, sorted by increasing radius */
  anchors: PolarAnchor[];
}

/**
 * Represents a ring (constant radius circle) in polar space containing anchors at different azimuths.
 * Used for organizing anchors by radial distance for efficient interpolation.
 *
 * @internal
 */
interface Ring {
  /** Radial distance of this ring from the origin */
  radius: number;
  /** Anchors positioned on this ring, sorted by increasing azimuth */
  anchors: PolarAnchor[];
}

/**
 * Polar blend tree implementation for 2D animation blending in polar coordinates.
 *
 * Manages animation actions positioned in polar space (radius, azimuth), blending
 * between adjacent animations using bilinear interpolation. Organizes actions into
 * rays (constant azimuth) and rings (constant radius).
 *
 * @example
 * ```typescript
 * const blendTree = new PolarBlendTree([
 *   { action: walkForward, radius: 1, azimuth: 0 },
 *   { action: walkLeft, radius: 1, azimuth: Math.PI / 2 },
 *   { action: runForward, radius: 2, azimuth: 0 },
 *   { action: runLeft, radius: 2, azimuth: Math.PI / 2 }
 * ], idleAction);
 *
 * blendTree.setBlend(Math.PI / 4, 1.5);
 * ```
 */
export class PolarBlendTree extends AnimationTree {
  private readonly tempAnchorMap = new Map<PolarAnchor, number>();
  private readonly trackableAnchors: PolarAnchor[] = [];

  /** Optional center anchor at origin (0,0) for special blending behavior */
  private readonly centerAnchor?: PolarAnchor;

  /** Array of rays (constant azimuth lines) containing anchors, sorted by azimuth */
  private readonly rays: Ray[] = [];

  /** Array of rings (constant radius circles) containing anchors, sorted by radius */
  private readonly rings: Ring[] = [];

  /** Current radial position for blending calculations */
  private currentRadius = 0;

  /** Current angular position for blending calculations, normalized to [0, 2π) */
  private currentAzimuth = 0;

  /**
   * Creates a new polar blend tree with the specified animation actions.
   * Actions are organized into rays (by azimuth) and rings (by radius).
   *
   * @param polarActions - Array of polar actions defining the blend space.
   *                      Must contain at least 2 actions with unique coordinates.
   * @param centerAction - Optional center action at origin (0,0)
   * @throws {Error} When fewer than 2 actions are provided
   * @throws {Error} When any action has non-finite radius or azimuth values
   * @throws {Error} When any action has non-positive radius
   * @throws {Error} When multiple actions have the same polar coordinates
   * @throws {Error} When fewer than 2 rays are created
   * @throws {Error} When rays don't have consistent anchor counts
   * @throws {Error} When any animation clip duration is not positive
   */
  constructor(polarActions: PolarAction[], centerAction?: AnimationAction) {
    super();

    if (polarActions.length < MIN_POLAR_ACTIONS) {
      throw new Error(`At least ${MIN_POLAR_ACTIONS} actions are required for polar blend tree`);
    }

    for (let i = 0; i < polarActions.length; i++) {
      const { radius, azimuth } = polarActions[i];

      assertValidNumber(radius, `Polar action at index ${i} radius`);
      assertValidNumber(azimuth, `Polar action at index ${i} azimuth`);
      assertValidPositiveNumber(radius, `Polar action at index ${i} radius`);
    }

    for (const polarAction of polarActions) {
      polarAction.azimuth = calculateNormalizedAzimuth(polarAction.azimuth);
    }

    for (let i = 0; i < polarActions.length - 1; i++) {
      const azimuth = polarActions[i].azimuth;
      const radius = polarActions[i].radius;

      for (let j = i + 1; j < polarActions.length; j++) {
        if (
          Math.abs(azimuth - polarActions[j].azimuth) < EPSILON &&
          Math.abs(radius - polarActions[j].radius) < EPSILON
        ) {
          throw new Error(
            `Duplicate coordinates found, azimuth: ${azimuth}, radius: ${radius}. All action values must be unique.`,
          );
        }
      }
    }

    for (const polarAction of polarActions) {
      const animationAction = polarAction.action;

      const duration = animationAction.getClip().duration;
      assertValidPositiveNumber(duration, "Clip duration");

      animationAction.stop();
      animationAction.time = 0;
      animationAction.weight = 0;
      animationAction.paused = false;
      animationAction.enabled = false;

      const anchor: PolarAnchor = {
        index: getNextAnchorIndex(),
        action: animationAction,
        weight: 0,
        duration,
        invDuration: 1 / duration,
        iterationEventType:
          animationAction.loop === LoopOnce
            ? AnimationStateEvent.FINISH
            : AnimationStateEvent.ITERATE,
        radius: polarAction.radius,
        azimuth: polarAction.azimuth,
      };

      const ray = this.rays.find((r) => Math.abs(r.azimuth - polarAction.azimuth) < EPSILON);

      const ring = this.rings.find((r) => Math.abs(r.radius - polarAction.radius) < EPSILON);

      ray
        ? ray.anchors.push(anchor)
        : this.rays.push({ azimuth: anchor.azimuth, anchors: [anchor] });

      ring
        ? ring.anchors.push(anchor)
        : this.rings.push({ radius: anchor.radius, anchors: [anchor] });

      this.actionToAnchor.set(animationAction, anchor);
    }

    if (this.rays.length < 2) {
      throw new Error("At least two rays are required.");
    }

    const ringCount = this.rings.length;
    if (this.rays.some((r) => r.anchors.length !== ringCount)) {
      throw new Error("The anchors must form a valid grid.");
    }

    this.rays.sort((a, b) => a.azimuth - b.azimuth);
    for (const ray of this.rays) {
      ray.anchors.sort((a, b) => a.radius - b.radius);
    }

    this.rings.sort((a, b) => a.radius - b.radius);
    for (const ring of this.rings) {
      ring.anchors.sort((a, b) => a.azimuth - b.azimuth);
    }

    if (centerAction) {
      const duration = centerAction.getClip().duration;
      assertValidPositiveNumber(duration, "Center clip duration");

      centerAction.stop();
      centerAction.time = 0;
      centerAction.weight = 0;
      centerAction.paused = false;
      centerAction.enabled = false;

      this.centerAnchor = {
        index: getNextAnchorIndex(),
        action: centerAction,
        weight: 1,
        duration,
        invDuration: 1 / duration,
        iterationEventType:
          centerAction.loop === LoopOnce ? AnimationStateEvent.FINISH : AnimationStateEvent.ITERATE,
        get radius(): number {
          throw new Error("PolarBlendTree central anchor radius is not accessible");
        },
        get azimuth(): number {
          throw new Error("PolarBlendTree central anchor azimuth is not accessible");
        },
      };

      this.trackableAnchors.push(this.centerAnchor);
      this.actionToAnchor.set(centerAction, this.centerAnchor);
    } else {
      this.updateAnchors();
    }
  }

  public get blendValue(): { azimuth: number; radius: number } {
    return { azimuth: this.currentAzimuth, radius: this.currentRadius };
  }

  /**
   * Sets the blend position in polar coordinates to determine animation weights.
   * Azimuth is normalized to [0, 2π) range and radius must be non-negative.
   * Recalculates weights using bilinear interpolation between the closest anchors.
   *
   * @param azimuth - Target angular position in radians. Will be normalized to [0, 2π).
   * @param radius - Target radial distance from origin.
   * @throws {Error} When azimuth is not a finite number
   * @throws {Error} When radius is not a finite non-negative number
   */
  public setBlend(azimuth: number, radius: number): void {
    assertValidNumber(azimuth, "Blend azimuth");
    assertValidNonNegativeNumber(radius, "Blend radius");

    const normalizedAzimuth = calculateNormalizedAzimuth(azimuth);

    if (this.currentRadius !== radius || this.currentAzimuth !== normalizedAzimuth) {
      this.currentRadius = radius;
      this.currentAzimuth = normalizedAzimuth;
      this.updateAnchors();
    }
  }

  /**
   * Called by the animation state machine on each frame update.
   * Monitors animation progress and emits iteration events for active anchors.
   *
   * @internal Called only by the animation state machine
   */
  protected ["onTickInternal"](deltaTime: number): void {
    if (this.influence === 0) {
      throw new Error(
        `${this.name}: cannot update anchor time because the animation influence is zero`,
      );
    }

    for (const anchor of this.trackableAnchors) {
      this.processTimeEvents(anchor, deltaTime);
      this.updateAnchorTime(anchor, deltaTime);
    }
  }

  protected override ["onEnterInternal"](): void {
    super.onEnterInternal();
    if (this.influence > 0) {
      for (const anchor of this.trackableAnchors) {
        this.resetFinishedAction(anchor);
      }
    }
  }

  /**
   * Updates the influence for all active anchors in the polar blend tree.
   * Called when the tree's influence changes but relative weights remain the same.
   */
  protected updateAnchorsInfluence(): void {
    for (const anchor of this.trackableAnchors) {
      this.updateAnchorWeight(anchor);
    }
  }

  /**
   * Recalculates and updates animation weights based on current blend position.
   * Finds the two adjacent rays containing the current azimuth and applies
   * appropriate interpolation (linear for center, bilinear for grid).
   */
  private updateAnchors(): void {
    this.tempAnchorMap.clear();
    for (const anchor of this.trackableAnchors) {
      this.tempAnchorMap.set(anchor, 0);
    }

    for (let lRayIndex = 0; lRayIndex < this.rays.length; lRayIndex++) {
      const rRayIndex = (lRayIndex + 1) % this.rays.length;

      const lRay = this.rays[lRayIndex];
      const rRay = this.rays[rRayIndex];
      const lAzimuth = lRay.azimuth;
      const rAzimuth = rRay.azimuth;

      if (isAzimuthBetween(this.currentAzimuth, lAzimuth, rAzimuth)) {
        const angularDistance = calculateAngularDistanceForward(lAzimuth, rAzimuth);

        const leftDistance = calculateAngularDistanceForward(lAzimuth, this.currentAzimuth);

        const rRayT = leftDistance / angularDistance;
        const lRayT = 1 - rRayT;

        if (this.currentRadius <= this.rings[0].radius) {
          let lWeight = lRayT;
          let rWeight = rRayT;

          if (this.centerAnchor) {
            const ringWeight = this.currentRadius / this.rings[0].radius;
            this.tempAnchorMap.set(this.centerAnchor, 1 - ringWeight);
            lWeight *= ringWeight;
            rWeight *= ringWeight;
          }

          this.tempAnchorMap.set(lRay.anchors[0], lWeight);
          this.tempAnchorMap.set(rRay.anchors[0], rWeight);
        } else if (this.currentRadius >= this.rings[this.rings.length - 1].radius) {
          let lWeight = lRayT;
          let rWeight = rRayT;

          this.tempAnchorMap.set(lRay.anchors[lRay.anchors.length - 1], lWeight);
          this.tempAnchorMap.set(rRay.anchors[rRay.anchors.length - 1], rWeight);
        } else {
          this.calculateBilinearWeights(this.tempAnchorMap, lRayT, rRayT, lRayIndex, rRayIndex);
        }
        break;
      }
    }

    this.trackableAnchors.length = 0;
    for (const [anchor, weight] of this.tempAnchorMap) {
      this.updateAnchorWeight(anchor, weight);
      if (weight > 0) {
        this.trackableAnchors.push(anchor);
      }
    }
  }

  /**
   * Calculates bilinear interpolation weights for the four corner anchors in the polar grid.
   * Performs interpolation between four points in a rectangular grid pattern.
   *
   * @param weights - Map to store calculated weights for each anchor
   * @param lRayT - Weight for the left ray
   * @param rRayT - Weight for the right ray
   * @param lRayIndex - Index of the left ray in the rays array
   * @param rRayIndex - Index of the right ray in the rays array
   */
  private calculateBilinearWeights(
    weights: Map<PolarAnchor, number>,
    lRayT: number,
    rRayT: number,
    lRayIndex: number,
    rRayIndex: number,
  ): void {
    for (let ringIndex = 0; ringIndex < this.rings.length - 1; ringIndex++) {
      const innerRing = this.rings[ringIndex];
      const outerRing = this.rings[ringIndex + 1];
      const innerRadius = innerRing.radius;
      const outerRadius = outerRing.radius;

      if (this.currentRadius >= innerRadius && this.currentRadius <= outerRadius) {
        const outerRingT = (this.currentRadius - innerRadius) / (outerRadius - innerRadius);
        const innerRingT = 1 - outerRingT;

        weights.set(outerRing.anchors[lRayIndex], outerRingT * lRayT);
        weights.set(outerRing.anchors[rRayIndex], outerRingT * rRayT);
        weights.set(innerRing.anchors[lRayIndex], innerRingT * lRayT);
        weights.set(innerRing.anchors[rRayIndex], innerRingT * rRayT);

        return;
      }
    }

    // This code is unreachable under all inputs.
    // In a properly functioning system, currentRadius should always fall within the range of some ring pair.
    // This method is only called when currentRadius is between the first and last ring radii,
    // so there must always be at least one ring interval that contains the current radius.
    // If this branch is ever taken, it implies a violation of polar grid invariants and a bug elsewhere in the pipeline —
    // not an edge case to be covered by tests.
    /* c8 ignore next 3 */
    throw new Error(
      `Invariant violation: currentRadius ${this.currentRadius} not found within any ring interval`,
    );
  }
}
