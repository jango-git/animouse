import type { AnimationAction } from "three";
import { LoopOnce, MathUtils } from "three";
import { StateEvent } from "../mescellaneous/AnimationStateEvent";
import type { Anchor } from "../mescellaneous/miscellaneous";
import {
  calculateAngularDistance,
  calculateNormalizedAzimuth,
  EPSILON,
  isAzimuthBetween,
} from "../mescellaneous/miscellaneous";
import { AnimationTree } from "./AnimationTree";

export interface PolarAction {
  action: AnimationAction;
  radius: number;
  azimuth: number;
}

export interface PolarBlendTreeOptions {
  centerAction: AnimationAction;
  isLooped: boolean;
}

interface PolarAnchor extends Anchor {
  radius: number;
  azimuth: number;
}

interface Ray {
  azimuth: number;
  anchors: PolarAnchor[];
}

interface Ring {
  radius: number;
  anchors: PolarAnchor[];
}

export class PolarBlendTree extends AnimationTree {
  private readonly activeAnchors = new Set<PolarAnchor>();

  private readonly centerAnchor?: PolarAnchor;
  private readonly rays: Ray[] = [];
  private readonly rings: Ring[] = [];

  private currentRadius = 0;
  private currentAzimuth = 0;

  constructor(
    actions: PolarAction[],
    options: Partial<PolarBlendTreeOptions> = {},
  ) {
    super();

    for (const action of actions) {
      if (action.radius < EPSILON) {
        throw new Error(
          `Radius must be greater than ${EPSILON}, got ${action.radius}`,
        );
      }

      action.action.time = 0;
      action.action.weight = 0;

      const anchor: PolarAnchor = {
        action: action.action,
        radius: action.radius,
        azimuth: calculateNormalizedAzimuth(action.azimuth),
        duration: action.action.getClip().duration,
        previousTime: 0,
        hasFiredIterationEvent: false,
        iterationEventType:
          action.action.loop === LoopOnce
            ? StateEvent.FINISH
            : StateEvent.ITERATE,
      };

      const ray = this.rays.find(
        (r) => Math.abs(r.azimuth - action.azimuth) < EPSILON,
      );

      ray
        ? ray.anchors.push(anchor)
        : this.rays.push({ azimuth: anchor.azimuth, anchors: [anchor] });
    }

    if (this.rays.length < 2) {
      throw new Error("At least two rays are required.");
    }

    const ringCount = this.rays[0].anchors.length;
    if (this.rays.some((r) => r.anchors.length !== ringCount)) {
      throw new Error("All rays must have the same number of anchors.");
    }

    this.rays.sort((a, b) => a.azimuth - b.azimuth);
    for (const ray of this.rays) {
      ray.anchors.sort((a, b) => a.radius - b.radius);
    }

    for (let i = 0; i < ringCount; i++) {
      const anchors = this.rays.map((r) => r.anchors[i]);
      this.rings.push({ radius: anchors[0].radius, anchors });
    }

    const centerAction = options.centerAction;
    if (centerAction) {
      centerAction.time = 0;
      centerAction.weight = 0;

      this.centerAnchor = {
        action: centerAction,
        radius: 0,
        azimuth: 0,
        duration: centerAction.getClip().duration,
        previousTime: 0,
        hasFiredIterationEvent: false,
        iterationEventType:
          centerAction.loop === LoopOnce
            ? StateEvent.FINISH
            : StateEvent.ITERATE,
      };
    }
  }

  public setBlend(radius: number, azimuth: number): void {
    const maxRadius = this.rings[this.rings.length - 1].radius;
    const clampedRadius = MathUtils.clamp(radius, 0, maxRadius);
    const normalizedAzimuth = calculateNormalizedAzimuth(azimuth);

    if (
      this.currentRadius !== clampedRadius ||
      this.currentAzimuth !== normalizedAzimuth
    ) {
      this.currentRadius = clampedRadius;
      this.currentAzimuth = normalizedAzimuth;
      this.updateAnchorsInfluence();
    }
  }

  protected ["onTickInternal"](): void {
    for (const anchor of this.activeAnchors) {
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

  protected updateAnchorsInfluence(): void {
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
        const angularDistance = calculateAngularDistance(lAzimuth, rAzimuth);
        const leftDistance = calculateAngularDistance(
          lAzimuth,
          this.currentAzimuth,
        );
        const rRayT = leftDistance / angularDistance;
        const lRayT = 1 - rRayT;

        if (this.currentRadius < this.rings[0].radius) {
          let lWeight = lRayT * this.influenceInternal;
          let rWeight = rRayT * this.influenceInternal;

          if (this.centerAnchor) {
            const ringWeight = this.currentRadius / this.rings[0].radius;
            weights.set(
              this.centerAnchor,
              (1 - ringWeight) * this.influenceInternal,
            );
            lWeight *= ringWeight;
            rWeight *= ringWeight;
          }

          weights.set(lRay.anchors[0], lWeight);
          weights.set(rRay.anchors[0], rWeight);
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
      this.updateAnchorWeight(anchor, weight);
    }
  }

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

        weights.set(
          innerRing.anchors[lRayIndex],
          innerRingT * lRayT * this.influenceInternal,
        );
        weights.set(
          outerRing.anchors[lRayIndex],
          innerRingT * rRayT * this.influenceInternal,
        );
        weights.set(
          innerRing.anchors[rRayIndex],
          outerRingT * lRayT * this.influenceInternal,
        );
        weights.set(
          outerRing.anchors[rRayIndex],
          outerRingT * rRayT * this.influenceInternal,
        );

        return;
      }
    }

    throw new Error("No matching result found");
  }
}
