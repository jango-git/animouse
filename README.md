# Animouse 🐭

A lightweight animation state machine for Three.js that makes complex animation blending and transitions easy.

[![npm version](https://img.shields.io/npm/v/animouse.svg)](https://www.npmjs.com/package/animouse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-%5E0.176.0-blue)](https://threejs.org/)

## Features

- 🎮 Simple single-state animation control
- 📊 Linear (1D) animation blending
- 🎯 Directional (2D) animation blending
- 🔄 Smooth state transitions
- 🚦 Event-driven state changes
- 🎬 Automatic transitions on animation completion
- 📈 Data-driven transitions
- 🔄 Animation iteration events
- ⚡ Lightweight and efficient
- 📦 Full TypeScript support

## Installation

```bash
npm install animouse
```

## Requirements

- Three.js ^0.176.0 (peer dependency)

## Usage

### Basic Animation State (0D)

Control a single animation with simple power control:

```typescript
import { AnimationState0D } from 'animouse';
import { AnimationMixer, AnimationAction } from 'three';

// Create animation state
const state = new AnimationState0D(action);

// Control animation power (0 to 1)
state.power = 0.5;  // Set animation to half strength
state.power = 1;    // Full strength
state.power = 0;    // Stop animation

// Track animation progress
console.log(state.progress); // Value between 0 and 1

// Update in animation loop
function animate(deltaTime) {
  state.update(deltaTime);
}
```

### Linear Blend Space (1D)

Blend between multiple animations along a single axis:

```typescript
import { AnimationState1D } from 'animouse';

// Setup blend space with multiple animations
const blendSpace = new AnimationState1D([
  { action: walkAction, value: 0 },    // Start of blend space
  { action: jogAction, value: 0.5 },   // Middle of blend space
  { action: runAction, value: 1 }      // End of blend space
]);

// Control overall power
blendSpace.power = 1;

// Blend between animations (0 to 1)
blendSpace.setBlend(0);    // Pure walk
blendSpace.setBlend(0.5);  // Perfect blend between walk and run
blendSpace.setBlend(1);    // Pure run

// Track progress of most active animation
console.log(blendSpace.progress);

// Update in animation loop
function animate(deltaTime) {
  blendSpace.update(deltaTime);
}
```

### Directional Blend Space (2D)

Perfect for directional animations like movement or aiming:

```typescript
import { AnimationState2D } from 'animouse';

// Create 2D blend space with cardinal directions
const directionalState = new AnimationState2D(
  rightAction,    // +X
  leftAction,     // -X
  forwardAction,  // +Y
  backAction,     // -Y
  idleAction      // Center
);

// Control overall power
directionalState.power = 1;

// Blend based on 2D direction (-1 to 1 for each axis)
directionalState.setBlend(1, 0);      // Pure right movement
directionalState.setBlend(-0.7, 0.7); // Diagonal left-forward
directionalState.setBlend(0, 0);      // Center/idle

// Track progress of most active animation
console.log(directionalState.progress);

// Update in animation loop
function animate(deltaTime) {
  directionalState.update(deltaTime);
}
```

### Animation State Machine

Create complex animation systems with different types of transitions:

```typescript
import { AnimationStateMachine } from 'animouse';

// Create state machine
const stateMachine = new AnimationStateMachine(idleState, mixer);

// Event-driven transitions
stateMachine.addEventTransition('JUMP', {
  from: idleState,       // Optional: specify source state
  to: jumpState,         // Target state
  duration: 0.2,         // Transition duration
  condition: () => true  // Optional condition
});

// Automatic transitions (on animation completion)
stateMachine.addAutomaticTransition(jumpState, {
  to: fallState,
  duration: 0.3
});

// Data-driven transitions (checked every frame)
stateMachine.addDataTransition(fallState, {
  to: landState,
  duration: 0.2,
  data: [player],
  condition: (player) => player.isGrounded
});

// Handle event transitions
stateMachine.handleEvent('JUMP');

// Update every frame
function animate(deltaTime) {
  stateMachine.update(deltaTime);
}
```

### Events

Animation states emit events for important state changes:

```typescript
import { AnimationStateEvent } from 'animouse';

state.on(AnimationStateEvent.ENTER, (state) => {
  console.log('Animation started');
});

state.on(AnimationStateEvent.EXIT, (state) => {
  console.log('Animation stopped');
});

state.on(AnimationStateEvent.ITERATION, (state) => {
  console.log('Animation completed one cycle');
});
```

## API Documentation

For detailed API documentation, please check the TypeScript definitions included with the package.

## License

MIT © [jango](https://github.com/jango-git)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

- Built with [Three.js](https://threejs.org/)
- Event system powered by [eventail](https://www.npmjs.com/package/eventail)