// import { test } from "uvu";
// import * as assert from "uvu/assert";
// import { assertEqualWithTolerance } from "../miscellaneous/miscellaneous";
// import { MIXER } from "../mocks/buildMockAnimationAction";
// import { AnimationMachineProxy } from "../proxies/AnimationMachineProxy";
// import { AnimationTreeProxy } from "../proxies/AnimationTreeProxy";

// test("addEventTransition: condition: ...", () => {
//   const from = new AnimationTreeProxy();
//   const to = new AnimationTreeProxy();
//   const machine = new AnimationMachineProxy(from, MIXER);

//   const event = "test";
//   const duration = 0;

//   machine.addEventTransition(event, { to, duration });

//   machine.handleEvent(event);
//   assert.equal(machine.currentState, to, "...a");

//   machine.update(duration);

//   assertEqualWithTolerance(from.influence, 0, "...b");
//   assertEqualWithTolerance(to.influence, 1, "...c");
// });

// test("addEventTransition: condition: ...", () => {
//   const from = new AnimationTreeProxy();
//   const to = new AnimationTreeProxy();
//   const machine = new AnimationMachineProxy(from, MIXER);

//   const event = "test";
//   const duration = 0.25;

//   machine.addEventTransition(event, { to, duration });

//   machine.handleEvent(event);
//   assert.equal(machine.currentState, to, "...a");

//   machine.update(duration);

//   assertEqualWithTolerance(from.influence, 0, "...b");
//   assertEqualWithTolerance(to.influence, 1, "...c");
// });

// test("addEventTransition: condition: ...", () => {
//   const from = new AnimationTreeProxy();
//   const to = new AnimationTreeProxy();
//   const machine = new AnimationMachineProxy(from, MIXER);

//   const event = "test";
//   const duration = 0;

//   machine.addEventTransition(event, { from, to, duration });

//   machine.handleEvent(event);
//   assert.equal(machine.currentState, to, "...a");

//   machine.update(duration);

//   assertEqualWithTolerance(from.influence, 0, "...b");
//   assertEqualWithTolerance(to.influence, 1, "...c");
// });

// test("addEventTransition: condition: ...", () => {
//   const from = new AnimationTreeProxy();
//   const to = new AnimationTreeProxy();
//   const machine = new AnimationMachineProxy(from, MIXER);

//   const event = "test";
//   const duration = 0.25;

//   machine.addEventTransition(event, { from, to, duration });

//   machine.handleEvent(event);
//   assert.equal(machine.currentState, to, "...a");

//   machine.update(duration);

//   assertEqualWithTolerance(from.influence, 0, "...b");
//   assertEqualWithTolerance(to.influence, 1, "...c");
// });

// test("addEventTransition: condition: ...", () => {
//   const from = new AnimationTreeProxy();
//   const to = new AnimationTreeProxy();
//   const machine = new AnimationMachineProxy(from, MIXER);

//   const event = "test";
//   const duration = 0.25;

//   machine.addEventTransition(event, { from, to, duration });

//   machine.handleEvent(event);
//   assert.equal(machine.currentState, to, "...a");

//   machine.update(duration / 2);

//   assertEqualWithTolerance(from.influence, 0.5, "...b");
//   assertEqualWithTolerance(to.influence, 0.5, "...c");
// });

// test.run();
