/**
 * Symbol used internally to control animation power/weight.
 * This symbol protects the power property from direct external modification,
 * ensuring that only the AnimationStateMachine can adjust animation weights.
 *
 * @internal
 */
export const powerSymbol = Symbol("power");

/**
 * Symbol used internally to update animation state.
 * This symbol protects the update method from direct external calls,
 * ensuring that only the AnimationStateMachine can trigger updates.
 *
 * @internal
 */
export const updateSymbol = Symbol("update");

export const onEnterSymbol = Symbol("onEnterSymbol");
export const onExitSymbol = Symbol("onExitSymbol");
