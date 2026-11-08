import { expect, test } from "vitest";
import { DelaunayTriangulator } from "../../src/miscellaneous/DelaunayTriangulator";

test("triangulate: ...", () => {
  expect(() =>
    DelaunayTriangulator.triangulate([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    ]),
  ).toThrow(/At least/);
});

test("triangulate: ...", () => {
  expect(() =>
    DelaunayTriangulator.triangulate([
      { x: 0, y: NaN },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    DelaunayTriangulator.triangulate([
      { x: 0, y: 0 },
      { x: 1, y: Infinity },
      { x: 0, y: 1 },
    ]),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    DelaunayTriangulator.triangulate([
      { x: 0, y: 0 },
      { x: 1, y: -Infinity },
      { x: 0, y: 1 },
    ]),
  ).toThrow(/value must be a finite number/);
  expect(() =>
    DelaunayTriangulator.triangulate([
      { x: 0, y: 0 },
      { x: Number.MAX_SAFE_INTEGER + 1, y: 1 },
      { x: 0, y: 1 },
    ]),
  ).toThrow(/value exceeds maximum safe integer range/);
  expect(() =>
    DelaunayTriangulator.triangulate([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: -Number.MAX_SAFE_INTEGER - 1, y: 0 },
    ]),
  ).toThrow(/value exceeds maximum safe integer range/);
});

test("triangulate: ...", () => {
  expect(() =>
    DelaunayTriangulator.triangulate([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 1 },
    ]),
  ).toThrow(/Duplicate points/);
});

test("triangulate: ...", () => {
  expect(() =>
    DelaunayTriangulator.triangulate([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ]),
  ).toThrow(/collinear/);
});
