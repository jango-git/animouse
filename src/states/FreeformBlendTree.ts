import type { AnimationAction, Vector2Like } from "three";
import { LoopOnce } from "three";
import { AnimationStateEvent } from "../mescellaneous/AnimationStateEvent";
import { assertValidNumber } from "../mescellaneous/assertions";
import type { Triangle } from "../mescellaneous/DelaunayTriangulator";
import { DelaunayTriangulator } from "../mescellaneous/DelaunayTriangulator";
import {
  calculateBarycentricWeights,
  calculateDistanceSquared,
  calculateDistanceToEdgeSquared,
  calculateTriangleCentroid,
} from "../mescellaneous/math";
import { EPSILON, type Anchor } from "../mescellaneous/miscellaneous";
import { AnimationTree } from "./AnimationTree";

/** Minimum number of actions required for freeform blend tree triangulation */
const MIN_ACTION_COUNT = 3;

/**
 * Configuration for a freeform animation action in the blend tree.
 * Associates an animation action with Cartesian coordinates in 2D space.
 */
export interface FreeformAction {
  /** The Three.js animation action to be played */
  action: AnimationAction;
  /** X coordinate in 2D space (finite number) */
  x: number;
  /** Y coordinate in 2D space (finite number) */
  y: number;
}

/**
 * Internal anchor structure for freeform blend tree.
 * Extends the base Anchor with Cartesian coordinates for triangulation.
 *
 * @internal
 */
interface FreeformAnchor extends Anchor {
  /** The Three.js animation action wrapped by this anchor */
  action: AnimationAction;
  /** X coordinate in 2D space */
  x: number;
  /** Y coordinate in 2D space */
  y: number;
}

/**
 * Triangle structure for freeform blending with precomputed centroid.
 * Omits circumcenter and circumradius data not needed for barycentric interpolation.
 *
 * @internal
 */
interface FreeformTriangle
  extends Omit<
    Triangle<FreeformAnchor>,
    "circumcenter" | "circumradiusSquared"
  > {
  /** Precomputed geometric center point of the triangle */
  centroid: Vector2Like;
}

/**
 * Freeform blend tree implementation for arbitrary 2D animation blending.
 *
 * Uses Delaunay triangulation to create a mesh from animation actions positioned
 * in arbitrary 2D coordinates, enabling smooth interpolation between animations
 * based on barycentric coordinates within triangles. For points outside the mesh,
 * falls back to nearest edge interpolation for boundary handling.
 *
 * The blend tree automatically constructs a triangulated mesh from input actions
 * and provides seamless blending across the entire 2D space, making it ideal
 * for complex animation systems like movement with multiple speed/direction
 * combinations or facial animation with arbitrary control points.
 *
 * @example Character Movement with Arbitrary Speeds
 * ```typescript
 * // Define movement animations at various speeds and directions
 * const actions = [
 *   { action: idleAction, x: 0, y: 0 },           // Center: idle
 *   { action: walkNorthAction, x: 0, y: 1 },      // North: slow
 *   { action: runNorthAction, x: 0, y: 2 },       // North: fast
 *   { action: walkEastAction, x: 1, y: 0 },       // East: slow
 *   { action: runEastAction, x: 2, y: 0 },        // East: fast
 *   { action: walkNEAction, x: 0.7, y: 0.7 },     // Northeast: diagonal
 *   { action: sprintAction, x: 1.5, y: 1.5 }      // Sprint: very fast diagonal
 * ];
 *
 * const blendTree = new FreeformBlendTree(actions);
 *
 * // Blend to medium speed northeast
 * blendTree.setBlend(0.5, 0.8);
 *
 * // Blend to maximum speed due east
 * blendTree.setBlend(2.0, 0.0);
 * ```
 */
export class FreeformBlendTree extends AnimationTree {
  private readonly tempAnchorMap = new Map<FreeformAnchor, number>();
  private readonly trackableAnchors: FreeformAnchor[] = [];
  private readonly triangles: FreeformTriangle[] = [];
  private readonly boundaryEdgeMap = new Map<
    FreeformAnchor,
    [FreeformAnchor, FreeformAnchor]
  >();

  private currentX = 0;
  private currentY = 0;

