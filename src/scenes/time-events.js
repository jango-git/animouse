import { LinearBlendTree } from "animouse";

import { accent, bright, CANVAS_SIZE, circle, dim, slider, sliderValue, TAU } from "../draw.js";

/*
 * onTimeEvent calls back when an action passes a fraction of its clip, here at the foot
 * contacts. Walk and run follow the phase of the tree, so one dial shows the cycle of both.
 */

const CENTER = CANVAS_SIZE / 2;
const RING_RADII = { A_Walk_Forward: 300, A_Run_Forward: 420 };
const FLASH_DURATION = 0.35;

export function createTimeEventsScene({ action, contactsOf, footprint }) {
  const anchors = Object.keys(RING_RADII).map((name, i) => ({
    name,
    value: i,
    action: action(name),
  }));
  const tree = new LinearBlendTree(anchors);
  tree.setBlend(0.4);

  let eventCount = 0;
  const marks = anchors.flatMap((anchor) =>
    contactsOf(anchor.name).map(({ unit, foot }) => {
      const mark = { anchor, unit, foot, age: FLASH_DURATION };
      tree.onTimeEvent(anchor.action, unit, (eventAction) => {
        footprint(eventAction);
        mark.age = 0;
        eventCount++;
      });
      return mark;
    }),
  );

  const toCanvas = (unit, radius) => {
    const angle = unit * TAU - Math.PI / 2;
    return [CENTER + Math.cos(angle) * radius, CENTER + Math.sin(angle) * radius];
  };

  return {
    tab: "Events",
    title: "onTimeEvent",
    source: "time-events.js",
    bounds: [120, 1080],
    state: tree,

    pressControls(x) {
      tree.setBlend(sliderValue(x, 0, 1));
    },

    update(deltaTime) {
      for (const mark of marks) {
        mark.age += deltaTime;
      }
    },

    draw({ graphics, label }, controls) {
      for (const anchor of anchors) {
        const radius = RING_RADII[anchor.name];
        graphics.drawPolyline(
          circle(CENTER, CENTER, radius),
          dim(anchor.action.weight > 0.5 ? 0.8 : 0.4),
          2,
        );
        label(anchor.name.split("_")[1].toUpperCase(), CENTER - radius + 16, CENTER);
      }
      graphics.drawPolyline(
        [[CENTER, CENTER], toCanvas(tree.syncGroup.phase, 470)],
        bright(0.8),
        3,
      );
      for (const mark of marks) {
        const flash = Math.max(0, 1 - mark.age / FLASH_DURATION);
        const size = 16 + 22 * flash;
        const [x, y] = toCanvas(mark.unit, RING_RADII[mark.anchor.name]);
        const alpha = 0.35 + 0.65 * Math.max(flash, mark.anchor.action.weight);
        graphics.drawRect(x - size / 2, y - size / 2, size, size, accent(alpha));
        if (mark.anchor === anchors[1]) {
          label(mark.foot === 0 ? "LEFT" : "RIGHT", ...toCanvas(mark.unit, 520), { anchorX: 0.5 });
        }
      }
      controls.label("blend", 0, 60);
      slider(controls.graphics, tree.blendValue, 0, 1);
    },

    readout() {
      return `phase ${tree.syncGroup.phase.toFixed(2)}   events ${eventCount}`;
    },
  };
}
