import type { AnimationAction } from "three";
import { LoopOnce } from "three";
import { AnimationStateEvent } from "../mescellaneous/AnimationStateEvent";
import {
  assertValidNonNegativeNumber,
  assertValidNumber,
  assertValidPositiveNumber,
} from "../mescellaneous/assertions";
import { EPSILON, type Anchor } from "../mescellaneous/miscellaneous";

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
  /** Radial distance from the origin. Must be finite and non-negative. */
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
 * This class manages a collection of animation actions positioned in polar space (radius, azimuth),
 * automatically blending between adjacent animations based on polar coordinates. The blend tree
 * organizes actions into rays (constant azimuth) and rings (constant radius) to enable efficient
 * bilinear interpolation between the four closest animations, creating smooth transitions across
 * the polar space.
 *
 * ## Architecture
 * - **Rays**: Groups of anchors with the same azimuth but different radii
 * - **Rings**: Groups of anchors with the same radius but different azimuths
 * - **Bilinear Interpolation**: Weight calculation between 4 corner anchors in polar grid
 * - **Center Action**: Optional action at origin (0,0) for special handling
 *
 * ## Coordinate System
 * - **Radius**: Distance from origin, must be non-negative
 * - **Azimuth**: Angle in radians, automatically normalized to [0, 2π) range
 * - **Origin**: Special point (0,0) handled separately if center action provided
 *
 * ## Input Validation
 * - Minimum 2 actions required for basic interpolation
 * - All radius values must be finite, non-negative, within JavaScript safe range
 * - All azimuth values must be finite, within JavaScript safe range
 * - No duplicate polar coordinates allowed
 * - If exactly 2 actions, they cannot be collinear (same azimuth)
 * - All rays must have the same number of anchors for grid consistency
 *
 * ## Blending Algorithm
 * 1. Find the two adjacent rays that contain the target azimuth
 * 2. Calculate angular interpolation weights between these rays
 * 3. For each ray, find the two adjacent rings containing the target radius
 * 4. Calculate radial interpolation weights between these rings
 * 5. Apply bilinear interpolation to determine final animation weights
 * 6. Handle special cases for center action and edge boundaries
 *
 * @example Walk/Run Directional Movement
 * ```typescript
 * // Create actions for 4-directional movement at two speeds
 * const idle = mixer.clipAction(idleAnimationClip);
 *
 * // Walk actions (radius = 1)
 * const walkForward = mixer.clipAction(walkForwardAnimationClip);
 * const walkRight = mixer.clipAction(walkRightAnimationClip);
 * const walkBackward = mixer.clipAction(walkBackwardAnimationClip);
 * const walkLeft = mixer.clipAction(walkLeftAnimationClip);
 *
 * // Run actions (radius = 2)
 * const runForward = mixer.clipAction(runForwardAnimationClip);
 * const runRight = mixer.clipAction(runRightAnimationClip);
 * const runBackward = mixer.clipAction(runBackwardAnimationClip);
 * const runLeft = mixer.clipAction(runLeftAnimationClip);
 *
 * // Set up polar blend tree with 4-directional movement
 * const blendTree = new PolarBlendTree([
 *   // Walk speed (radius = 1)
 *   { action: walkForward, radius: 1, azimuth: MathUtils.degToRad(0) },    // Forward
 *   { action: walkLeft, radius: 1, azimuth: MathUtils.degToRad(90) },     // Left
 *   { action: walkBackward, radius: 1, azimuth: MathUtils.degToRad(180) }, // Backward
 *   { action: walkRight, radius: 1, azimuth: MathUtils.degToRad(270) },     // Right
 *
 *   // Run speed (radius = 2)
 *   { action: runForward, radius: 2, azimuth: MathUtils.degToRad(0) },     // Fast Forward
 *   { action: runLeft, radius: 2, azimuth: MathUtils.degToRad(90) },      // Fast Left
 *   { action: runBackward, radius: 2, azimuth: MathUtils.degToRad(180) },  // Fast Backward
 *   { action: runRight, radius: 2, azimuth: MathUtils.degToRad(270) },      // Fast Right
 * ], idle); // Center action for stationary state
 *
 * // Blend to medium speed northeast (45° at 1.5x speed)
 * blendTree.setBlend(1.5, MathUtils.degToRad(45));
 *
 * // Blend to slow walk forward
 * blendTree.setBlend(0.5, MathUtils.degToRad(0));
 * ```
 *
 * @public
 */
