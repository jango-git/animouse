import { test } from "uvu";
import * as assert from "uvu/assert";
import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
import { AnimationStateProxy } from "./proxies/AnimationStateProxy";

test("should emit ENTER event when onEnterInternal is called", () => {
  const state = new AnimationStateProxy();
  let eventFired = false;
  let eventData: any = null;

  state.on(StateEvent.ENTER, (data) => {
    eventFired = true;
    eventData = data;
  });

  state.invokeOnEnter();

  assert.ok(eventFired, "ENTER event should be fired");
  assert.equal(eventData, state, "Event data should be the state instance");
});

test("should emit EXIT event when onExitInternal is called", () => {
  const state = new AnimationStateProxy();
  let eventFired = false;
  let eventData: any = null;

  state.on(StateEvent.EXIT, (data) => {
    eventFired = true;
    eventData = data;
  });

  state.invokeOnExit();

  assert.ok(eventFired, "EXIT event should be fired");
  assert.equal(eventData, state, "Event data should be the state instance");
});

test("should emit multiple events correctly", () => {
  const state = new AnimationStateProxy();
  const events: string[] = [];

  state.on(StateEvent.ENTER, () => {
    events.push("enter");
  });

  state.on(StateEvent.EXIT, () => {
    events.push("exit");
  });

  state.invokeOnEnter();
  state.invokeOnExit();
  state.invokeOnEnter();
  state.invokeOnExit();

  state.invokeOnEnter();
  state.invokeOnEnter();
  state.invokeOnExit();
  state.invokeOnExit();

  assert.equal(events.length, 8);
  assert.equal(events[0], "enter");
  assert.equal(events[1], "exit");
  assert.equal(events[2], "enter");
  assert.equal(events[3], "exit");
  assert.equal(events[4], "enter");
  assert.equal(events[5], "enter");
  assert.equal(events[6], "exit");
  assert.equal(events[7], "exit");
});

test("should pass correct state instance data to both ENTER and EXIT event handlers", () => {
  const state = new AnimationStateProxy();
  let enterEventData: any = null;
  let exitEventData: any = null;

  state.on(StateEvent.ENTER, (data) => {
    enterEventData = data;
  });

  state.on(StateEvent.EXIT, (data) => {
    exitEventData = data;
  });

  state.invokeOnEnter();
  state.invokeOnExit();

  assert.equal(enterEventData, state);
  assert.equal(exitEventData, state);
});

test.run();
