/**
 * Small epsilon value used for floating-point comparisons.
 */
export const EPSILON = 1e-6;

/**
 * Two times PI (2π), commonly used for full circle calculations.
 */
export const PI2 = Math.PI * 2;

/**
 * Asserts that a number is valid (finite and within safe integer range).
 *
 * @param value - The number to validate
 * @param message - Custom error message for validation failure
 * @throws {Error} When the value is not finite or exceeds MAX_SAFE_INTEGER
 */
export function assertValidNumber(value: number, message: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${message}: value must be a finite number`);
  }

  if (Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    throw new Error(`${message}: value exceeds maximum safe integer range`);
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
    throw new Error(`${message}: azimuth must be between 0 and 2π radians`);
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
    throw new Error(`${message}: value must be between 0 and 1`);
  }
}

/**
 * Asserts that a number is positive (greater or equal to EPSILON).
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

  if (value < EPSILON) {
    throw new Error(`${message}: value must be greater or equal to ${EPSILON}`);
  }
}

/**
 * Asserts that a number is non-negative (greater than or equal to 0).
 *
 * @param value - The number to validate
 * @param message - Custom error message for validation failure
 * @throws {Error} When the value is negative
 */
export function assertValidNonNegativeNumber(
  value: number,
  message: string,
): void {
  assertValidNumber(value, message);

  if (value < 0) {
    throw new Error(`${message}: value must be greater than or equal to 0`);
  }
}
