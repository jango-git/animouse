import { expect, test } from "vitest";
import { buildMockLinearAction } from "../mocks/buildMockAction";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";

test("setInfluence: should throw error for invalid influence values", () => {
  const tree = new LinearBlendTreeProxy([buildMockLinearAction(0), buildMockLinearAction(1)]);

  expect(() => {
    tree.invokeSetInfluence(NaN);
  }).toThrow(/value must be a finite number/);
  expect(() => {
    tree.invokeSetInfluence(Infinity);
  }).toThrow(/value must be a finite number/);
  expect(() => {
    tree.invokeSetInfluence(-Infinity);
  }).toThrow(/value must be a finite number/);
  expect(() => {
    tree.invokeSetInfluence(Number.MAX_SAFE_INTEGER + 1);
  }).toThrow(/value exceeds maximum safe integer range/);
  expect(() => {
    tree.invokeSetInfluence(-Number.MAX_SAFE_INTEGER - 1);
  }).toThrow(/value exceeds maximum safe integer range/);
  expect(() => {
    tree.invokeSetInfluence(-0.1);
  }).toThrow(/value must be between 0 and 1/);
  expect(() => {
    tree.invokeSetInfluence(1.1);
  }).toThrow(/value must be between 0 and 1/);
});
