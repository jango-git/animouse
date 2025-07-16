// import { test } from "uvu";
// import * as assert from "uvu/assert";
// import { StateEvent } from "../src/mescellaneous/AnimationStateEvent";
// import { AnimationState } from "../src/states/AnimationState";

// // Test implementation of abstract AnimationState
// class TestAnimationState extends AnimationState {
//   public triggerOnEnter(): void {
//     this.onEnterInternal();
//   }

//   public triggerOnExit(): void {
//     this.onExitInternal();
//   }

//   protected onTickInternal(deltaTime: number): void {
//     // Stub implementation
//   }

//   protected setInfluenceInternal(influence: number): void {
//     // Stub implementation
//   }
// }

// test("should emit ENTER event when onEnterInternal is called", () => {
//   const state = new TestAnimationState();
//   let eventFired = false;
//   let eventData: any = null;

//   state.on(StateEvent.ENTER, (data) => {
//     eventFired = true;
//     eventData = data;
//   });

//   state.triggerOnEnter();

//   assert.ok(eventFired, "ENTER event should be fired");
//   assert.equal(eventData, state, "Event data should be the state instance");
// });

// test("should emit EXIT event when onExitInternal is called", () => {
//   const state = new TestAnimationState();
//   let eventFired = false;
//   let eventData: any = null;

//   state.on(StateEvent.EXIT, (data) => {
//     eventFired = true;
//     eventData = data;
//   });

//   state.triggerOnExit();

//   assert.ok(eventFired, "EXIT event should be fired");
//   assert.equal(eventData, state, "Event data should be the state instance");
// });

// test("should emit multiple events correctly", () => {
//   const state = new TestAnimationState();
//   const events: string[] = [];

//   state.on(StateEvent.ENTER, () => {
//     events.push("enter");
//   });

//   state.on(StateEvent.EXIT, () => {
//     events.push("exit");
//   });

//   state.triggerOnEnter();
//   state.triggerOnExit();
//   state.triggerOnEnter();
//   state.triggerOnExit();

//   assert.equal(events.length, 4);
//   assert.equal(events[0], "enter");
//   assert.equal(events[1], "exit");
//   assert.equal(events[2], "enter");
//   assert.equal(events[3], "exit");
// });

// test.run();
