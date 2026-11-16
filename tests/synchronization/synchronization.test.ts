import { LoopOnce } from "three";
import { afterEach, expect, test } from "vitest";

import { AnimationMachine } from "../../src/AnimationMachine";
import { SyncGroup } from "../../src/SyncGroup";
import { buildMockAnimationAction, MIXER } from "../mocks/buildMockAnimationAction";
import { ClipStateProxy } from "../proxies/ClipStateProxy";
import { LinearBlendTreeProxy } from "../proxies/LinearBlendTreeProxy";
import { PolarBlendTreeProxy } from "../proxies/PolarBlendTreeProxy";

const TOLERANCE = 6;

afterEach(() => {
  MIXER.stopAllAction();
});

function step(tick: (deltaTime: number) => void, deltaTime: number): void {
  tick(deltaTime);
  MIXER.update(deltaTime);
}

test("synchronization: clips of different length advance by the weighted mean duration", () => {
  const short = buildMockAnimationAction(0, undefined, 1);
  const long = buildMockAnimationAction(0, undefined, 2);
  const tree = new LinearBlendTreeProxy([
    { action: short, value: 0 },
    { action: long, value: 1 },
  ]);
  tree.invokeSetInfluence(1);
  tree.setBlend(0.5);

  step((dt) => tree.invokeOnTick(dt), 0.3);

  /* Mean duration 1.5 s, so 0.3 s is 0.2 of the cycle */
  expect(short.time).toBeCloseTo(0.2, TOLERANCE);
  expect(long.time).toBeCloseTo(0.4, TOLERANCE);
});

test("synchronization: an action that blends in starts at the current phase", () => {
  const first = buildMockAnimationAction(0, undefined, 1);
  const second = buildMockAnimationAction(0, undefined, 2);
  const tree = new LinearBlendTreeProxy([
    { action: first, value: 0 },
    { action: second, value: 1 },
  ]);
  tree.invokeSetInfluence(1);

  step((dt) => tree.invokeOnTick(dt), 0.3);
  tree.setBlend(0.5);

  expect(second.time).toBeCloseTo(0.6, TOLERANCE);
});

test("synchronization: the phase offset shifts the action within its cycle", () => {
  const first = buildMockAnimationAction(0, undefined, 1);
  const second = buildMockAnimationAction(0, undefined, 1);
  const tree = new LinearBlendTreeProxy([
    { action: first, value: 0 },
    { action: second, value: 1, phaseOffset: -0.25 },
  ]);
  tree.invokeSetInfluence(1);
  tree.setBlend(0.5);

  step((dt) => tree.invokeOnTick(dt), 0.1);
  step((dt) => tree.invokeOnTick(dt), 0.1);

  expect(first.time).toBeCloseTo(0.2, TOLERANCE);
  expect(second.time).toBeCloseTo(0.95, TOLERANCE);
});

test("synchronization: an unsynchronized action keeps its own time", () => {
  const idle = buildMockAnimationAction(0, undefined, 4);
  const walk = buildMockAnimationAction(0, undefined, 1);
  const tree = new PolarBlendTreeProxy(
    [
      { action: walk, radius: 1, azimuth: 0 },
      { action: buildMockAnimationAction(0, undefined, 1), radius: 1, azimuth: Math.PI },
    ],
    { action: idle, isSynchronized: false },
  );
  tree.invokeSetInfluence(1);
  tree.setBlend(0, 0.5);

  step((dt) => tree.invokeOnTick(dt), 0.3);

  expect(idle.time).toBeCloseTo(0.3, TOLERANCE);
  expect(walk.time).toBeCloseTo(0.3, TOLERANCE);
});

test("synchronization: the phase restarts when the influence rises from zero", () => {
  const first = buildMockAnimationAction(0, undefined, 1);
  const tree = new LinearBlendTreeProxy([
    { action: first, value: 0 },
    { action: buildMockAnimationAction(0, undefined, 1), value: 1 },
  ]);
  tree.invokeSetInfluence(1);
  step((dt) => tree.invokeOnTick(dt), 0.4);

  tree.invokeSetInfluence(0);
  tree.invokeSetInfluence(1);

  expect(first.time).toBeCloseTo(0, TOLERANCE);
});

test("synchronization: a synchronized action must use LoopRepeat", () => {
  expect(
    () =>
      new LinearBlendTreeProxy([
        { action: buildMockAnimationAction(0, LoopOnce, 1), value: 0, isSynchronized: true },
        { action: buildMockAnimationAction(0, undefined, 1), value: 1 },
      ]),
  ).toThrow(/must use LoopRepeat/);
});

