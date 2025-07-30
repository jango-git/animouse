# Animouse 🐭

A powerful animation state machine and blending system for Three.js that makes complex animation workflows simple and intuitive.

[![npm version](https://img.shields.io/npm/v/animouse.svg)](https://www.npmjs.com/package/animouse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-%5E0.176.0-blue)](https://threejs.org/)

## Features

- 🎬 **Animation State Machine** - Event-driven, automatic, and data-driven transitions
- 🎯 **Single Clip States** - Simple animation control with lifecycle events
- 📊 **Linear Blend Trees** - 1D blending for speed/intensity variations
- 🧭 **Polar Blend Trees** - 2D blending in polar coordinates (radius/direction)
- 🎨 **Freeform Blend Trees** - Arbitrary 2D blending using Delaunay triangulation
- 🔄 **Smooth Transitions** - Configurable blend durations between states
- 📦 **Full TypeScript Support** - Complete type safety and IntelliSense

## Installation

```bash
npm install animouse
```

## Requirements

- Three.js ^0.175.0 (peer dependency)
- Modern JavaScript environment with ES2020+ support

## Quick Start

```typescript
import { LinearBlendTree, AnimationMachine } from 'animouse';
import { AnimationMixer, Vector2 } from 'three';

// Setup Three.js animation mixer with your loaded character
const mixer = new AnimationMixer(character);

// Create linear blend tree for movement speed
const movementTree = new LinearBlendTree([
  { action: mixer.clipAction(idleClip), value: 0 },    // Idle
  { action: mixer.clipAction(walkClip), value: 0.5 },  // Walk
  { action: mixer.clipAction(runClip), value: 1 }      // Run
]);

// Create state machine
const machine = new AnimationMachine(movementTree, mixer);

// Input handling
const movementInput = new Vector2(0, 0);

function handleInput() {
  // Get movement input (WASD, gamepad, etc.)
  const inputMagnitude = movementInput.length();

  // Blend animations based on movement speed
  // 0 = idle, 0.5 = walk, 1 = run
  movementTree.setBlend(inputMagnitude);
}

// Main update loop
function animate() {
  const deltaTime = clock.getDelta();

  handleInput();             // Update input and blend values
  machine.update(deltaTime); // Update state machine and animations

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

## Examples

🎮 **[Live Examples](https://jango-git.github.io/animouse/)** - Interactive demos showing Animouse in action

Browse working examples that demonstrate:
- Basic GLB character animation loading and playback
- Integration with Three.js scene setup
- Real-time animation control

Visit the examples page to see the library in action and get started with your own animations!
```

## Core Concepts

### Animation States

Animation states are the building blocks of the system. Each state manages one or more Three.js AnimationActions and handles their lifecycle:

- **ClipState** - Wraps a single AnimationAction
- **LinearBlendTree** - Blends multiple actions along a 1D axis
- **PolarBlendTree** - Blends actions in 2D polar coordinates
- **FreeformBlendTree** - Blends actions in arbitrary 2D space

### Animation Machine

The AnimationMachine orchestrates state transitions and manages the overall animation flow. It supports three types of transitions:

1. **Event Transitions** - Triggered by specific events
2. **Automatic Transitions** - Triggered when animations complete
3. **Data Transitions** - Triggered by condition evaluation

## Animation States

### ClipState - Single Animation Control

Control individual animation clips with automatic event handling:

```typescript
import { ClipState, AnimationStateEvent } from 'animouse';

const jumpState = new ClipState(jumpAction);

// Listen for animation events
jumpState.on(AnimationStateEvent.PLAY, (action, state) => {
  console.log('Jump animation started');
});

jumpState.on(AnimationStateEvent.FINISH, (action, state) => {
  console.log('Jump animation completed');
});
```

### LinearBlendTree - 1D Animation Blending

Perfect for speed variations, intensity levels, or any linear progression:

```typescript
import { LinearBlendTree } from 'animouse';

// Create speed-based movement blend tree
const movementTree = new LinearBlendTree([
  { action: idleAction, value: 0 },     // Stationary
  { action: walkAction, value: 1 },     // Slow movement
  { action: jogAction, value: 2 },      // Medium movement
  { action: runAction, value: 3 },      // Fast movement
  { action: sprintAction, value: 4 }    // Maximum speed
]);

// Blend based on movement speed
movementTree.setBlend(2.5); // Blend between jog and run
```

### PolarBlendTree - 2D Polar Blending

Ideal for directional movement with varying intensities:

```typescript
import { PolarBlendTree } from 'animouse';
import { MathUtils } from 'three';

// Create directional movement system
const directionTree = new PolarBlendTree([
  // Walk speed (radius = 1)
  { action: walkForwardAction, radius: 1, azimuth: MathUtils.degToRad(0) },
  { action: walkLeftAction, radius: 1, azimuth: MathUtils.degToRad(-90) },
  { action: walkRightAction, radius: 1, azimuth: MathUtils.degToRad(90) },
  { action: walkBackAction, radius: 1, azimuth: MathUtils.degToRad(180) },

  // Run speed (radius = 2)
  { action: runForwardAction, radius: 2, azimuth: MathUtils.degToRad(0) },
  { action: runLeftAction, radius: 2, azimuth: MathUtils.degToRad(-90) }
  { action: runRightAction, radius: 2, azimuth: MathUtils.degToRad(90) },
  { action: runBackAction, radius: 2, azimuth: MathUtils.degToRad(180) },
], idleAction); // Optional center action

// Blend to northeast at medium speed
directionTree.setBlend(MathUtils.degToRad(45), 1.5);
```

### FreeformBlendTree - Arbitrary 2D Blending

For complex animation spaces with irregular layouts:

```typescript
import { FreeformBlendTree } from 'animouse';

// Create emotion-based facial animation system
const emotionTree = new FreeformBlendTree([
  { action: neutralAction, x: 0, y: 0 },       // Center: neutral
  { action: happyAction, x: 1, y: 1 },         // Happy (positive valence/arousal)
  { action: sadAction, x: -1, y: -0.5 },       // Sad (negative valence, low arousal)
  { action: angryAction, x: -0.8, y: 0.9 },    // Angry (negative valence, high arousal)
  { action: surprisedAction, x: 0.2, y: 1.2 }, // Surprised (slight positive, very high arousal)
  { action: disgustAction, x: -1.2, y: 0.1 }   // Disgust (very negative, medium arousal)
]);

// Blend to slightly happy and excited
emotionTree.setBlend(0.6, 0.8);
```

## State Machine Transitions

### Event-Driven Transitions

Respond to specific game events or user input:

```typescript
// Basic transition
machine.addEventTransition('jump', {
  from: idleState,
  to: jumpState,
  duration: 0.2
});

// Conditional transition
machine.addEventTransition('attack', {
  to: attackState,
  duration: 0.1,
  condition: (from, to, event, weaponType) => weaponType === 'sword'
});

// Trigger transitions
machine.handleEvent('jump');
machine.handleEvent('attack', 'sword');
```

### Automatic Transitions

Automatically transition when animations complete:

```typescript
// Transition to falling after jump completes
machine.addAutomaticTransition(jumpState, {
  to: fallState,
  duration: 0.1
});

// Chain multiple animations
machine.addAutomaticTransition(landState, {
  to: idleState,
  duration: 0.3
});
```

### Data-Driven Transitions

Continuously evaluate conditions for seamless state changes:

```typescript
// Transition based on health
machine.addDataTransition(combatState, {
  to: deathState,
  duration: 0.5,
  condition: (from, to, health) => health <= 0,
  data: [character.health]
});
```

## Animation Events

All animation states emit lifecycle events:

```typescript
import { AnimationStateEvent } from 'animouse';

// State lifecycle events
state.on(AnimationStateEvent.ENTER, (state) => {
  console.log('State activated');
});

state.on(AnimationStateEvent.EXIT, (state) => {
  console.log('State deactivated');
});

// Animation playback events
state.on(AnimationStateEvent.PLAY, (action, state) => {
  console.log('Animation started playing');
});

state.on(AnimationStateEvent.STOP, (action, state) => {
  console.log('Animation stopped');
});

// Animation completion events
state.on(AnimationStateEvent.ITERATE, (action, state) => {
  console.log('Looped animation completed a cycle');
});

state.on(AnimationStateEvent.FINISH, (action, state) => {
  console.log('Non-looped animation finished');
});
```

## Performance Considerations

- Blend trees automatically optimize by only updating active animations
- Use data transitions sparingly for frequently evaluated conditions
- Prefer event transitions for user input and game events

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT © [jango](https://github.com/jango-git)

## Credits

- Built with [Three.js](https://threejs.org/) for 3D animation support
- Event system powered by [eventail](https://www.npmjs.com/package/eventail)
- Mathematical utilities for robust geometric calculations
- Delaunay triangulation for freeform blend spaces
