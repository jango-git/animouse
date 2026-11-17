import { FreeformBlendTree } from "animouse";

import { anchorMark, bright, CANVAS_SIZE, clamp, cursorMark, dim, signed } from "../draw.js";

/*
 * The tree splits the plane into triangles between the clips, and the triangle under the blend
 * point weighs its corners. The dances keep their own speed, so they are not synchronized.
 */

const CENTER = CANVAS_SIZE / 2;
const SCALE = 420;

export function createFreeformScene({ action }) {
  const anchors = [
    { name: "A_Idle", x: 0, y: 0 },
    { name: "A_Dance_0", x: -1, y: 1 },
    { name: "A_Dance_1", x: 1, y: 1 },
    { name: "A_Dance_3", x: 1, y: -1 },
    { name: "A_Dance_2", x: -1, y: -1 },
  ].map((anchor) => ({ ...anchor, action: action(anchor.name), isSynchronized: false }));

  const tree = new FreeformBlendTree(anchors);
  tree.setBlend(0.45, 0.3);

  const toCanvas = (x, y) => [CENTER + x * SCALE, CENTER - y * SCALE];

  return {
    tab: "Freeform",
    title: "FreeformBlendTree",
    source: "freeform-blend-tree.js",
    bounds: [90, 1110],
    state: tree,
    isDraggable: true,

    press(x, y) {
      tree.setBlend(clamp((x - CENTER) / SCALE, -1, 1), clamp((CENTER - y) / SCALE, -1, 1));
    },

    draw({ graphics, label }) {
      const center = toCanvas(0, 0);
      const corners = anchors.slice(1).map((anchor) => toCanvas(anchor.x, anchor.y));
      graphics.drawPolyline([...corners, corners[0]], dim(0.5), 2);
      for (const corner of corners) {
        graphics.drawPolyline([center, corner], dim(0.5), 2);
      }
      for (const anchor of anchors) {
        const [x, y] = toCanvas(anchor.x, anchor.y);
        anchorMark(graphics, x, y, anchor.action.weight);
        label(
          anchor.name.slice(2).replace("_", " ").toUpperCase(),
          x,
          anchor.y > 0 ? y - 60 : y + 60,
          {
            anchorX: 0.5,
            color: anchor.action.weight > 0.5 ? bright() : dim(),
          },
        );
      }
      const { x, y } = tree.blendValue;
      cursorMark(graphics, ...toCanvas(x, y));
    },

    readout() {
      const { x, y } = tree.blendValue;
      return `x ${signed(x)}   y ${signed(y)}`;
    },
  };
}
