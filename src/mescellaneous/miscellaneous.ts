import type { AnimationAction, Vector2Like } from "three";
import type { StateEvent } from "./AnimationStateEvent";

export const PI2 = Math.PI * 2;
export const EPSILON = 1e-6;

export interface Anchor {
  action: AnimationAction;
  previousTime: number;
  duration: number;
  hasFiredIterationEvent: boolean;
  iterationEventType: StateEvent;
}

export function normalizeAngle(angle: number): number {
  angle = angle % PI2;
  if (angle < 0) {
    angle += PI2;
  }
  return angle;
}

export function getAngularDistance(from: number, to: number): number {
  const delta = Math.abs(to - from);
  return Math.min(delta, PI2 - delta);
}

export function isAngleBetween(
  angle: number,
  start: number,
  end: number,
): boolean {
  if (start <= end) {
    return angle >= start && angle <= end;
  }

  return angle >= start || angle <= end;
}

export function getDistanceSquared(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

export function getDistanceToEdge(
  [p1, p2]: [Vector2Like, Vector2Like],
  x: number,
  y: number,
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.sqrt(getDistanceSquared(p1.x, p1.y, x, y));
  }

  const t = Math.max(
    0,
    Math.min(1, ((x - p1.x) * dx + (y - p1.y) * dy) / lengthSquared),
  );
  const closestX = p1.x + t * dx;
  const closestY = p1.y + t * dy;

  return Math.sqrt(getDistanceSquared(closestX, closestY, x, y));
}
