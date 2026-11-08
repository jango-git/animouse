import { expect, test } from "vitest";
import { calculateBarycentricWeights } from "../../src/miscellaneous/math";

const CACHE = {
  origin: { x: 0, y: 0 },
  min: { x: 0, y: 0 },
  max: { x: 2, y: 2 },
  u: { x: 1, y: 0 },
  v: { x: 0, y: 1 },
  d00: 1,
  d01: 0,
  d11: 1,
  invDenom: 1,
};

test("calculateBarycentricWeights: should validate point.x parameter", () => {
  expect(() => calculateBarycentricWeights({ x: NaN, y: 1 }, CACHE)).toThrow(/finite number/);
  expect(() => calculateBarycentricWeights({ x: Infinity, y: 1 }, CACHE)).toThrow(/finite number/);
  expect(() => calculateBarycentricWeights({ x: -Infinity, y: 1 }, CACHE)).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights({ x: Number.MAX_SAFE_INTEGER + 1, y: 1 }, CACHE),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights({ x: -Number.MAX_SAFE_INTEGER - 1, y: 1 }, CACHE),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate point.y parameter", () => {
  expect(() => calculateBarycentricWeights({ x: 1, y: NaN }, CACHE)).toThrow(/finite number/);
  expect(() => calculateBarycentricWeights({ x: 1, y: Infinity }, CACHE)).toThrow(/finite number/);
  expect(() => calculateBarycentricWeights({ x: 1, y: -Infinity }, CACHE)).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights({ x: 1, y: Number.MAX_SAFE_INTEGER + 1 }, CACHE),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights({ x: 1, y: -Number.MAX_SAFE_INTEGER - 1 }, CACHE),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate origin.x parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        origin: { x: NaN, y: 0 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        origin: { x: Infinity, y: 0 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        origin: { x: -Infinity, y: 0 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        origin: { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        origin: { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate origin.y parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        origin: { x: 0, y: NaN },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        origin: { x: 0, y: Infinity },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        origin: { x: 0, y: -Infinity },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        origin: { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        origin: { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.min.x parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        min: { x: NaN, y: 0 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        min: { x: Infinity, y: 0 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        min: { x: -Infinity, y: 0 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        min: { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        min: { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.min.y parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        min: { x: 0, y: NaN },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        min: { x: 0, y: Infinity },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        min: { x: 0, y: -Infinity },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        min: { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        min: { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.max.x parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        max: { x: NaN, y: 2 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        max: { x: Infinity, y: 2 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        max: { x: -Infinity, y: 2 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        max: { x: Number.MAX_SAFE_INTEGER + 1, y: 2 },
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        max: { x: -Number.MAX_SAFE_INTEGER - 1, y: 2 },
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.max.y parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        max: { x: 2, y: NaN },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        max: { x: 2, y: Infinity },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        max: { x: 2, y: -Infinity },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        max: { x: 2, y: Number.MAX_SAFE_INTEGER + 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        max: { x: 2, y: -Number.MAX_SAFE_INTEGER - 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.u.x parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        u: { x: NaN, y: 0 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        u: { x: Infinity, y: 0 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        u: { x: -Infinity, y: 0 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        u: { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        u: { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.u.y parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        u: { x: 1, y: NaN },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        u: { x: 1, y: Infinity },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        u: { x: 1, y: -Infinity },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        u: { x: 1, y: Number.MAX_SAFE_INTEGER + 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        u: { x: 1, y: -Number.MAX_SAFE_INTEGER - 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.v.x parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        v: { x: NaN, y: 1 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        v: { x: Infinity, y: 1 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        v: { x: -Infinity, y: 1 },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        v: { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        v: { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.v.y parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        v: { x: 0, y: NaN },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        v: { x: 0, y: Infinity },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        v: { x: 0, y: -Infinity },
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        v: { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        v: { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.d00 parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d00: NaN,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d00: Infinity,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d00: -Infinity,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d00: Number.MAX_SAFE_INTEGER + 1,
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d00: -Number.MAX_SAFE_INTEGER - 1,
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.d01 parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d01: NaN,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d01: Infinity,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d01: -Infinity,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d01: Number.MAX_SAFE_INTEGER + 1,
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d01: -Number.MAX_SAFE_INTEGER - 1,
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.d11 parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d11: NaN,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d11: Infinity,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d11: -Infinity,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d11: Number.MAX_SAFE_INTEGER + 1,
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        d11: -Number.MAX_SAFE_INTEGER - 1,
      },
    ),
  ).toThrow(/maximum safe integer/);
});

test("calculateBarycentricWeights: should validate cache.invDenom parameter", () => {
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        invDenom: NaN,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        invDenom: Infinity,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        invDenom: -Infinity,
      },
    ),
  ).toThrow(/finite number/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        invDenom: Number.MAX_SAFE_INTEGER + 1,
      },
    ),
  ).toThrow(/maximum safe integer/);
  expect(() =>
    calculateBarycentricWeights(
      { x: 1, y: 1 },
      {
        ...CACHE,
        invDenom: -Number.MAX_SAFE_INTEGER - 1,
      },
    ),
  ).toThrow(/maximum safe integer/);
});
