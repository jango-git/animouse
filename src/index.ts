/**
 * @file index.ts
 * @description Main entry point for the Animouse library, which provides tools for animation state management
 * and blending in THREE.js applications. This library enables sophisticated animation control through:
 * 
 * - Single animation control (0D) with {@link AnimationState0D}
 * - Linear blending between animations (1D) with {@link AnimationState1D}
 * - Directional blending for movement animations (2D) with {@link AnimationState2D}
 * - Complex state transitions via {@link AnimationStateMachine}
 * 
 * Each animation state can:
 * - Control animation power/weight (0-1)
 * - Monitor animation progress
 * - Emit lifecycle events (enter, exit, iteration)
 * - Blend smoothly with other states
 * 
 * The state machine supports:
 * - Event-triggered transitions
 * - Automatic transitions at animation completion
 * - Data-driven transitions based on conditions
 * - Smooth cross-fading between states
 * 
 * @module animouse
 * @requires three
 * @requires eventail
 */

export * from "./AnimationState";
export * from "./AnimationState0D";
export * from "./AnimationState1D";
export * from "./AnimationState2D";
export * from "./AnimationStateEvent";
export * from "./AnimationStateMachine";