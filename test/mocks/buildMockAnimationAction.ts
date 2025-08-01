import type { AnimationAction, AnimationActionLoopStyles } from "three";
import {
  AnimationClip,
  AnimationMixer,
  LoopRepeat,
  Object3D,
  VectorKeyframeTrack,
} from "three";

const OBJECT = new Object3D();
export const MIXER = new AnimationMixer(OBJECT);

export function buildMockAnimationAction(
  weight: number,
  loop: AnimationActionLoopStyles = LoopRepeat,
  duration = 1.0,
): AnimationAction {
  const times = [0, 1];
  const values = [0, 0, 0, 1, 1, 1];
  const track = new VectorKeyframeTrack(".position", times, values);
  const clip = new AnimationClip("MockClip", duration, [track]);
  const action = MIXER.clipAction(clip);
  action.time = 0;
  action.weight = weight;
  action.loop = loop;
  return action;
}
