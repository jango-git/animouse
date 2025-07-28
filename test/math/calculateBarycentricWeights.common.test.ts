import { test } from "uvu";
import * as assert from "uvu/assert";
import { calculateBarycentricWeights } from "../../src/mescellaneous/math";

test("calculateBarycentricWeights: should validate point.x parameter", () => {
  const cache = {
    min: { x: 0, y: 0 },
    max: { x: 2, y: 2 },
    u: { x: 1, y: 0 },
    v: { x: 0, y: 1 },
    d00: 1,
    d01: 0,
    d11: 1,
    invDenom: 1,
  };

  assert.throws(
    () => calculateBarycentricWeights({ x: NaN, y: 1 }, { x: 0, y: 0 }, cache),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights({ x: Infinity, y: 1 }, { x: 0, y: 0 }, cache),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: -Infinity, y: 1 },
        { x: 0, y: 0 },
        cache,
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
        { x: 0, y: 0 },
        cache,
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
        { x: 0, y: 0 },
        cache,
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate point.y parameter", () => {
  const cache = {
    min: { x: 0, y: 0 },
    max: { x: 2, y: 2 },
    u: { x: 1, y: 0 },
    v: { x: 0, y: 1 },
    d00: 1,
    d01: 0,
    d11: 1,
    invDenom: 1,
  };

  assert.throws(
    () => calculateBarycentricWeights({ x: 1, y: NaN }, { x: 0, y: 0 }, cache),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights({ x: 1, y: Infinity }, { x: 0, y: 0 }, cache),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: -Infinity },
        { x: 0, y: 0 },
        cache,
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: Number.MAX_SAFE_INTEGER + 1 },
        { x: 0, y: 0 },
        cache,
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: -Number.MAX_SAFE_INTEGER - 1 },
        { x: 0, y: 0 },
        cache,
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate a.x parameter", () => {
  const cache = {
    min: { x: 0, y: 0 },
    max: { x: 2, y: 2 },
    u: { x: 1, y: 0 },
    v: { x: 0, y: 1 },
    d00: 1,
    d01: 0,
    d11: 1,
    invDenom: 1,
  };

  assert.throws(
    () => calculateBarycentricWeights({ x: 1, y: 1 }, { x: NaN, y: 0 }, cache),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights({ x: 1, y: 1 }, { x: Infinity, y: 0 }, cache),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: -Infinity, y: 0 },
        cache,
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
        cache,
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
        cache,
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate a.y parameter", () => {
  const cache = {
    min: { x: 0, y: 0 },
    max: { x: 2, y: 2 },
    u: { x: 1, y: 0 },
    v: { x: 0, y: 1 },
    d00: 1,
    d01: 0,
    d11: 1,
    invDenom: 1,
  };

  assert.throws(
    () => calculateBarycentricWeights({ x: 1, y: 1 }, { x: 0, y: NaN }, cache),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights({ x: 1, y: 1 }, { x: 0, y: Infinity }, cache),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: -Infinity },
        cache,
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        cache,
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        cache,
      ),
    /maximum safe integer/,
  );
});

test("calculateBarycentricWeights: should validate cache.min.x parameter", () => {
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: NaN, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: Infinity, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: -Infinity, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: NaN },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: Infinity },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: -Infinity },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: NaN, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: Infinity, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: -Infinity, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: Number.MAX_SAFE_INTEGER + 1, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: -Number.MAX_SAFE_INTEGER - 1, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: NaN },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: Infinity },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: -Infinity },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: Number.MAX_SAFE_INTEGER + 1 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: -Number.MAX_SAFE_INTEGER - 1 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: NaN, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: Infinity, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: -Infinity, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: NaN },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: Infinity },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: -Infinity },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: Number.MAX_SAFE_INTEGER + 1 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: -Number.MAX_SAFE_INTEGER - 1 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: NaN, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: Infinity, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: -Infinity, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: -Number.MAX_SAFE_INTEGER - 1, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: NaN },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: Infinity },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: -Infinity },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: NaN,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: Infinity,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: -Infinity,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: Number.MAX_SAFE_INTEGER + 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: -Number.MAX_SAFE_INTEGER - 1,
          d01: 0,
          d11: 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: NaN,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: Infinity,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: -Infinity,
          d11: 1,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: Number.MAX_SAFE_INTEGER + 1,
          d11: 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: -Number.MAX_SAFE_INTEGER - 1,
          d11: 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: NaN,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: Infinity,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: -Infinity,
          invDenom: 1,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: Number.MAX_SAFE_INTEGER + 1,
          invDenom: 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: -Number.MAX_SAFE_INTEGER - 1,
          invDenom: 1,
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
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: NaN,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: Infinity,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: -Infinity,
        },
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: Number.MAX_SAFE_INTEGER + 1,
        },
      ),
    /maximum safe integer/,
  );
  assert.throws(
    () =>
      calculateBarycentricWeights(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        {
          min: { x: 0, y: 0 },
          max: { x: 2, y: 2 },
          u: { x: 1, y: 0 },
          v: { x: 0, y: 1 },
          d00: 1,
          d01: 0,
          d11: 1,
          invDenom: -Number.MAX_SAFE_INTEGER - 1,
        },
      ),
    /maximum safe integer/,
  );
});

test.run();
