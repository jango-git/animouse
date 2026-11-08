import { expect, test } from "vitest";
import { calculateDistanceToEdgeSquared } from "../../src/miscellaneous/math";

test("calculateDistanceToEdgeSquared: should validate 'edge[0].x' value", () => {
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: NaN, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: Infinity, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: -Infinity, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
});

test("calculateDistanceToEdgeSquared: should validate 'edge[0].y' value", () => {
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: NaN },
        { x: 0, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: Infinity },
        { x: 0, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: -Infinity },
        { x: 0, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
        { x: 0, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
        { x: 0, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
});

test("calculateDistanceToEdgeSquared: should validate 'edge[1].x' value", () => {
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: NaN, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: Infinity, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: -Infinity, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: Number.MAX_SAFE_INTEGER + 1, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
      ],
      1,
      2,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
});

test("calculateDistanceToEdgeSquared: should validate 'edge[1].y' value", () => {
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: NaN },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: Infinity },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: -Infinity },
      ],
      1,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: Number.MAX_SAFE_INTEGER + 1 },
      ],
      1,
      2,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: -Number.MAX_SAFE_INTEGER - 1 },
      ],
      1,
      2,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
});

test("calculateDistanceToEdgeSquared: should validate 'x' value", () => {
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      NaN,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      Infinity,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      -Infinity,
      2,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      Number.MAX_SAFE_INTEGER + 1,
      2,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      -Number.MAX_SAFE_INTEGER - 1,
      2,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
});

test("calculateDistanceToEdgeSquared: should validate 'y' value", () => {
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      NaN,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      Infinity,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      -Infinity,
    ),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      Number.MAX_SAFE_INTEGER + 1,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
  expect(() =>
    calculateDistanceToEdgeSquared(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      -Number.MAX_SAFE_INTEGER - 1,
    ),
  ).toThrow(/value exceeds maximum safe integer range/);
});
