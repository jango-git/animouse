import type { AnimationAction } from "three";
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
  Vector2Like,
} from "../mescellaneous/math";
import { EPSILON, getNextAnchorIndex, type Anchor } from "../mescellaneous/miscellaneous";
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
interface FreeformTriangle extends Omit<
  Triangle<FreeformAnchor>,
  "circumcenter" | "circumradiusSquared"
> {
  /** Precomputed geometric center point of the triangle */
  centroid: Vector2Like;
}

/**
 * Freeform blend tree implementation for 2D animation blending.
 *
 * Uses Delaunay triangulation to create a mesh from animation actions positioned
 * in 2D coordinates. Interpolates between animations using barycentric coordinates
 * within triangles. For points outside the mesh, uses nearest edge interpolation.
 *
 * @example
 * ```typescript
 * const actions = [
 *   { action: idleAction, x: 0, y: 0 },
 *   { action: walkAction, x: 0, y: 1 },
 *   { action: runAction, x: 1, y: 0 },
 *   { action: sprintAction, x: 1, y: 1 }
 * ];
 *
 * const blendTree = new FreeformBlendTree(actions);
 * blendTree.setBlend(0.5, 0.8);
 * ```
 */
export class FreeformBlendTree extends AnimationTree {
  private readonly tempAnchorMap = new Map<FreeformAnchor, number>();
  private readonly trackableAnchors: FreeformAnchor[] = [];
  private readonly triangles: FreeformTriangle[] = [];
  private readonly boundaryEdgeMap = new Map<FreeformAnchor, [FreeformAnchor, FreeformAnchor]>();

  private currentX = 0;
  private currentY = 0;

  /**
   * Creates a new freeform blend tree from animation actions positioned in 2D space.
   * Performs Delaunay triangulation to create a mesh for interpolation.
   *
   * @param freeformActions - Array of freeform actions defining the blend space.
   *                         Must contain at least 3 actions with unique coordinates.
   * @throws {Error} When fewer than 3 actions are provided
   * @throws {Error} When any action has non-finite coordinates
   * @throws {Error} When multiple actions have the same coordinates
   * @throws {Error} When any animation clip duration is not positive
   */
  constructor(freeformActions: FreeformAction[]) {
    super();

    if (freeformActions.length < MIN_ACTION_COUNT) {
      throw new Error("FreeformBlendTree requires at least 3 actions for triangulation");
    }

    for (let i = 0; i < freeformActions.length; i++) {
      assertValidNumber(freeformActions[i].x, `Freeform action at index ${i} x value`);
      assertValidNumber(freeformActions[i].y, `Freeform action at index ${i} y value`);
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

      const anchor = {
        index: getNextAnchorIndex(),
        action: animationAction,
        weight: 0,
        duration,
        invDuration: 1 / duration,
        iterationEventType:
          animationAction.loop === LoopOnce
            ? AnimationStateEvent.FINISH
            : AnimationStateEvent.ITERATE,
        x: freeformAction.x,
        y: freeformAction.y,
      };

      anchors.push(anchor);
      this.actionToAnchor.set(animationAction, anchor);
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
   * Sets the blend position in 2D coordinates to determine animation weights.
   * Recalculates weights using barycentric interpolation within triangles
   * or nearest edge interpolation for boundary points.
   *
   * @param x - Target X coordinate in 2D space
   * @param y - Target Y coordinate in 2D space
   * @throws {Error} When x or y coordinate is not a finite number
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
   * Called by the animation state machine on each frame update.
   * Tracks animation progress and emits iteration events for active actions.
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
   * Updates the influence for all anchors in the freeform blend tree.
   * Called when the tree's influence changes but relative weights remain the same.
   */
  protected updateAnchorsInfluence(): void {
    for (const anchor of this.trackableAnchors) {
      this.updateAnchorWeight(anchor);
    }
  }

  /**
   * Recalculates and updates animation weights based on current blend position.
   *
   * Attempts barycentric interpolation if point lies within any triangle.
   * Falls back to nearest boundary edge interpolation for external points.
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
   * Applies barycentric weights if the blend point lies within any triangle.
   *
   * @param result - Map to store calculated weights for each anchor
   * @returns True if barycentric interpolation was applied, false if point is outside all triangles
   */
  private applyBarycentricWeights(result: Map<FreeformAnchor, number>): boolean {
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
   * Applies nearest boundary edge interpolation for points outside the mesh.
   * Finds the closest boundary vertex and interpolates along the nearest edge.
   *
   * @param result - Map to store calculated weights for each anchor
   */
  private applyNearestNeighborWeight(result: Map<FreeformAnchor, number>): void {
    const nearestTriangle = this.triangles[0];
    const closestAnchor = [nearestTriangle.a, nearestTriangle.b, nearestTriangle.c].reduce(
      (a, b) =>
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

    const edge0: [FreeformAnchor, FreeformAnchor] = [closestAnchor, edgeData[0]];
    const edge1: [FreeformAnchor, FreeformAnchor] = [closestAnchor, edgeData[1]];
    const closestEdge =
      calculateDistanceToEdgeSquared(edge0, this.currentX, this.currentY) <
      calculateDistanceToEdgeSquared(edge1, this.currentX, this.currentY)
        ? edge0
        : edge1;

    const [a, b] = closestEdge;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;

    const value = ((this.currentX - a.x) * dx + (this.currentY - a.y) * dy) / lengthSquared;
    const t = Math.max(0, Math.min(1, value));

    result.set(a, 1 - t);
    result.set(b, t);
  }

  /**
   * Sorts triangles by distance from their centroids to the current blend position.
   * Improves performance by checking closer triangles first.
   */
  private sortTriangles(): void {
    this.triangles.sort(
      (a, b) =>
        calculateDistanceSquared(a.centroid.x, a.centroid.y, this.currentX, this.currentY) -
        calculateDistanceSquared(b.centroid.x, b.centroid.y, this.currentX, this.currentY),
    );
  }
}
