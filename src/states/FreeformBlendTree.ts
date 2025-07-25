import type { AnimationAction } from "three";
import { LoopOnce } from "three";
import { StateEvent } from "../mescellaneous/AnimationStateEvent";
import { assertValidNumber } from "../mescellaneous/assertions";
import {
  DelaunayTriangulation,
  type Triangle,
} from "../mescellaneous/DelaunayTriangulation";
import {
  calculateDistanceSquared,
  calculateDistanceToEdgeSquared,
  EPSILON,
  type Anchor,
} from "../mescellaneous/miscellaneous";
import { AnimationTree } from "./AnimationTree";

const MIN_ACTIONS = 3;

export interface FreeformAction {
  action: AnimationAction;
  x: number;
  y: number;
}

export interface FreeformAnchor extends Anchor {
  x: number;
  y: number;
  action: AnimationAction;
}

type FreeformTriangle = Triangle<FreeformAnchor>;

export class FreeformBlendTree extends AnimationTree {
  private readonly activeAnchors = new Set<FreeformAnchor>();
  private readonly triangles: FreeformTriangle[] = [];
  private readonly outerEdges = new Map<
    FreeformAnchor,
    [FreeformAnchor, FreeformAnchor]
  >();

  private currentX = 0;
  private currentY = 0;

  constructor(freeformActions: FreeformAction[]) {
    super();

    if (freeformActions.length < MIN_ACTIONS) {
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
            ? StateEvent.FINISH
            : StateEvent.ITERATE,
        x: freeformAction.x,
        y: freeformAction.y,
      });
    }

    const result = DelaunayTriangulation.triangulate(anchors);
    this.triangles = result.triangles;
    this.outerEdges = result.outerEdges;
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

    const containingTriangle = this.findContainingTriangle();

    containingTriangle
      ? this.applyBarycentricWeights(weights, containingTriangle)
      : this.applyNearestNeighborWeight(weights);

    this.activeAnchors.clear();

    for (const [anchor, weight] of weights) {
      this.activeAnchors.add(anchor);
      this.updateAnchor(anchor, weight);
    }
  }

  private findContainingTriangle(): FreeformTriangle | undefined {
    for (const blendTriangle of this.triangles) {
      if (this.isPointInTriangle(blendTriangle)) {
        return blendTriangle;
      }
    }

    return undefined;
  }

  private isPointInTriangle(triangle: FreeformTriangle): boolean {
    const x = this.currentX;
    const y = this.currentY;
    const { a, b, c } = triangle;

    const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    const EPSILON_TRIANGLE = 1e-10;

    if (Math.abs(denom) < EPSILON_TRIANGLE) {
      return false;
    }

    const alpha = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / denom;
    const beta = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / denom;
    const gamma = 1 - alpha - beta;

    return alpha >= 0 && beta >= 0 && gamma >= 0;
  }

  private applyBarycentricWeights(
    result: Map<FreeformAnchor, number>,
    anchor: FreeformTriangle,
  ): void {
    const { a, b, c } = anchor;
    const x = this.currentX;
    const y = this.currentY;

    const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    const alpha = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / denom;
    const beta = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / denom;
    const gamma = 1 - alpha - beta;

    result.set(a, alpha);
    result.set(b, beta);
    result.set(c, gamma);
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

    const edgeData = this.outerEdges.get(closestAnchor);
    if (edgeData === undefined) {
      throw new Error("Edge data not found");
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
          a.circumcenter.x,
          a.circumcenter.y,
          this.currentX,
          this.currentY,
        ) -
        calculateDistanceSquared(
          b.circumcenter.x,
          b.circumcenter.y,
          this.currentX,
          this.currentY,
        ),
    );
  }
}
