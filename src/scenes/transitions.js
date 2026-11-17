import { ClipState } from "animouse";
import { LoopOnce } from "three";

import { accent, controlColors, dashedLine, dim, drawFrame } from "../draw.js";

/*
 * handleEvent starts the transition registered for the event and the current state. The jump
 * plays once, and an automatic transition returns to idle when it finishes.
 */

const NODE_WIDTH = 260;
const NODE_HEIGHT = 100;
const PAIR_GAP = 16;

export function createTransitionsScene({ action, footsteps }) {
  const jumpAction = action("A_Jump");
  jumpAction.loop = LoopOnce;
  jumpAction.clampWhenFinished = true;

  const idle = new ClipState(action("A_Idle"));
  const walk = new ClipState(action("A_Walk_Forward"));
  const dance = new ClipState(action("A_Dance_1"));
  const jump = new ClipState(jumpAction);
  footsteps(walk, "A_Walk_Forward");

  const edges = [
    { from: idle, to: walk, event: "walk", duration: 0.3 },
    { from: walk, to: idle, event: "idle", duration: 0.3 },
    { from: idle, to: dance, event: "dance", duration: 0.4 },
    { from: dance, to: idle, event: "idle", duration: 0.4 },
    { from: idle, to: jump, event: "jump", duration: 0.15 },
    { from: walk, to: jump, event: "jump", duration: 0.15 },
    { from: jump, to: idle, duration: 0.3 },
  ];

  const nodes = [
    { state: idle, name: "Idle", x: 600, y: 680 },
    { state: walk, name: "Walk", x: 600, y: 230 },
    { state: dance, name: "Dance", x: 1040, y: 680 },
    { state: jump, name: "Jump", x: 160, y: 680 },
  ];
  for (const node of nodes) {
    node.state.name = node.name;
  }
  const nodeOf = (state) => nodes.find((node) => node.state === state);

  /* A pair of opposite edges is drawn side by side, each moved to its right */
  for (const edge of edges) {
    const from = nodeOf(edge.from);
    const to = nodeOf(edge.to);
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const [forwardX, forwardY] = [(to.x - from.x) / length, (to.y - from.y) / length];
    const [rightX, rightY] = [-forwardY, forwardX];
    const hasPair = edges.some((other) => other.from === edge.to && other.to === edge.from);
    const shift = hasPair ? PAIR_GAP : 0;
    const margin = (Math.abs(forwardX) > Math.abs(forwardY) ? NODE_WIDTH : NODE_HEIGHT) / 2 + 14;
    const [shiftX, shiftY] = [rightX * shift, rightY * shift];
    edge.start = [from.x + forwardX * margin + shiftX, from.y + forwardY * margin + shiftY];
    edge.end = [to.x - forwardX * margin + shiftX, to.y - forwardY * margin + shiftY];
    const [backX, backY] = [edge.end[0] - forwardX * 22, edge.end[1] - forwardY * 22];
    edge.arrow = [
      [backX + rightX * 12, backY + rightY * 12],
      edge.end,
      [backX - rightX * 12, backY - rightY * 12],
    ];
  }

  let machine;
  const nodeAt = (x, y) =>
    nodes.find(
      (node) => Math.abs(x - node.x) < NODE_WIDTH / 2 && Math.abs(y - node.y) < NODE_HEIGHT / 2,
    );
  const edgeTo = (node) =>
    edges.find(
      (edge) => edge.event && edge.from === machine.currentState && edge.to === node?.state,
    );
  const targetAt = (x, y) => {
    const node = nodeAt(x, y);
    return edgeTo(node) ? node : null;
  };
  let shownState = idle;
  let lastEdge = null;

  return {
    tab: "Transitions",
    title: "AnimationMachine",
    source: "transitions.js",
    bounds: [170, 740],
    state: idle,

    connect(sceneMachine) {
      machine = sceneMachine;
      for (const { from, to, event, duration } of edges) {
        if (event) {
          machine.addEventTransition(event, { from, to, duration });
        } else {
          machine.addAutomaticTransition(from, { to, duration });
        }
      }
    },

    enter() {
      shownState = idle;
      lastEdge = null;
    },

    targetAt,

    press(x, y) {
      const edge = edgeTo(nodeAt(x, y));
      if (edge) {
        machine.handleEvent(edge.event);
      }
    },

    draw({ graphics, label, pointer }) {
      /* While the page fades to another scene, the machine already plays a state of that scene */
      const current = nodeOf(machine.currentState) ? machine.currentState : shownState;
      if (current !== shownState) {
        lastEdge = edges.find((edge) => edge.from === shownState && edge.to === current) ?? null;
        shownState = current;
      }
      const isRunning = (edge) => edge === lastEdge && current.influence < 1;
      const isNext = (edge) => edge.event && edge.from === current;

      for (const edge of edges) {
        const color = isRunning(edge) ? accent() : isNext(edge) ? dim(0.9) : dim(0.35);
        if (edge.event) {
          graphics.drawPolyline([edge.start, edge.end], color, 3);
        } else {
          dashedLine(graphics, edge.start, edge.end, color, 3);
        }
        graphics.drawPolyline(edge.arrow, color, 3);
        if (isRunning(edge)) {
          const t = current.influence;
          const x = edge.start[0] + (edge.end[0] - edge.start[0]) * t;
          const y = edge.start[1] + (edge.end[1] - edge.start[1]) * t;
          graphics.drawRect(x - 9, y - 9, 18, 18, accent());
        }
      }

      const hovered = pointer && targetAt(...pointer);
      for (const node of nodes) {
        const [frameColor, color] = controlColors({
          isCurrent: node.state === current,
          isHovered: node === hovered,
          isEnabled: Boolean(edgeTo(node)),
        });
        const left = node.x - NODE_WIDTH / 2;
        const top = node.y - NODE_HEIGHT / 2;
        const fill = accent(0.25 * node.state.influence);
        graphics.drawRect(left, top, NODE_WIDTH, NODE_HEIGHT, fill);
        drawFrame(graphics, left, top, NODE_WIDTH, NODE_HEIGHT, frameColor);
        label(node.name.toUpperCase(), node.x, node.y, { anchorX: 0.5, color });
      }
    },

    readout() {
      if (!lastEdge) {
        const events = edges.filter((edge) => edge.event && edge.from === shownState);
        return `events ${events.map((edge) => edge.event).join(", ")}`;
      }
      const cause = lastEdge.event ? `handleEvent("${lastEdge.event}")` : "automatic";
      return `${lastEdge.from.name} -> ${lastEdge.to.name}   ${cause}`;
    },
  };
}
