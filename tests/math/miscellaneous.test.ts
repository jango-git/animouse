import { expect, test } from "vitest";
import { EPSILON, PI2 } from "../../src/miscellaneous/miscellaneous";

test("constants: should have PI2 equal to 2π", () => {
  expect(PI2).toEqual(Math.PI * 2);
});

test("constants: should have EPSILON equal to 1e-6", () => {
  expect(EPSILON).toEqual(1e-6);
});
