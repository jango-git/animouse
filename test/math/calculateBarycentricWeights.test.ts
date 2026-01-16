import { test } from "uvu";
import * as assert from "uvu/assert";
import {
  calculateBarycentricWeights,
  precomputeTriangle,
  Vector2Like,
} from "../../src/mescellaneous/math";
import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";

export function barycentricWeights(
  p: Vector2Like,
  a: Vector2Like,
  b: Vector2Like,
  c: Vector2Like,
): { aW: number; bW: number; cW: number } | undefined {
  const det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
  if (Math.abs(det) < 1e-6) {
    throw new Error("Degenerate triangle");
  }

  const aW = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / det;
  const bW = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / det;
  const cW = 1 - aW - bW;

  if (aW < 0 || bW < 0 || cW < 0) {
    return undefined;
  }

  return { aW, bW, cW };
}

function testBarycentricWeights(x: number, y: number): void {
  /*
    Triangle vertices:
      A(0,0)
      B(0,1)
      C(1,0)

      B (0,1)
      *
      | \
      |   \
      *-----*
    A(0,0)  C(1,0)
  */

  const p = { x, y };
  const a = { x: 0, y: 0 };
  const b = { x: 0, y: 1 };
  const c = { x: 1, y: 0 };

  const expected = barycentricWeights(p, a, b, c);
  const actual = calculateBarycentricWeights(p, precomputeTriangle(a, b, c));

  if (expected === undefined || actual === undefined) {
    assert.equal(actual, expected);
  } else {
    assertEqualWithTolerance(actual.aW, expected.aW, "aW weight");
    assertEqualWithTolerance(actual.bW, expected.bW, "bW weight");
    assertEqualWithTolerance(actual.cW, expected.cW, "cW weight");
    assertEqualWithTolerance(
      actual.aW + actual.bW + actual.cW,
      1,
      "sum of weights",
    );
  }
}

test("calculateBarycentricWeights: beyond, next to A", () => {
  testBarycentricWeights(-0.1, -0.1);
});

test("calculateBarycentricWeights: beyond, next to B", () => {
  testBarycentricWeights(-0.1, 1.1);
});

test("calculateBarycentricWeights: beyond, next to C", () => {
  testBarycentricWeights(1.1, -0.1);
});

test("calculateBarycentricWeights: exact A", () => {
  testBarycentricWeights(0, 0);
});

test("calculateBarycentricWeights: exact B", () => {
  testBarycentricWeights(0, 1);
});

test("calculateBarycentricWeights: exact C", () => {
  testBarycentricWeights(1, 0);
});

test("calculateBarycentricWeights: within, next to A", () => {
  testBarycentricWeights(0.1, 0.1);
});

test("calculateBarycentricWeights: within, next to B", () => {
  testBarycentricWeights(0.1, 0.8);
});

test("calculateBarycentricWeights: within, next to C", () => {
  testBarycentricWeights(0.8, 0.1);
});

test("calculateBarycentricWeights: edge between A and B", () => {
  testBarycentricWeights(0, 0.4);
});

test("calculateBarycentricWeights: edge between A and C", () => {
  testBarycentricWeights(0.4, 0);
});

test("calculateBarycentricWeights: edge between B and C", () => {
  testBarycentricWeights(0.4, 0.6);
});

test("calculateBarycentricWeights: beyond edge between A and B", () => {
  testBarycentricWeights(-0.1, 0.4);
});

test("calculateBarycentricWeights: beyond edge between A and C", () => {
  testBarycentricWeights(0.4, -0.1);
});

test("calculateBarycentricWeights: beyond edge between B and C", () => {
  testBarycentricWeights(0.8, 0.3);
});

test.run();
