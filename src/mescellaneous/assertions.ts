import { PI2 } from "./miscellaneous";

/**
 * Asserts that a number is valid (finite and within safe integer range).
 *
 * @param value - The number to validate
 * @param message - Custom error message for validation failure
 * @throws {Error} When the value is not finite or exceeds MAX_SAFE_INTEGER
 */
export function assertValidNumber(value: number, message: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${message}: Value must be a finite number`);
  }

  if (Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    throw new Error(`${message}: Value exceeds maximum safe integer range`);
  }
}

/**
 * Asserts that an azimuth angle is valid (finite, within safe range, and between 0 and 2π).
 *
 * @param value - The azimuth angle in radians to validate
 * @param message - Custom error message for validation failure
 * @throws {Error} When the value is not finite, exceeds MAX_SAFE_INTEGER, or is not between 0 and 2π radians
 */
export function assertValidAzimuth(value: number, message: string): void {
  assertValidNumber(value, message);

  if (value < 0 || value > PI2) {
    throw new Error(`${message}: Azimuth must be between 0 and 2π radians`);
  }
}

/**
 * Asserts that a number is within the unit range [0, 1].
 *
 * @param value - The number to validate
 * @param message - Custom error message for validation failure
 * @throws {Error} When the value is not within the range [0, 1]
 */
export function assertValidUnitRange(value: number, message: string): void {
  assertValidNumber(value, message);

  if (value < 0 || value > 1) {
    throw new Error(`${message}: Value must be between 0 and 1`);
  }
}

/**
 * Asserts that a number is positive (greater than 0).
 *
 * @param value - The number to validate
 * @param message - Custom error message for validation failure
 * @throws {Error} When the value is not greater than 0
 */
export function assertValidPositiveNumber(
  value: number,
  message: string,
): void {
  assertValidNumber(value, message);

  if (value <= 0) {
    throw new Error(`${message}: Value must be greater than 0`);
  }
}
