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

const MIN_ACTION_COUNT = 3;

export interface FreeformAction {
  action: AnimationAction;
  x: number;
  y: number;
}

interface FreeformAnchor extends Anchor {
  action: AnimationAction;
  x: number;
  y: number;
}

interface FreeformTriangle
  extends Omit<
    Triangle<FreeformAnchor>,
    "circumcenter" | "circumradiusSquared"
  > {
  centroid: Vector2Like;
}

export class FreeformBlendTree extends AnimationTree {
  private readonly activeAnchors = new Set<FreeformAnchor>();
  private readonly triangles: FreeformTriangle[] = [];
  private readonly boundaryEdgeMap = new Map<
    FreeformAnchor,
    [FreeformAnchor, FreeformAnchor]
  >();

  private currentX = 0;
  private currentY = 0;

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

      const duration = animationAction.getClip().duration;
      if (duration <= 0) {
        throw new Error("Action duration must be greater than zero");
      }

      anchors.push({
        action: animationAction,
        weight: 0,
        duration,
        previousTime: 0,
        hasFiredIterationEvent: false,
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

  protected ["onTickInternal"](): void {
    for (const triangle of this.triangles) {
      for (const anchor of [triangle.a, triangle.b, triangle.c]) {
        this.updateAnchorTime(anchor);
      }
    }
  }

  protected updateAnchorsInfluence(): void {
    for (const triangle of this.triangles) {
      for (const anchor of [triangle.a, triangle.b, triangle.c]) {
        this.updateAnchor(anchor);
      }
    }
  }

  private updateAnchors(): void {
    const weights = new Map<FreeformAnchor, number>();

    for (const anchor of this.activeAnchors) {
      weights.set(anchor, 0);
    }

    if (!this.applyBarycentricWeights(weights)) {
      this.applyNearestNeighborWeight(weights);
    }

    this.activeAnchors.clear();

    for (const [anchor, weight] of weights) {
      this.activeAnchors.add(anchor);
      this.updateAnchor(anchor, weight);
    }
  }

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
