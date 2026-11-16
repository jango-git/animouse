# Changelog

Notable changes to animouse from 0.9.0 on. Versions follow semver; while the major is 0, a minor
release may break the API. Breaking changes are marked.

## 0.10.0 - 2026-11-16

### Added

- Synchronized actions play on a shared phase. Clips of different length stay in step, and a clip
  that starts blending in joins at the current phase instead of its first frame. `phaseOffset`
  shifts a clip within the cycle. The `BlendAction` and `SyncOptions` types describe these
  settings. See Synchronization in the README.
- `SyncGroup` shares the phase between states, so the steps stay in step through a transition
  between them. `state.syncGroup` sets the group, and `ClipState` takes `isSynchronized` and
  `phaseOffset` to follow it.
- `state.timeScale` sets the playback speed of a state.

### Changed

- **Breaking:** states expose their events as typed ferrsign signals instead of eventail events.
  `state.on(AnimationStateEvent.PLAY, callback)` becomes `state.signalPlay.on(callback)`, and the
  same goes for `signalEnter`, `signalExit`, `signalStop`, `signalIterate` and `signalFinish`.
  Callbacks are typed by event, `on` and `once` return a function that removes the callback, and
  `off` takes the callback only. Context arguments and priorities are gone, so a method is passed
  bound. `AnimationStateEvent` is removed, and eventail is no longer a dependency.
- **Breaking:** blend trees synchronize their `LoopRepeat` actions by default. Idle and other
  clips that keep their own speed need `isSynchronized: false`. `isSynchronized: true` on an
  action that does not use `LoopRepeat` throws.
- **Breaking:** states set `timeScale` of their actions every frame. A speed set on an action is
  overwritten, `state.timeScale` replaces it.
- **Breaking:** the `PolarBlendTree` center action is passed as `{ action }` and takes the same
  `isSynchronized` and `phaseOffset` settings. `PolarBlendTreeOptions` is removed, the constructor
  never used it.
- **Breaking:** `Anchor.iterationEventType` is replaced by `Anchor.isLoopOnce`, and `Anchor` has
  `isSynchronized` and `phaseOffset`.
- Within a frame the machine applies transitions before it updates the states. A state that a
  transition starts fires its events from its first frame, and a state that fades out fires none
  in the frame where its influence reaches zero.
- Time events, `signalIterate` and `signalFinish` follow `state.timeScale` and `mixer.timeScale`.
  They used to assume a time scale of 1.
- Time event callbacks are typed as `TimeEventCallback`, `(action, state) => void`.
- `FreeformBlendTree` triangulates its actions with delaunator, a new dependency, instead of its
  own triangulation.
- The `three` peer range is `>=0.157.0 <0.188.0`, up from `<0.180.0`.

### Fixed

- `offTimeEvent` removes only the given callback. It used to stop every callback registered at
  the same time of the same action, and they came back when another callback was registered
  there.
- A time event near the start of a cycle fires when a frame passes the end of the previous cycle.
  It used to be skipped.