  /**
   * Creates a new freeform blend tree from animation actions positioned in 2D space.
   * Performs Delaunay triangulation to create a mesh for barycentric interpolation.
   * Initializes all actions to stopped state and validates coordinates and durations.
   *
   * @param freeformActions - Array of freeform actions defining the blend space.
   *                         Must contain at least 3 actions with unique coordinates.
   * @throws {Error} When fewer than 3 actions are provided
   * @throws {Error} When any action has non-finite coordinates
   * @throws {Error} When any action coordinates are outside JavaScript's safe range
   * @throws {Error} When multiple actions have the same coordinates
   * @throws {Error} When any animation clip duration is not positive
   * @throws {Error} When actions form degenerate triangulation (all collinear)
   * @see {@link assertValidNumber} for coordinate validation details
   * @see {@link DelaunayTriangulator.triangulate} for triangulation details
   */
  constructor(freeformActions: FreeformAction[]) {
    super();

    if (freeformActions.length < MIN_ACTION_COUNT) {
      throw new Error(
        "FreeformBlendTree requires at least 3 actions for triangulation",
      );
    }

    for (let i = 0; i < freeformActions.length; i++) {
      assertValidNumber(
        freeformActions[i].x,
        `Freeform action at index ${i} x value`,
      );
      assertValidNumber(
        freeformActions[i].y,
        `Freeform action at index ${i} y value`,
      );
    }

    for (let i = 0; i < freeformActions.length - 1; i++) {
      const x = freeformActions[i].x;
      const y = freeformActions[i].y;

      for (let j = i + 1; j < freeformActions.length; j++) {
        if (
          Math.abs(x - freeformActions[j].x) < EPSILON &&
          Math.abs(y - freeformActions[j].y) < EPSILON
        ) {
          throw new Error(
            `Duplicate coordinates found, x: ${x}, y: ${y}. All action values must be unique.`,
          );
        }
      }
    }

    const anchors: FreeformAnchor[] = [];

    for (const freeformAction of freeformActions) {
      const animationAction = freeformAction.action;

      animationAction.stop();
      animationAction.time = 0;
      animationAction.weight = 0;
      animationAction.paused = false;
      animationAction.enabled = false;

      const duration = animationAction.getClip().duration;
      if (duration <= 0) {
        throw new Error("Action duration must be greater than zero");
      }

      anchors.push({
        action: animationAction,
        weight: 0,
        duration,
        iterationEventType:
          animationAction.loop === LoopOnce
            ? AnimationStateEvent.FINISH
            : AnimationStateEvent.ITERATE,
        x: freeformAction.x,
        y: freeformAction.y,
      });
    }

    const result = DelaunayTriangulator.triangulate(anchors);
    this.triangles = result.triangles.map((t) => {
      // Exclude 'circumcenter' and 'circumradiusSquared' from 't' — we don't need them in the result.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { circumcenter, circumradiusSquared, ...rest } = t;
      return {
        ...rest,
        centroid: calculateTriangleCentroid(t.a, t.b, t.c),
      };
    });
    this.boundaryEdgeMap = result.boundaryEdgeMap;
    this.sortTriangles();
    this.updateAnchors();
  }

  public get blendValue(): Vector2Like {
    return { x: this.currentX, y: this.currentY };
  }

  /**
   * Sets the blend position in 2D Cartesian coordinates to determine animation weights.
   * When the position changes, animation weights are recalculated using barycentric
   * interpolation within triangles or nearest edge interpolation for boundary points.
   *
   * Points inside triangles use barycentric coordinates for smooth 3-way blending.
   * Points outside the mesh use interpolation along the nearest boundary edge.
   *
   * @param x - Target X coordinate in 2D space (finite number)
   * @param y - Target Y coordinate in 2D space (finite number)
   * @throws {Error} When x coordinate is not a finite number
   * @throws {Error} When y coordinate is not a finite number
   * @see {@link assertValidNumber} for coordinate validation details
   *
   * @example
   * ```typescript
   * // Blend to position within the mesh
   * blendTree.setBlend(1.2, 0.8);
   *
   * // Blend to position outside mesh (uses boundary interpolation)
   * blendTree.setBlend(-0.5, 3.0);
   * ```
   */
  public setBlend(x: number, y: number): void {
    assertValidNumber(x, "Blend x");
    assertValidNumber(y, "Blend y");

    if (this.currentX !== x || this.currentY !== y) {
      this.currentX = x;
      this.currentY = y;

      this.sortTriangles();
      this.updateAnchors();
    }
  }

  /**
   * Internal method called by the animation state machine on each frame update.
   * Tracks animation progress and emits iteration events for all triangulated actions.
   * Monitors timing changes across all anchors in the triangulated mesh.
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

    for (const anchor of this.trackableAnchors) {
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
   * Updates the influence for all anchors in the freeform blend tree.
   * Called when the tree's influence changes but relative weights remain the same.
   * Applies the current tree influence to all triangulated anchors while maintaining
   * their existing weight distribution from the freeform blending calculations.
   */
  protected updateAnchorsInfluence(): void {
    for (const anchor of this.trackableAnchors) {
      this.updateAnchorWeight(anchor);
    }
  }

