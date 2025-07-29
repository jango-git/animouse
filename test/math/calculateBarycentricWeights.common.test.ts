import { test } from "uvu";
import * as assert from "uvu/assert";
import { calculateBarycentricWeights } from "../../src/mescellaneous/math";

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
  assert.throws(
    () => calculateBarycentricWeights({ x: NaN, y: 1 }, CACHE),
    /finite number/,
  );
  assert.throws(
    () => calculateBarycentricWeights({ x: Infinity, y: 1 }, CACHE),
    /finite number/,
  );
  assert.throws(
    () => calculateBarycentricWeights({ x: -Infinity, y: 1 }, CACHE),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
        CACHE,
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
        CACHE,
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate point.y parameter", () => {
  assert.throws(
    () => calculateBarycentricWeights({ x: 1, y: NaN }, CACHE),
    /finite number/,
  );
  assert.throws(
    () => calculateBarycentricWeights({ x: 1, y: Infinity }, CACHE),
    /finite number/,
  );
  assert.throws(
    () => calculateBarycentricWeights({ x: 1, y: -Infinity }, CACHE),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: Number.MAX_SAFE_INTEGER + 1 },
        CACHE,
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: -Number.MAX_SAFE_INTEGER - 1 },
        CACHE,
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate origin.x parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          origin: { x: NaN, y: 0 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          origin: { x: Infinity, y: 0 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          origin: { x: -Infinity, y: 0 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          origin: { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          origin: { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate origin.y parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          origin: { x: 0, y: NaN },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          origin: { x: 0, y: Infinity },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          origin: { x: 0, y: -Infinity },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          origin: { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          origin: { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.min.x parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          min: { x: NaN, y: 0 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          min: { x: Infinity, y: 0 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          min: { x: -Infinity, y: 0 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          min: { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          min: { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.min.y parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          min: { x: 0, y: NaN },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          min: { x: 0, y: Infinity },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          min: { x: 0, y: -Infinity },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          min: { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          min: { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.max.x parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          max: { x: NaN, y: 2 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          max: { x: Infinity, y: 2 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          max: { x: -Infinity, y: 2 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          max: { x: Number.MAX_SAFE_INTEGER + 1, y: 2 },
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          max: { x: -Number.MAX_SAFE_INTEGER - 1, y: 2 },
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.max.y parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          max: { x: 2, y: NaN },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          max: { x: 2, y: Infinity },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          max: { x: 2, y: -Infinity },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          max: { x: 2, y: Number.MAX_SAFE_INTEGER + 1 },
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          max: { x: 2, y: -Number.MAX_SAFE_INTEGER - 1 },
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.u.x parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          u: { x: NaN, y: 0 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          u: { x: Infinity, y: 0 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          u: { x: -Infinity, y: 0 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          u: { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          u: { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.u.y parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          u: { x: 1, y: NaN },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          u: { x: 1, y: Infinity },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          u: { x: 1, y: -Infinity },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          u: { x: 1, y: Number.MAX_SAFE_INTEGER + 1 },
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          u: { x: 1, y: -Number.MAX_SAFE_INTEGER - 1 },
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.v.x parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          v: { x: NaN, y: 1 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          v: { x: Infinity, y: 1 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          v: { x: -Infinity, y: 1 },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          v: { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          v: { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.v.y parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          v: { x: 0, y: NaN },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          v: { x: 0, y: Infinity },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          v: { x: 0, y: -Infinity },
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          v: { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          v: { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.d00 parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d00: NaN,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d00: Infinity,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d00: -Infinity,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d00: Number.MAX_SAFE_INTEGER + 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d00: -Number.MAX_SAFE_INTEGER - 1,
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.d01 parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d01: NaN,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d01: Infinity,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d01: -Infinity,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d01: Number.MAX_SAFE_INTEGER + 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d01: -Number.MAX_SAFE_INTEGER - 1,
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.d11 parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d11: NaN,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d11: Infinity,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d11: -Infinity,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d11: Number.MAX_SAFE_INTEGER + 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          d11: -Number.MAX_SAFE_INTEGER - 1,
        },
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.invDenom parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          invDenom: NaN,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          invDenom: Infinity,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          invDenom: -Infinity,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          invDenom: Number.MAX_SAFE_INTEGER + 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        {
          ...CACHE,
          invDenom: -Number.MAX_SAFE_INTEGER - 1,
        },
      ),
    /maximum safe integer/,
  );
});

test.run();