export class PolarBlendTree extends AnimationTree {
  /** Set of currently active anchors that have non-zero weights */
  private readonly activeAnchors = new Set<PolarAnchor>();

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
   * Actions are organized into rays (by azimuth) and rings (by radius) for
   * efficient bilinear interpolation.
   *
   * @param polarActions - Array of polar actions defining the blend space.
   *                      Must contain at least 3 actions with unique coordinates.
   * @param centerAction - Optional center action at origin (0,0)
   * @throws {Error} When fewer than 3 actions are provided
   * @throws {Error} When any action has non-finite radius or azimuth values
   * @throws {Error} When any action has negative radius
   * @throws {Error} When any action has values outside JavaScript's safe range
   * @throws {Error} When multiple actions have the same polar coordinates
   * @throws {Error} When exactly 3 actions are collinear (same azimuth)
   * @throws {Error} When rays don't have consistent anchor counts
   */
  constructor(polarActions: PolarAction[], centerAction?: AnimationAction) {
    super();

    if (polarActions.length < MIN_POLAR_ACTIONS) {
      throw new Error(
        `At least ${MIN_POLAR_ACTIONS} actions are required for polar blend tree`,
      );
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

      const anchor: PolarAnchor = {
        action: animationAction,
        weight: 0,
        duration,
        previousTime: 0,
        hasFiredIterationEvent: false,
        iterationEventType:
          animationAction.loop === LoopOnce
            ? AnimationStateEvent.FINISH
            : AnimationStateEvent.ITERATE,
        radius: polarAction.radius,
        azimuth: polarAction.azimuth,
      };

      const ray = this.rays.find(
        (r) => Math.abs(r.azimuth - polarAction.azimuth) < EPSILON,
      );

      const ring = this.rings.find(
        (r) => Math.abs(r.radius - polarAction.radius) < EPSILON,
      );

      ray
        ? ray.anchors.push(anchor)
        : this.rays.push({ azimuth: anchor.azimuth, anchors: [anchor] });

      ring
        ? ring.anchors.push(anchor)
        : this.rings.push({ radius: anchor.radius, anchors: [anchor] });
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

      this.centerAnchor = {
        action: centerAction,
        weight: 1,
        duration,
        previousTime: 0,
        hasFiredIterationEvent: false,
        iterationEventType:
          centerAction.loop === LoopOnce
            ? AnimationStateEvent.FINISH
            : AnimationStateEvent.ITERATE,
        radius: 0,
        azimuth: 0,
      };

      this.activeAnchors.add(this.centerAnchor);
    } else {
      this.updateAnchors();
    }
  }

  /**
   * Sets the blend position in polar coordinates to determine animation weights.
   *
   * The method clamps the radius to the valid range [0, maxRadius] and normalizes
   * the azimuth to [0, 2π). When the position changes, animation weights are
   * recalculated using bilinear interpolation between the closest anchors.
   *
   * @param azimuth - Target angular position in radians. Will be normalized to [0, 2π).
   * @param radius - Target radial distance from origin. Will be clamped to [0, maxRadius].
   *
   * @example
   * ```typescript
   * // Blend to half speed, 45 degrees
   * blendTree.setBlend(0.5, MathUtils.degToRad(45));
   *
   * // Blend to full speed, straight back
   * blendTree.setBlend(1.0, MathUtils.degToRad(180));
   *
   * // Values outside range are automatically clamped
   * blendTree.setBlend(-1, MathUtils.degToRad(600)); // Becomes (0, ~4.19)
   * ```
   *
   * @public
   */
  public setBlend(azimuth: number, radius: number): void {
    assertValidNumber(azimuth, "Blend azimuth");
    assertValidNonNegativeNumber(radius, "Blend radius");

    const normalizedAzimuth = calculateNormalizedAzimuth(azimuth);

    if (
      this.currentRadius !== radius ||
      this.currentAzimuth !== normalizedAzimuth
    ) {
      this.currentRadius = radius;
      this.currentAzimuth = normalizedAzimuth;
      this.updateAnchors();
    }
  }

  /**
   * Internal frame update method called by the animation state machine.
   *
   * Monitors animation progress for all active anchors and emits iteration events
   * when animations complete, restart, or loop. Tracks timing changes to detect
   * animation state transitions and prevent duplicate event emissions.
   *
   * @internal This method is called exclusively by the animation state machine
   * @override
   */
  protected ["onTickInternal"](): void {
    for (const ray of this.rays) {
      for (const anchor of ray.anchors) {
        this.updateAnchorTime(anchor);
      }
    }
  }

  /**
   * Updates the global influence for all active anchors in the polar blend tree.
   *
   * Called when the tree's overall influence changes but relative weights between
   * anchors should remain the same. Applies the current tree influence to all
   * active anchors while maintaining their existing weight distribution from
   * the polar blending calculations.
   *
   * @override
   * @protected
   */
  protected updateAnchorsInfluence(): void {
    for (const anchor of this.activeAnchors) {
      this.updateAnchor(anchor);
    }
  }