  /**
   * Recalculates and updates animation weights based on current blend position.
   *
   * This is the core blending algorithm that:
   * 1. Attempts barycentric interpolation if point lies within any triangle
   * 2. Falls back to nearest boundary edge interpolation for external points
   * 3. Updates the active anchors set with calculated weights
   *
   * The method prioritizes smooth 3-way barycentric blending when possible,
   * providing seamless 2-way edge blending for boundary cases.
   */
  private updateAnchors(): void {
    this.tempAnchorMap.clear();
    for (const anchor of this.trackableAnchors) {
      this.tempAnchorMap.set(anchor, 0);
    }

    if (!this.applyBarycentricWeights(this.tempAnchorMap)) {
      this.applyNearestNeighborWeight(this.tempAnchorMap);
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
   * Attempts to apply barycentric weights if the blend point lies within any triangle.
   * Searches through all triangles to find one containing the current blend position
   * and calculates the barycentric coordinates for 3-way interpolation.
   *
   * @param result - Map to store calculated weights for each anchor
   * @returns True if barycentric interpolation was applied, false if point is outside all triangles
   * @see {@link calculateBarycentricWeights} for barycentric coordinate calculation
   */
  private applyBarycentricWeights(
    result: Map<FreeformAnchor, number>,
  ): boolean {
    const point = { x: this.currentX, y: this.currentY };

    for (const triangle of this.triangles) {
      const weights = calculateBarycentricWeights(point, triangle);
      if (weights) {
        result.set(triangle.a, weights.aW);
        result.set(triangle.b, weights.bW);
        result.set(triangle.c, weights.cW);
        return true;
      }
    }

    return false;
  }

  /**
   * Applies nearest boundary edge interpolation for points outside the triangulated mesh.
   * Finds the closest boundary vertex and interpolates along the nearest boundary edge
   * to provide smooth 2-way blending for external points.
   *
   * The algorithm:
   * 1. Finds the closest anchor among all boundary vertices
   * 2. Identifies the two boundary edges connected to this anchor
   * 3. Determines which edge is closer to the blend point
   * 4. Projects the point onto the edge and calculates interpolation weights
   *
   * @param result - Map to store calculated weights for each anchor
   * @see {@link calculateDistanceSquared} for distance calculations
   * @see {@link calculateDistanceToEdgeSquared} for edge distance calculations
   */
  private applyNearestNeighborWeight(
    result: Map<FreeformAnchor, number>,
  ): void {
    const nearestTriangle = this.triangles[0];
    const closestAnchor = [
      nearestTriangle.a,
      nearestTriangle.b,
      nearestTriangle.c,
    ].reduce((a, b) =>
      calculateDistanceSquared(a.x, a.y, this.currentX, this.currentY) <
      calculateDistanceSquared(b.x, b.y, this.currentX, this.currentY)
        ? a
        : b,
    );

    const edgeData = this.boundaryEdgeMap.get(closestAnchor);
    // This code is unreachable under all inputs.
    // Every outer contour vertex must have a corresponding entry in boundaryEdgeMap.
    // If this branch is ever taken, it implies a violation of mesh construction invariants —
    // most likely a logic error in how the boundary map was built or queried.
    // This is not an edge case to be tested, but a correctness bug upstream.
    /* c8 ignore next 5 */
    if (edgeData === undefined) {
      throw new Error(
        `Invariant violation: no edge data found for outer vertex (${closestAnchor.x}, ${closestAnchor.y})`,
      );
    }

    const edge0: [FreeformAnchor, FreeformAnchor] = [
      closestAnchor,
      edgeData[0],
    ];
    const edge1: [FreeformAnchor, FreeformAnchor] = [
      closestAnchor,
      edgeData[1],
    ];
    const closestEdge =
      calculateDistanceToEdgeSquared(edge0, this.currentX, this.currentY) <
      calculateDistanceToEdgeSquared(edge1, this.currentX, this.currentY)
        ? edge0
        : edge1;

    const [a, b] = closestEdge;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;

    const value =
      ((this.currentX - a.x) * dx + (this.currentY - a.y) * dy) / lengthSquared;
    const t = Math.max(0, Math.min(1, value));

    result.set(a, 1 - t);
    result.set(b, t);
  }

  /**
   * Sorts triangles by distance from their centroids to the current blend position.
   * This optimization improves performance of barycentric weight calculation by
   * checking closer triangles first, reducing average search time.
   *
   * Called whenever the blend position changes to maintain optimal search order.
   */
  private sortTriangles(): void {
    this.triangles.sort(
      (a, b) =>
        calculateDistanceSquared(
          a.centroid.x,
          a.centroid.y,
          this.currentX,
          this.currentY,
        ) -
        calculateDistanceSquared(
          b.centroid.x,
          b.centroid.y,
          this.currentX,
          this.currentY,
        ),
    );
  }
}