test("synchronization: a time event is caught when the tick passes the end of the cycle", () => {
  const action = buildMockAnimationAction(0, undefined, 1);
  const tree = new LinearBlendTreeProxy([
    { action, value: 0 },
    { action: buildMockAnimationAction(0, undefined, 1), value: 1 },
  ]);
  tree.invokeSetInfluence(1);

  let calls = 0;
  tree.onTimeEvent(action, 0.05, () => {
    calls++;
  });

  step((dt) => tree.invokeOnTick(dt), 0.9);
  expect(calls).toEqual(1);

  step((dt) => tree.invokeOnTick(dt), 0.2);
  expect(calls).toEqual(2);

  step((dt) => tree.invokeOnTick(dt), 0.1);
  expect(calls).toEqual(2);
});

test("synchronization: LoopOnce actions of a blend tree play at their own time", () => {
  const once = buildMockAnimationAction(0, LoopOnce, 4);
  const tree = new LinearBlendTreeProxy([
    { action: once, value: 0 },
    { action: buildMockAnimationAction(0, undefined, 1), value: 1 },
  ]);
  tree.invokeSetInfluence(1);
  tree.setBlend(0.5);

  step((dt) => tree.invokeOnTick(dt), 0.3);

  expect(once.time).toBeCloseTo(0.3, TOLERANCE);
});

test("synchronization: time events of an unsynchronized action follow the state time scale", () => {
  const action = buildMockAnimationAction(0, undefined, 1);
  const state = new ClipStateProxy(action);
  state.timeScale = 2;
  state.invokeSetInfluence(1);

  let calls = 0;
  state.onTimeEvent(0.5, () => {
    calls++;
  });

  step((dt) => state.invokeOnTick(dt), 0.3);

  expect(calls).toEqual(1);
});

test("synchronization: the state time scale scales the phase rate", () => {
  const action = buildMockAnimationAction(0, undefined, 1);
  const tree = new LinearBlendTreeProxy([
    { action, value: 0 },
    { action: buildMockAnimationAction(0, undefined, 1), value: 1 },
  ]);
  tree.timeScale = 2;
  tree.invokeSetInfluence(1);

  step((dt) => tree.invokeOnTick(dt), 0.1);

  expect(tree.syncGroup.phase).toBeCloseTo(0.2, TOLERANCE);
  expect(action.time).toBeCloseTo(0.2, TOLERANCE);
});

test("synchronization: a state that enters a shared group joins at its phase", () => {
  const group = new SyncGroup();
  const walk = buildMockAnimationAction(0, undefined, 1);
  const run = buildMockAnimationAction(0, undefined, 0.5);
  const walkState = new ClipStateProxy(walk, { isSynchronized: true });
  const runState = new ClipStateProxy(run, { isSynchronized: true });
  walkState.syncGroup = group;
  runState.syncGroup = group;

  walkState.invokeSetInfluence(1);
  step((dt) => walkState.invokeOnTick(dt), 0.25);
  runState.invokeSetInfluence(0.5);

  expect(run.time).toBeCloseTo(0.125, TOLERANCE);
});

test("synchronization: the phase of a group restarts when it has no playing state", () => {
  const group = new SyncGroup();
  const state = new ClipStateProxy(buildMockAnimationAction(0, undefined, 1), {
    isSynchronized: true,
  });
  state.syncGroup = group;

  state.invokeSetInfluence(1);
  step((dt) => state.invokeOnTick(dt), 0.25);
  state.invokeSetInfluence(0);
  state.invokeSetInfluence(1);

  expect(group.phase).toEqual(0);
});

test("synchronization: the sync group of a playing state cannot change", () => {
  const state = new ClipStateProxy(buildMockAnimationAction(0, undefined, 1));
  state.invokeSetInfluence(1);

  expect(() => {
    state.syncGroup = new SyncGroup();
  }).toThrow(/sync group of a playing state/);
});

test("synchronization: states of a shared group stay in step through a transition", () => {
  const group = new SyncGroup();
  const walk = buildMockAnimationAction(0, undefined, 1);
  const run = buildMockAnimationAction(0, undefined, 0.5);
  const walkState = new ClipStateProxy(walk, { isSynchronized: true });
  const runState = new ClipStateProxy(run, { isSynchronized: true });
  walkState.syncGroup = group;
  runState.syncGroup = group;

  const machine = new AnimationMachine(walkState, MIXER);
  machine.addEventTransition("run", { to: runState, duration: 1 });

  machine.update(0.25);
  machine.handleEvent("run");
  machine.update(0.1);

  /* Walk at influence 0.9 and run at 0.1: the cycle lasts 0.9 * 1 + 0.1 * 0.5 = 0.95 s */
  const phase = 0.25 + 0.1 / 0.95;
  expect(runState.influence).toBeCloseTo(0.1, TOLERANCE);
  expect(group.phase).toBeCloseTo(phase, TOLERANCE);
  expect(walk.time).toBeCloseTo(phase * 1, TOLERANCE);
  expect(run.time).toBeCloseTo(phase * 0.5, TOLERANCE);
});