  /**
   * Recalculates and updates animation weights based on current blend position.
   *
   * This is the core blending algorithm that:
   * 1. Finds the two adjacent rays containing the current azimuth
   * 2. Calculates angular interpolation weights between these rays
   * 3. Determines if blending occurs in the center region or outer grid
   * 4. Applies appropriate interpolation (linear for center, bilinear for grid)
   * 5. Updates active anchors set and applies calculated weights
   *
   * The method handles three distinct cases:
   * - **Center Region**: When radius < first ring radius, blends with center action
   * - **Grid Region**: When radius >= first ring radius, uses bilinear interpolation
   * - **Edge Cases**: Boundary conditions and wraparound azimuth handling
   *
   * @private
   */
  private updateAnchors(): void {
    const weights = new Map<PolarAnchor, number>();

    for (const anchor of this.activeAnchors) {
      weights.set(anchor, 0);
    }

    for (let lRayIndex = 0; lRayIndex < this.rays.length; lRayIndex++) {
      const rRayIndex = (lRayIndex + 1) % this.rays.length;

      const lRay = this.rays[lRayIndex];
      const rRay = this.rays[rRayIndex];
      const lAzimuth = lRay.azimuth;
      const rAzimuth = rRay.azimuth;

      if (isAzimuthBetween(this.currentAzimuth, lAzimuth, rAzimuth)) {
        const angularDistance = calculateAngularDistanceForward(
          lAzimuth,
          rAzimuth,
        );

        const leftDistance = calculateAngularDistanceForward(
          lAzimuth,
          this.currentAzimuth,
        );

        const rRayT = leftDistance / angularDistance;
        const lRayT = 1 - rRayT;

        if (this.currentRadius <= this.rings[0].radius) {
          let lWeight = lRayT;
          let rWeight = rRayT;

          if (this.centerAnchor) {
            const ringWeight = this.currentRadius / this.rings[0].radius;
            weights.set(this.centerAnchor, 1 - ringWeight);
            lWeight *= ringWeight;
            rWeight *= ringWeight;
          }

          weights.set(lRay.anchors[0], lWeight);
          weights.set(rRay.anchors[0], rWeight);
        } else if (
          this.currentRadius >= this.rings[this.rings.length - 1].radius
        ) {
          let lWeight = lRayT;
          let rWeight = rRayT;

          weights.set(lRay.anchors[lRay.anchors.length - 1], lWeight);
          weights.set(rRay.anchors[rRay.anchors.length - 1], rWeight);
        } else {
          this.calculateBilinearWeights(
            weights,
            lRayT,
            rRayT,
            lRayIndex,
            rRayIndex,
          );
        }
        break;
      }
    }

    this.activeAnchors.clear();

    for (const [anchor, weight] of weights) {
      this.activeAnchors.add(anchor);
      this.updateAnchor(anchor, weight);
    }
  }

  /**
   * Calculates bilinear interpolation weights for the four corner anchors in the polar grid.
   *
   * This method performs standard bilinear interpolation between four points arranged
   * in a rectangular grid pattern in polar space. The four corners are defined by:
   * - Inner ring vs outer ring (radial dimension)
   * - Left ray vs right ray (angular dimension)
   *
   * The bilinear interpolation formula combines the radial and angular interpolation
   * weights to determine how much each of the four corner anchors contributes to
   * the final blend result.
   *
   * @param weights - Map to store calculated weights for each anchor
   * @param lRayT - Weight for the left ray (0 = all left, 1 = all right)
   * @param rRayT - Weight for the right ray (0 = all left, 1 = all right)
   * @param lRayIndex - Index of the left ray in the rays array
   * @param rRayIndex - Index of the right ray in the rays array
   *
   * @throws {Error} When no ring pair contains the current radius (should never happen)
   *
   * @private
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

      if (
        this.currentRadius >= innerRadius &&
        this.currentRadius <= outerRadius
      ) {
        const outerRingT =
          (this.currentRadius - innerRadius) / (outerRadius - innerRadius);
        const innerRingT = 1 - outerRingT;

        weights.set(outerRing.anchors[lRayIndex], outerRingT * lRayT);
        weights.set(outerRing.anchors[rRayIndex], outerRingT * rRayT);
        weights.set(innerRing.anchors[lRayIndex], innerRingT * lRayT);
        weights.set(innerRing.anchors[rRayIndex], innerRingT * rRayT);

        return;
      }
    }

    throw new Error("No matching result found");
  }
}
