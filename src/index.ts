/**
 * @file index.ts
 * @description Main entry point for the Animouse library, which provides tools for animation state management
 * and blending in THREE.js applications. This library includes classes for managing animation states in
 * 0D (single animation), 1D (linear blend), and 2D (directional blend) spaces, as well as a state machine
 * for handling transitions between animation states.
 * 
 * @module animouse
 */

export * from "./AnimationState";
export * from "./AnimationState0D";
export * from "./AnimationState1D";
export * from "./AnimationState2D";
export * from "./AnimationStateEvent";
export * from "./AnimationStateMachine";