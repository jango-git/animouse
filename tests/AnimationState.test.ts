import { expect, test } from "vitest";
import { AnimationStateEvent } from "../src/miscellaneous/AnimationStateEvent";
import { AnimationStateProxy } from "./proxies/AnimationStateProxy";

test("events: should emit ENTER event when onEnterInternal is called", () => {
  const state = new AnimationStateProxy();
  let eventFired = false;
  let eventData: any = null;

  state.on(AnimationStateEvent.ENTER, (data) => {
    eventFired = true;
    eventData = data;
  });

  state.invokeOnEnter();

  expect(eventFired, "ENTER event should be fired").toBeTruthy();
  expect(eventData, "Event data should be the state instance").toEqual(state);
});

test("events: should emit EXIT event when onExitInternal is called", () => {
  const state = new AnimationStateProxy();
  let eventFired = false;
  let eventData: any = null;

  state.on(AnimationStateEvent.EXIT, (data) => {
    eventFired = true;
    eventData = data;
  });

  state.invokeOnExit();

  expect(eventFired, "EXIT event should be fired").toBeTruthy();
  expect(eventData, "Event data should be the state instance").toEqual(state);
});

test("events: should emit multiple events correctly", () => {
  const state = new AnimationStateProxy();
  const events: string[] = [];

  state.on(AnimationStateEvent.ENTER, () => {
    events.push("enter");
  });

  state.on(AnimationStateEvent.EXIT, () => {
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

  expect(events.length).toEqual(8);
  expect(events[0]).toEqual("enter");
  expect(events[1]).toEqual("exit");
  expect(events[2]).toEqual("enter");
  expect(events[3]).toEqual("exit");
  expect(events[4]).toEqual("enter");
  expect(events[5]).toEqual("enter");
  expect(events[6]).toEqual("exit");
  expect(events[7]).toEqual("exit");
});

test("events: should pass correct state instance data to both ENTER and EXIT event handlers", () => {
  const state = new AnimationStateProxy();
  let enterEventData: any = null;
  let exitEventData: any = null;

  state.on(AnimationStateEvent.ENTER, (data) => {
    enterEventData = data;
  });

  state.on(AnimationStateEvent.EXIT, (data) => {
    exitEventData = data;
  });

  state.invokeOnEnter();
  state.invokeOnExit();

  expect(enterEventData).toEqual(state);
  expect(exitEventData).toEqual(state);
});
