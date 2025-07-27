import { test } from "uvu";
import * as assert from "uvu/assert";
import { AnimationStateEvent } from "../../src/mescellaneous/AnimationStateEvent";
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
  assert.ok(eventFired, "PLAY event should be emitted");
  assert.ok(eventAction === anchor.action, "Event action should be emitted");
  assert.ok(eventState === tree, "Event state should be emitted");
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
  assert.ok(eventFired, "STOP event should be emitted");
  assert.ok(eventAction === anchor.action, "Event action should be emitted");
  assert.ok(eventState === tree, "Event state should be emitted");
});

test.run();
