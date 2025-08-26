<p align="center">
  <img src="https://raw.githubusercontent.com/jango-git/animouse/main/assets/logotype.svg" width="200" alt="Animouse logo"><br/>
  <h1 align="center">Animouse</h1>
  <p align="center">
      An animation state machine and blending system for Three.js that I use in my daily work with 3D development.
  </p>
</p>

<p align="center">
<a href="https://www.npmjs.com/package/animouse"><img src="https://img.shields.io/npm/v/animouse.svg" alt="npm version"></a>
<a href="https://bundlephobia.com/package/animouse"><img src="https://badgen.net/bundlephobia/min/animouse" alt="bundle size (min)"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-%5E5.8.0-blue" alt="TypeScript"></a>
<a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-%5E0.175.0-green" alt="Three.js"></a>
</p>

## What's included

- 🎬 **Animation State Machine** - Event-driven and data-driven transitions
- 🎯 **Single Clip States** - Animation control with lifecycle events
- 📊 **Linear Blend Trees** - 1D blending for speed variations
- 🧭 **Polar Blend Trees** - 2D blending in polar coordinates
- 🎨 **Freeform Blend Trees** - 2D blending using Delaunay triangulation
- 🔄 **Transitions** - Configurable blend durations between states
- 📦 **TypeScript Support** - Type safety and IntelliSense

## Installation

```bash
npm install animouse
```

## Requirements

- Three.js ^0.175.0 (peer dependency)
- Modern JavaScript environment with ES2020+ support

## Examples

🎮 **[Live Examples](https://jango-git.github.io/animouse/)** - Interactive demos showing Animouse in action

Browse working examples that demonstrate:
- Basic GLB character animation loading and playback
- Integration with Three.js scene setup
- Real-time animation control

Visit the examples page to see the library in action!

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
```

## How it works

### Animation States

Animation states manage one or more Three.js AnimationActions:

- **ClipState** - Wraps a single AnimationAction
- **LinearBlendTree** - Blends multiple actions along a 1D axis
- **PolarBlendTree** - Blends actions in 2D polar coordinates
- **FreeformBlendTree** - Blends actions in 2D space

### Animation Machine

The AnimationMachine handles state transitions. It supports three types:

1. **Event Transitions** - Triggered by specific events
2. **Automatic Transitions** - Triggered when animations complete
3. **Data Transitions** - Triggered by condition evaluation

## Animation States

### ClipState - Single Animation Control

Control individual animation clips with event handling:

```typescript
import { ClipState, AnimationStateEvent } from 'animouse';

const jumpState = new ClipState(jumpAction);
jumpState.name = 'jump'; // Optional: name states for debugging

// Listen for animation events
jumpState.on(AnimationStateEvent.PLAY, (action, state) => {
  console.log('Jump animation started');
});

jumpState.on(AnimationStateEvent.FINISH, (action, state) => {
  console.log('Jump animation completed');
});
```

### LinearBlendTree - 1D Animation Blending

For speed variations or linear progressions:

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

// Get current blend value
console.log('Current speed:', movementTree.blendValue); // 2.5
```

### PolarBlendTree - 2D Polar Blending

For directional movement with varying intensities:

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

// Get current blend values
console.log('Current direction:', directionTree.blendValue);
// { azimuth: 0.785, radius: 1.5 }
```

### FreeformBlendTree - 2D Blending

For irregular animation spaces:

```typescript
import { FreeformBlendTree } from 'animouse';

// Create emotion-based facial animation system
const emotionTree = new FreeformBlendTree([
  { action: neutralAction, x: 0, y: 0 },       // Center: neutral
  { action: happyAction, x: 1, y: 1 },         // Happy
  { action: sadAction, x: -1, y: -0.5 },       // Sad
  { action: angryAction, x: -0.8, y: 0.9 },    // Angry
  { action: surprisedAction, x: 0.2, y: 1.2 }, // Surprised
  { action: disgustAction, x: -1.2, y: 0.1 }   // Disgust
]);

// Blend to slightly happy and excited
emotionTree.setBlend(0.6, 0.8);

// Get current blend position
console.log('Current emotion:', emotionTree.blendValue); // { x: 0.6, y: 0.8 }
```

## State Machine Transitions

### Event-Driven Transitions

Respond to game events or user input:

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

Transition when animations complete:

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

Evaluate conditions for state changes:

```typescript
// Transition based on health
machine.addDataTransition(combatState, {
  to: deathState,
  duration: 0.5,
  condition: (from, to, health) => health <=
 0,
  data: [character.health]
});
```

## Animation Events

Animation states emit lifecycle events:

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

## Time Events

Time-based events that trigger callbacks at specific points during animation playback. Useful for synchronizing sound effects or other events with animation frames.

### ClipState Time Events

For single animation clips, register time events directly on the state:

```typescript
import { ClipState } from 'animouse';

const walkState = new ClipState(walkAction);

// Trigger footstep sound at 25% and 75% of the walk cycle
walkState.onTimeEvent(0.25, (action, state) => {
  playSound('footstep-left');
});

walkState.onTimeEvent(0.75, (action, state) => {
  playSound('footstep-right');
});

// One-time event for attack impact
const attackState = new ClipState(attackAction);
attackState.onceTimeEvent(0.6, (action, state) => {
  dealDamage();
  showImpactEffect();
});
```

### Blend Tree Time Events

For blend trees, specify which action to monitor:

```typescript
import { LinearBlendTree } from 'animouse';

const movementTree = new LinearBlendTree([
  { action: walkAction, value: 1 },
  { action: runAction, value: 2 }
]);

// Add footstep events to specific actions
movementTree.onTimeEvent(walkAction, 0.5, (action, state) => {
  playSound('walk-footstep');
});

movementTree.onTimeEvent(runAction, 0.3, (action, state) => {
  playSound('run-footstep');
});

// Remove events when no longer needed
movementTree.offTimeEvent(walkAction, 0.5, footstepCallback);
```

Time events fire when the animation crosses the specified time threshold (0.0 to 1.0).

## Performance Notes

- Blend trees update only active animations (weight > 0)
- Animation actions are automatically started/stopped based on weights
- Use data transitions carefully for frequently evaluated conditions
- Event transitions work well for user input and game events
- States can be named for easier debugging and identification

## Contributing

Feel free to submit issues and pull requests if you find this library helpful.

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT © [jango](https://github.com/jango-git)

## Credits

- Built with [Three.js](https://threejs.org/) for 3D animation support
- Event system powered by [eventail](https://www.npmjs.com/package/eventail)
- Mathematical utilities for geometric calculations
- Delaunay triangulation for freeform blend spaces
