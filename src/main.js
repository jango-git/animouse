import { AnimationMachine } from "animouse";

import { createInterface } from "./interface.js";
import { createClipStateScene } from "./scenes/clip-state.js";
import { createFreeformScene } from "./scenes/freeform-blend-tree.js";
import { createLinearScene } from "./scenes/linear-blend-tree.js";
import { createPolarScene } from "./scenes/polar-blend-tree.js";
import { createTimeEventsScene } from "./scenes/time-events.js";
import { createTransitionsScene } from "./scenes/transitions.js";
import {
  action,
  camera,
  contactsOf,
  footprint,
  frameCharacter,
  mixer,
  renderer,
  scene,
  updateGround,
} from "./stage.js";

/** Leaves footprints at the foot contacts of a clip, for a ClipState or an action of a tree */
function footsteps(state, name, treeAction) {
  for (const { unit } of contactsOf(name)) {
    if (treeAction) {
      state.onTimeEvent(treeAction, unit, footprint);
    } else {
      state.onTimeEvent(unit, footprint);
    }
  }
}

/*
 * A scene is one tab of the page: its tab, title and source file, the animation state it plays,
 * the rows of the diagram it draws in (`bounds`), `draw` and `readout` each frame, and optional
 * handlers for presses on the diagram and on the control strip
 */
const scenes = [
  createClipStateScene,
  createLinearScene,
  createPolarScene,
  createFreeformScene,
  createTransitionsScene,
  createTimeEventsScene,
].map((create) => create({ action, contactsOf, footprint, footsteps }));

const machine = new AnimationMachine(scenes[0].state, mixer);
scenes.forEach((entry, i) => {
  machine.addEventTransition(`scene ${i}`, { to: entry.state, duration: 0.4 });
  entry.connect?.(machine);
});

const ui = await createInterface(scenes, (index) => {
  scenes[index].enter?.();
  if (machine.currentState !== scenes[index].state) {
    machine.handleEvent(`scene ${index}`);
  }
});

let lastTime = performance.now();
renderer.setAnimationLoop((now) => {
  const deltaTime = Math.min(Math.max(now - lastTime, 0) / 1000, 0.1);
  lastTime = now;
  for (const entry of scenes) {
    entry.update?.(deltaTime);
  }
  machine.update(deltaTime);
  updateGround(deltaTime);
  ui.update(deltaTime);
  frameCharacter(...ui.characterFrame());
  renderer.render(scene, camera);
  ui.render(renderer, deltaTime);
});
