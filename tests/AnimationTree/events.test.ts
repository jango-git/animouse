import { expect, test } from "vitest";
import { AnimationStateEvent } from "../../src/miscellaneous/AnimationStateEvent";
import { buildMockAnchor } from "../mocks/buildMockAnchor";
import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

test("events: should emit PLAY event when combined weight becomes positive", () => {
  const anchor = buildMockAnchor(0, 0);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(1);

  let eventFired = false;
  let eventAction: any = null;
  let eventState: any = null;
  tree.on(AnimationStateEvent.PLAY, (action, state) => {
    eventFired = true;
    eventAction = action;
    eventState = state;
  });

  tree.invokeUpdateAnchor(anchor, 0.5);
  expect(eventFired, "PLAY event should be emitted").toBeTruthy();
  expect(eventAction === anchor.action, "Event action should be emitted").toBeTruthy();
  expect(eventState === tree, "Event state should be emitted").toBeTruthy();
});

test("events: should emit STOP event when combined weight becomes zero", () => {
  const anchor = buildMockAnchor(1, 1);
  const tree = new AnimationTreeProxy();
  tree.invokeSetInfluence(1);

  let eventFired = false;
  let eventAction: any = null;
  let eventState: any = null;
  tree.on(AnimationStateEvent.STOP, (action, state) => {
    eventFired = true;
    eventAction = action;
    eventState = state;
  });

  tree.invokeUpdateAnchor(anchor, 0);
  expect(eventFired, "STOP event should be emitted").toBeTruthy();
  expect(eventAction === anchor.action, "Event action should be emitted").toBeTruthy();
  expect(eventState === tree, "Event state should be emitted").toBeTruthy();
});
