import { LinearBlendTree } from "animouse";

import { accent, anchorMark, bright, clamp, dim, slider, sliderValue } from "../draw.js";

/*
 * Walk and run share the phase of the tree, so their steps match at any blend. Idle is not
 * synchronized and keeps its own speed.
 */

const LEFT = 120;
const RIGHT = 1080;
const AXIS = 960;
const PEAK = 320;

export function createLinearScene({ action, footsteps }) {
  const anchors = [
    { name: "A_Idle", value: 0, isSynchronized: false },
    { name: "A_Walk_Forward", value: 0.5 },
    { name: "A_Run_Forward", value: 1 },
  ].map((anchor) => ({ ...anchor, action: action(anchor.name) }));

  const tree = new LinearBlendTree(anchors);
  tree.setBlend(0.5);
  for (const anchor of anchors) {
    footsteps(tree, anchor.name, anchor.action);
  }

  const toX = (value) => LEFT + (RIGHT - LEFT) * value;
  const toY = (weight) => AXIS - (AXIS - PEAK) * weight;

  return {
    tab: "Linear",
    title: "LinearBlendTree",
    source: "linear-blend-tree.js",
    bounds: [270, 1060],
    state: tree,
    isDraggable: true,

    press(x) {
      tree.setBlend(clamp((x - LEFT) / (RIGHT - LEFT), 0, 1));
    },

    pressControls(x) {
      tree.timeScale = sliderValue(x, 0.5, 1.5);
    },

    draw({ graphics, label }, controls) {
      graphics.drawRect(LEFT, AXIS - 1, RIGHT - LEFT, 2, dim(0.5));
      anchors.forEach((anchor, i) => {
        const previous = anchors[i - 1];
        const next = anchors[i + 1];
        const weightCurve = [
          ...(previous ? [[toX(previous.value), toY(0)]] : []),
          [toX(anchor.value), toY(1)],
          ...(next ? [[toX(next.value), toY(0)]] : []),
        ];
        graphics.drawPolyline(weightCurve, dim(anchor.action.weight > 0 ? 0.9 : 0.4), 2);
      });

      const x = toX(tree.blendValue);
      graphics.drawRect(x - 1, PEAK - 40, 2, AXIS - PEAK + 40, bright(0.6));
      for (const anchor of anchors) {
        const { weight } = anchor.action;
        anchorMark(graphics, toX(anchor.value), AXIS, weight);
        if (weight > 0.001) {
          graphics.drawRect(x - 9, toY(weight) - 9, 18, 18, accent());
        }
        const name = anchor.name.split("_")[1].toUpperCase();
        label(name, toX(anchor.value), AXIS + 70, {
          anchorX: 0.5,
          color: weight > 0.5 ? bright() : dim(),
        });
      }

      controls.label("timeScale", 0, 60);
      slider(controls.graphics, tree.timeScale, 0.5, 1.5);
    },

    readout() {
      return `blend ${tree.blendValue.toFixed(2)}   timeScale ${tree.timeScale.toFixed(2)}`;
    },
  };
}
