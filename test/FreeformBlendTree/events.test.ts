import type { AnimationAction } from "three";
import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { AnimationStateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import { buildMockFreeformAction } from "../mocks/buildMockAction";
import { MIXER } from "../mocks/buildMockAnimationAction";
import { FreeformBlendTreeProxy } from "../proxies/FreeformBlendTreeProxy";

test("events: should emit ENTER/EXIT events", () => {
  const action1 = buildMockFreeformAction(0, 1);
  const action2 = buildMockFreeformAction(1, 0);
  const action3 = buildMockFreeformAction(0, 0);

  const tree = new FreeformBlendTreeProxy([action1, action2, action3]);

  let enterEventFired = false;
  let enterState: any = null;

  let exitEventFired = false;
  let exitState: any = null;

  tree.on(AnimationStateEvent.ENTER, (state) => {
    enterEventFired = true;
    enterState = state;
  });

  assert.equal(
    enterEventFired,
    false,
    "ENTER event should not be fired initially",
  );
  tree.invokeOnEnter();
  assert.equal(
    enterEventFired,
    true,
    "ENTER event should be fired after invoking onEnter",
  );
  assert.equal(enterState, tree, "ENTER event should provide the state");

  tree.on(AnimationStateEvent.EXIT, (state) => {
    exitEventFired = true;
    exitState = state;
  });

  assert.equal(
    exitEventFired,
    false,
    "EXIT event should not be fired initially",
  );
  tree.invokeOnExit();
  assert.equal(
    exitEventFired,
    true,
    "EXIT event should be fired after invoking onExit",
  );
  assert.equal(exitState, tree, "EXIT event should provide the state");
});

test("events: should emit correct FINISH/ITERATE event based on animation loop mode", () => {
  const loopOnceAction = buildMockFreeformAction(0, 0, LoopOnce);
  const loopRepeatAction = buildMockFreeformAction(0, 1, LoopRepeat);
  const loopPingPongAction = buildMockFreeformAction(1, 0, LoopPingPong);

  const tree = new FreeformBlendTreeProxy([
    loopOnceAction,
    loopRepeatAction,
    loopPingPongAction,
  ]);
  tree.invokeSetInfluence(1.0);

  let loopOnceFinishEventFired = false;
  let loopOnceIterateEventFired = false;

  let loopRepeatFinishEventFired = false;
  let loopRepeatIterateEventFired = false;

  let loopPingPongFinishEventFired = false;
  let loopPingPongIterateEventFired = false;

  tree.on(AnimationStateEvent.FINISH, (action: AnimationAction) => {
    if (action.loop === LoopOnce) {
      loopOnceFinishEventFired = true;
    } else if (action.loop === LoopRepeat) {
      loopRepeatFinishEventFired = true;
    } else {
      loopPingPongFinishEventFired = true;
    }
  });

  tree.on(AnimationStateEvent.ITERATE, (action: AnimationAction) => {
    if (action.loop === LoopOnce) {
      loopOnceIterateEventFired = true;
    } else if (action.loop === LoopRepeat) {
      loopRepeatIterateEventFired = true;
    } else {
      loopPingPongIterateEventFired = true;
    }
  });

  const step = 1;
  tree.setBlend(0, 0);
  tree.invokeOnTick(step);
  MIXER.update(step);
  tree.setBlend(0, 1);
  tree.invokeOnTick(step);
  MIXER.update(step);
  tree.setBlend(1, 0);
  tree.invokeOnTick(step);
  MIXER.update(step);

  assert.ok(
    loopOnceFinishEventFired,
    "FINISH event should fire for LoopOnce animations",
  );
  assert.not.ok(
    loopOnceIterateEventFired,
    "ITERATE event should not fire for LoopOnce animations",
  );

  assert.ok(
    loopRepeatIterateEventFired,
    "ITERATE event should fire for looped animations",
  );
  assert.not.ok(
    loopRepeatFinishEventFired,
    "FINISH event should not fire for looped animations",
  );

  assert.ok(
    loopPingPongIterateEventFired,
    "ITERATE event should fire for ping-pong animations",
  );
  assert.not.ok(
    loopPingPongFinishEventFired,
    "FINISH event should not fire for ping-pong animations",
  );
});

test("events: should prevent duplicate iteration events", () => {
  const action = buildMockFreeformAction(0, 0, LoopOnce);
  action.action.clampWhenFinished = true;

  const tree = new FreeformBlendTreeProxy([
    action,
    buildMockFreeformAction(1, 0),
    buildMockFreeformAction(0, 1),
  ]);
  tree.invokeSetInfluence(1.0);

  let eventCount = 0;
  tree.on(AnimationStateEvent.FINISH, () => {
    eventCount += 1;
  });

  const step = 1;
  tree.invokeOnTick(step);
  MIXER.update(step);
  tree.invokeOnTick(step);
  MIXER.update(step);

  assert.equal(
    eventCount,
    1,
    "Iteration event should only fire once per animation cycle",
  );
});

test("events: should start animation and emit PLAY when influence becomes positive", () => {
  const action = buildMockFreeformAction(0, 0);
  const tree = new FreeformBlendTreeProxy([
    action,
    buildMockFreeformAction(1, 0),
    buildMockFreeformAction(0, 1),
  ]);

  let playEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  tree.on(AnimationStateEvent.PLAY, (action, state) => {
    playEventFired = true;
    eventAction = action;
    eventState = state;
  });

  tree.invokeSetInfluence(0.5);

  assert.ok(playEventFired, "PLAY event should be emitted");
  assert.equal(
    eventAction,
    action.action,
    "Event should include the animation action",
  );
  assert.equal(eventState, tree, "Event should include the clip state");
  assert.equal(action.action.weight, 0.5);
  assert.ok(action.action.isRunning(), "Animation should be playing");
});

test("events: should stop animation and emit STOP when influence becomes zero", () => {
  const action = buildMockFreeformAction(0, 0);
  const tree = new FreeformBlendTreeProxy([
    action,
    buildMockFreeformAction(1, 0),
    buildMockFreeformAction(0, 1),
  ]);

  tree.invokeSetInfluence(0.8);
  action.action.time = 0.3;

  let stopEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  tree.on(AnimationStateEvent.STOP, (action, state) => {
    stopEventFired = true;
    eventAction = action;
    eventState = state;
  });

  tree.invokeSetInfluence(0);

  assert.ok(stopEventFired, "STOP event should be emitted");
  assert.equal(
    eventAction,
    action.action,
    "Event should include the animation action",
  );
  assert.equal(eventState, tree, "Event should include the clip state");
  assert.equal(action.action.weight, 0);
  assert.not.ok(action.action.isRunning(), "Animation should be stopped");
});

test.run();
