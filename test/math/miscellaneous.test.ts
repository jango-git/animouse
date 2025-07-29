import { test } from "uvu";
import * as assert from "uvu/assert";
import { EPSILON, PI2 } from "../../src/mescellaneous/miscellaneous";

test("constants: should have PI2 equal to 2π", () => {
  assert.equal(PI2, Math.PI * 2);
});

test("constants: should have EPSILON equal to 1e-6", () => {
  assert.equal(EPSILON, 1e-6);
});

test.run();
