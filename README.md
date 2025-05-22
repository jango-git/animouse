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
- 🔒 Strict state encapsulation
- ⚡ Lightweight and efficient
- 📦 Full TypeScript support

## Installation

```bash
npm install animouse
```

## Requirements

- Three.js ^0.176.0 (peer dependency)

## Usage

### Animation State Machine

The AnimationStateMachine is the core controller for all animation states. It manages state transitions, updates, and power levels:

```typescript
import { AnimationStateMachine } from 'animouse';

// Create state machine with initial state
const stateMachine = new AnimationStateMachine(idleState, mixer);

// Update in animation loop (required)
function animate(deltaTime) {
  stateMachine.update(deltaTime);
}
```

### Basic Animation State (0D)

Control a single animation:

```typescript
import { AnimationState0D } from 'animouse';

// Create animation state
const state = new AnimationState0D(action);

// Get current animation progress
console.log(state.progress); // Value between 0 and 1

// Get current power level
console.log(state.power); // Value between 0 and 1
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

// Track progress of most active animation
console.log(blendSpace.progress);

// Blend between animations (0 to 1)
blendSpace.setBlend(0);    // Pure walk
blendSpace.setBlend(0.5);  // Perfect blend between walk and run
blendSpace.setBlend(1);    // Pure run
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

// Track progress of most active animation
console.log(directionalState.progress);

// Blend based on 2D direction (-1 to 1 for each axis)
directionalState.setBlend(1, 0);      // Pure right movement
directionalState.setBlend(-0.7, 0.7); // Diagonal left-forward
directionalState.setBlend(0, 0);      // Center/idle
```

### State Transitions

AnimationStateMachine supports three types of transitions:

1. Event-driven transitions:
```typescript
// Transition when event occurs
stateMachine.addEventTransition('JUMP', {
  from: idleState,       // Optional: specify source state
  to: jumpState,         // Target state
  duration: 0.2,         // Transition duration
  condition: () => true  // Optional condition
});

// Trigger the transition
stateMachine.handleEvent('JUMP');
```

2. Automatic transitions (on animation completion):
```typescript
// Transition automatically when jump animation completes
stateMachine.addAutomaticTransition(jumpState, {
  to: fallState,
  duration: 0.3
});
```

3. Data-driven transitions:
```typescript
// Transition based on game state
stateMachine.addDataTransition(fallState, {
  to: landState,
  duration: 0.2,
  data: [player],
  condition: (player) => player.isGrounded
});
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

## Important Notes

1. Animation states are managed exclusively by the AnimationStateMachine:
   - Power levels are controlled internally
   - State updates are handled automatically
   - Never modify state power or call update directly

2. All animation states must be updated through the AnimationStateMachine:
   - Call `stateMachine.update(deltaTime)` every frame
   - This updates both active and transitioning states

## API Documentation

For detailed API documentation, please check the TypeScript definitions included with the package.

## License

MIT © [jango](https://github.com/jango-git)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

- Built with [Three.js](https://threejs.org/)
- Event system powered by [eventail](https://www.npmjs.com/package/eventail)