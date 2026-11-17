import { PolarBlendTree } from "animouse";

import { anchorMark, bright, CANVAS_SIZE, circle, cursorMark, dim } from "../draw.js";

/* Walks on the inner ring, runs on the outer one, idle in the center */

const CENTER = CANVAS_SIZE / 2;
const RADIUS = 420;
const DIRECTIONS = [
  { name: "Forward", azimuth: 0 },
  { name: "Right", azimuth: Math.PI / 2 },
  { name: "Backward", azimuth: Math.PI },
  { name: "Left", azimuth: -Math.PI / 2 },
];

export function createPolarScene({ action, footsteps }) {
  const idle = action("A_Idle");
  const anchors = [
    ["Walk", 0.5],
    ["Run", 1],
  ].flatMap(([gait, radius]) =>
    DIRECTIONS.map(({ name, azimuth }) => {
      const clip = `A_${gait}_${name}`;
      return { clip, direction: name, azimuth, radius, action: action(clip) };
    }),
  );

  const tree = new PolarBlendTree(anchors, { action: idle, isSynchronized: false });
  tree.setBlend(Math.PI / 4, 0.7);
  for (const anchor of anchors) {
    footsteps(tree, anchor.clip, anchor.action);
  }

  const toCanvas = (azimuth, radius) => [
    CENTER + Math.sin(azimuth) * radius * RADIUS,
    CENTER - Math.cos(azimuth) * radius * RADIUS,
  ];

  return {
    tab: "Polar",
    title: "PolarBlendTree",
    source: "polar-blend-tree.js",
    bounds: [50, 1150],
    state: tree,
    isDraggable: true,

    press(x, y) {
      const dx = x - CENTER;
      const dy = CENTER - y;
      tree.setBlend(Math.atan2(dx, dy), Math.min(1, Math.hypot(dx, dy) / RADIUS));
    },

    draw({ graphics, label }) {
      graphics.drawPolyline(circle(CENTER, CENTER, RADIUS / 2), dim(0.5), 2);
      graphics.drawPolyline(circle(CENTER, CENTER, RADIUS), dim(0.5), 2);
      for (const { name, azimuth } of DIRECTIONS) {
        graphics.drawPolyline([toCanvas(azimuth, 0), toCanvas(azimuth, 1.06)], dim(0.25), 2);
        const isActive = anchors.some(
          (anchor) => anchor.direction === name && anchor.action.weight > 0.5,
        );
        label(name.toUpperCase(), ...toCanvas(azimuth, 1.24), {
          anchorX: 0.5,
          color: isActive ? bright() : dim(),
        });
      }
      anchorMark(graphics, CENTER, CENTER, idle.weight);
      for (const anchor of anchors) {
        anchorMark(graphics, ...toCanvas(anchor.azimuth, anchor.radius), anchor.action.weight);
      }
      const { azimuth, radius } = tree.blendValue;
      cursorMark(graphics, ...toCanvas(azimuth, radius));
    },

    readout() {
      const { azimuth, radius } = tree.blendValue;
      const degrees = Math.round((((azimuth * 180) / Math.PI) % 360) + 360) % 360;
      return `azimuth ${String(degrees).padStart(3, "0")}   radius ${radius.toFixed(2)}`;
    },
  };
}
