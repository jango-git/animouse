import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { AnimationStateEvent } from "../../src/mescellaneous/AnimationStateEvent";
import {
  buildMockAnimationAction,
  MIXER,
} from "../mocks/buildMockAnimationAction";
import { ClipStateProxy } from "../proxies/ClipStateProxy";

test("events: should emit ENTER/EXIT events", () => {
  const action = buildMockAnimationAction(1, LoopRepeat, 2.5);
  const tree = new ClipStateProxy(action);

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
    "ENTER event should be fired after setting influence",
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
    "EXIT event should be fired after setting influence",
  );
  assert.equal(exitState, tree, "EXIT event should provide the state");
});

test("events: should emit correct FINISH/ITERATE event based on animation loop mode", () => {
  const loopOnceAction = buildMockAnimationAction(1, LoopOnce, 1.0);
  const loopRepeatAction = buildMockAnimationAction(1, LoopRepeat, 1.0);
  const loopPingPongAction = buildMockAnimationAction(1, LoopPingPong, 1.0);

  const loopOnceState = new ClipStateProxy(loopOnceAction);
  const loopRepeatState = new ClipStateProxy(loopRepeatAction);
  const loopPingPongState = new ClipStateProxy(loopPingPongAction);

  let loopOnceFinishEventFired = false;
  let loopOnceIterateEventFired = false;

  let loopRepeatFinishEventFired = false;
  let loopRepeatIterateEventFired = false;

  let loopPingPongFinishEventFired = false;
  let loopPingPongIterateEventFired = false;

  loopOnceState.on(AnimationStateEvent.FINISH, () => {
    loopOnceFinishEventFired = true;
  });

  loopOnceState.on(AnimationStateEvent.ITERATE, () => {
    loopOnceIterateEventFired = true;
  });

  loopRepeatState.on(AnimationStateEvent.FINISH, () => {
    loopRepeatFinishEventFired = true;
  });

  loopRepeatState.on(AnimationStateEvent.ITERATE, () => {
    loopRepeatIterateEventFired = true;
  });

  loopPingPongState.on(AnimationStateEvent.FINISH, () => {
    loopPingPongFinishEventFired = true;
  });

  loopPingPongState.on(AnimationStateEvent.ITERATE, () => {
    loopPingPongIterateEventFired = true;
  });

  loopOnceState.invokeSetInfluence(1.0);
  loopRepeatState.invokeSetInfluence(1.0);
  loopPingPongState.invokeSetInfluence(1.0);

  const step = 1;
  loopOnceState.invokeOnTick(step);
  loopRepeatState.invokeOnTick(step);
  loopPingPongState.invokeOnTick(step);
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
  const action = buildMockAnimationAction(1, LoopOnce);
  action.clampWhenFinished = true;

  const clipState = new ClipStateProxy(action);
  clipState.invokeSetInfluence(1.0);

  let eventCount = 0;
  clipState.on(AnimationStateEvent.FINISH, () => {
    eventCount += 1;
  });

  const step = 1;
  clipState.invokeOnTick(step);
  MIXER.update(step);
  clipState.invokeOnTick(step);
  MIXER.update(step);

  assert.equal(
    eventCount,
    1,
    "Iteration event should only fire once per completion",
  );
});

test("events: should start animation and emit PLAY when influence becomes positive", () => {
  const action = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(action);

  let playEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  clipState.on(AnimationStateEvent.PLAY, (action, state) => {
    playEventFired = true;
    eventAction = action;
    eventState = state;
  });

  clipState.invokeSetInfluence(0.5);

  assert.ok(playEventFired, "PLAY event should be emitted");
  assert.equal(
    eventAction,
    action,
    "Event should include the animation action",
  );
  assert.equal(eventState, clipState, "Event should include the clip state");
  assert.equal(action.weight, 0.5);
  assert.ok(action.isRunning(), "Animation should be playing");
});

test("events: should stop animation and emit STOP when influence becomes zero", () => {
  const action = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(action);

  clipState.invokeSetInfluence(0.8);
  action.time = 0.3;

  let stopEventFired = false;
  let eventAction: any = null;
  let eventState: any = null;

  clipState.on(AnimationStateEvent.STOP, (action, state) => {
    stopEventFired = true;
    eventAction = action;
    eventState = state;
  });

  clipState.invokeSetInfluence(0);

  assert.ok(stopEventFired, "STOP event should be emitted");
  assert.equal(
    eventAction,
    action,
    "Event should include the animation action",
  );
  assert.equal(eventState, clipState, "Event should include the clip state");
  assert.equal(action.weight, 0);
  assert.equal(action.time, 0);
  assert.not.ok(action.isRunning(), "Animation should be stopped");
});

test("events: should detect animation restart and emit iteration event", () => {
  const action = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(action);
  clipState.invokeSetInfluence(1.0);

  {
    const step = 0.5;
    clipState.invokeOnTick(step);
    MIXER.update(step);
  }

  let eventFired = false;
  clipState.on(AnimationStateEvent.ITERATE, () => {
    eventFired = true;
  });

  {
    const step = 0.5;
    clipState.invokeOnTick(step);
    MIXER.update(step);
  }

  assert.ok(
    eventFired,
    "Iteration event should be emitted when animation restarts",
  );
});

test("events: should update internal tracking state on each tick", () => {
  const action = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(action);

  clipState.invokeSetInfluence(1.0);

  {
    const step = 0.3;
    clipState.invokeOnTick(step);
    MIXER.update(step);
  }
  {
    const step = 0.6;
    clipState.invokeOnTick(step);
    MIXER.update(step);
  }

  let eventFired = false;
  clipState.once(AnimationStateEvent.ITERATE, () => {
    eventFired = true;
  });

  {
    const step = 1;
    clipState.invokeOnTick(step);
    MIXER.update(step);
  }

  assert.ok(
    eventFired,
    "Should properly track state and fire events after partial progress",
  );

  {
    const step = 0.5;
    clipState.invokeOnTick(step);
    MIXER.update(step);
  }

  let secondEventFired = false;
  clipState.once(AnimationStateEvent.ITERATE, () => {
    secondEventFired = true;
  });

  {
    const step = 1;
    clipState.invokeOnTick(step);
    MIXER.update(step);
  }

  assert.ok(
    secondEventFired,
    "Should reset iteration flag and fire event again",
  );
});

test("events: should update animation weight for positive influence changes", () => {
  const action = buildMockAnimationAction(1);
  const clipState = new ClipStateProxy(action);

  clipState.invokeSetInfluence(0.3);
  assert.equal(action.weight, 0.3);

  clipState.invokeSetInfluence(0.7);
  assert.equal(action.weight, 0.7);

  assert.ok(action.isRunning(), "Animation should remain playing");
});

test.run();
