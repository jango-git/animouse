import { ClipState } from "animouse";

import { accent, CANVAS_SIZE, controlColors, dim, drawFrame } from "../draw.js";

/* Each clip is a ClipState. An event transition without `from` leads to it from any state. */

const CLIPS = [
  "A_Idle",
  "A_Walk_Forward",
  "A_Run_Forward",
  "A_Dance_0",
  "A_Dance_1",
  "A_Dance_2",
  "A_Dance_3",
];
const ROW_TOP = 110;
const ROW_HEIGHT = 130;
const ROW_FRAME_HEIGHT = 110;
const PADDING = 32;
const BAR_WIDTH = CANVAS_SIZE - 2 * PADDING;
const DURATION = 0.3;

export function createClipStateScene({ action, footsteps }) {
  const states = CLIPS.map((name) => {
    const state = new ClipState(action(name));
    state.name = name;
    footsteps(state, name);
    return state;
  });
  const walk = states[1];
  let machine;
  let selected = walk;
  let event = null;
  const rowAt = (y) => states[Math.floor((y - ROW_TOP) / ROW_HEIGHT)] ?? null;

  return {
    tab: "Clip",
    title: "ClipState",
    source: "clip-state.js",
    bounds: [100, 1010],
    state: walk,

    connect(sceneMachine) {
      machine = sceneMachine;
      for (const state of states) {
        machine.addEventTransition(state.name, { to: state, duration: DURATION });
      }
    },

    enter() {
      selected = walk;
      event = null;
    },

    targetAt(x, y) {
      return rowAt(y);
    },

    press(x, y) {
      const state = rowAt(y);
      if (state && state !== machine.currentState) {
        selected = state;
        event = state.name;
        machine.handleEvent(event);
      }
    },

    draw({ graphics, label, pointer }) {
      const hovered = pointer && rowAt(pointer[1]);
      states.forEach((state, i) => {
        const top = ROW_TOP + i * ROW_HEIGHT;
        const [frameColor, color] = controlColors({
          isCurrent: state === selected,
          isHovered: state === hovered,
        });
        drawFrame(graphics, 0, top, CANVAS_SIZE, ROW_FRAME_HEIGHT, frameColor);
        label(state.name, PADDING, top + 36, { color });
        label(state.influence.toFixed(2), CANVAS_SIZE - PADDING, top + 36, { anchorX: 1, color });
        graphics.drawRect(PADDING, top + 73, BAR_WIDTH, 2, dim(0.35));
        graphics.drawRect(PADDING, top + 68, BAR_WIDTH * state.influence, 12, accent());
      });
    },

    readout() {
      const duration = `duration ${DURATION.toFixed(2)}`;
      return event ? `handleEvent("${event}")   ${duration}` : duration;
    },
  };
}
