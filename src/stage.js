import {
  AnimationMixer,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  LoopRepeat,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  RingGeometry,
  Scene,
  ShadowMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { COLORS, hex, rgba } from "./draw.js";
import { canvasTexture } from "./textures.js";

const GRID_TILE = 2;
const CAMERA_OFFSET = new Vector3(3.9, 0.87, 6.1);
const LOOK_AT = new Vector3(0, 0.95, 0);
const CHARACTER_HEIGHT = 1.9;

export const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(hex(COLORS.stage));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", () => renderer.setSize(window.innerWidth, window.innerHeight));

export const scene = new Scene();
scene.background = new Color(hex(COLORS.stage));
scene.fog = new Fog(hex(COLORS.stage), 6, 15);

export const camera = new PerspectiveCamera();
camera.near = 0.1;
camera.far = 60;
camera.position.copy(LOOK_AT).add(CAMERA_OFFSET);
camera.lookAt(LOOK_AT);

/**
 * Shows the character at (x, y) of the window, in fractions from the top left corner, with its
 * height a given share of the window height. The view is cut out of a larger frame centered on
 * the character.
 */
export function frameCharacter(x, y, heightShare) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const frameWidth = width + 2 * Math.abs(x * width - width / 2);
  const frameHeight = height + 2 * Math.abs(y * height - height / 2);
  const viewHeight = (CHARACTER_HEIGHT / heightShare) * (frameHeight / height);
  camera.fov = MathUtils.radToDeg(2 * Math.atan(viewHeight / 2 / CAMERA_OFFSET.length()));
  camera.aspect = frameWidth / frameHeight;
  camera.setViewOffset(
    frameWidth,
    frameHeight,
    frameWidth / 2 - x * width,
    frameHeight / 2 - y * height,
    width,
    height,
  );
}

scene.add(new HemisphereLight(0xffffff, 0x222222, 1.1));
const sun = new DirectionalLight(0xffffff, 2.4);
sun.position.set(2.5, 6, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.radius = 3;
Object.assign(sun.shadow.camera, {
  left: -2.5,
  right: 2.5,
  bottom: -2.5,
  top: 2.5,
  near: 1,
  far: 14,
});
scene.add(sun);
const rim = new DirectionalLight(hex(COLORS.accent), 1.6);
rim.position.set(-3, 2.5, -4);
scene.add(rim);

/* Floor layers write no depth and draw in their render order, so they cannot fight each other */
function floorLayer(geometry, material, renderOrder, y) {
  const mesh = new Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.renderOrder = renderOrder;
  scene.add(mesh);
  return mesh;
}

const gridTexture = canvasTexture(512, (context, size) => {
  context.fillStyle = COLORS.stage;
  context.fillRect(0, 0, size, size);
  context.fillStyle = rgba(COLORS.accent, 0.16);
  for (let i = 1; i < 4; i++) {
    context.fillRect((i * size) / 4 - 1, 0, 2, size);
    context.fillRect(0, (i * size) / 4 - 1, size, 2);
  }
  context.fillStyle = rgba(COLORS.accent, 0.34);
  context.fillRect(0, 0, 3, size);
  context.fillRect(0, 0, size, 3);
});
gridTexture.wrapS = gridTexture.wrapT = RepeatWrapping;
gridTexture.anisotropy = 8;
gridTexture.repeat.set(40 / GRID_TILE, 40 / GRID_TILE);
const grid = floorLayer(
  new PlaneGeometry(40, 40),
  new MeshBasicMaterial({ map: gridTexture, depthWrite: false }),
  -3,
  0,
);

floorLayer(
  new RingGeometry(4.9, 40, 96),
  new MeshBasicMaterial({ color: hex(COLORS.stage), fog: false, depthWrite: false }),
  -2,
  0.0005,
);

const fadeTexture = canvasTexture(256, (context, size) => {
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0.25, rgba(COLORS.stage, 0));
  gradient.addColorStop(1, rgba(COLORS.stage, 1));
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
});
floorLayer(
  new PlaneGeometry(10, 10),
  new MeshBasicMaterial({ map: fadeTexture, transparent: true, fog: false, depthWrite: false }),
  -1,
  0.001,
);

const shadow = floorLayer(
  new PlaneGeometry(12, 12),
  new ShadowMaterial({ opacity: 0.55 }),
  0,
  0.002,
);
shadow.receiveShadow = true;

const gltf = await new GLTFLoader()
  .setMeshoptDecoder(MeshoptDecoder)
  .loadAsync("assets/SK_Character.glb");
const model = gltf.scene;
model.traverse((object) => {
  if (object.isMesh) {
    object.castShadow = true;
    object.material = object.material.name.includes("Joints")
      ? new MeshStandardMaterial({
          color: hex(COLORS.accent),
          emissive: hex(COLORS.accent),
          emissiveIntensity: 0.25,
          roughness: 0.45,
        })
      : new MeshStandardMaterial({ color: hex(COLORS.body), roughness: 0.6 });
  }
});
scene.add(model);

const clips = new Map(gltf.animations.map((clip) => [clip.name, clip]));
const toes = ["mixamorigLeftToeBase", "mixamorigRightToeBase"].map((name) =>
  model.getObjectByName(name),
);

/**
 * Ground velocity of an in-place clip, from its planted toes, and the moments its feet touch the
 * ground as fractions of the clip. Foot 0 is the left one.
 */
function measureClip(clip) {
  const SAMPLE_COUNT = 96;
  const PLANTED_HEIGHT = 0.03;
  const sampler = new AnimationMixer(model);
  sampler.clipAction(clip).play();
  const feet = toes.map((toe) =>
    Array.from({ length: SAMPLE_COUNT + 1 }, (_, i) => {
      sampler.setTime((i / SAMPLE_COUNT) * clip.duration);
      model.updateMatrixWorld(true);
      return toe.getWorldPosition(new Vector3());
    }),
  );
  sampler.stopAllAction();
  sampler.uncacheRoot(model);

  const ground = Math.min(...feet.flat().map((position) => position.y)) + PLANTED_HEIGHT;
  const velocity = new Vector2();
  const contacts = [];
  let plantedSamples = 0;
  feet.forEach((samples, foot) => {
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      if (samples[i].y >= ground) {
        continue;
      }
      if (samples[i + 1].y < ground) {
        velocity.x += samples[i].x - samples[i + 1].x;
        velocity.y += samples[i].z - samples[i + 1].z;
        plantedSamples++;
      }
      if (samples[(i + SAMPLE_COUNT - 1) % SAMPLE_COUNT].y >= ground) {
        contacts.push({ unit: Math.max(i / SAMPLE_COUNT, 0.001), foot });
      }
    }
  });
  velocity.divideScalar(Math.max(plantedSamples, 1) * (clip.duration / SAMPLE_COUNT));
  return { velocity, contacts };
}

const motion = new Map(
  [...clips.keys()]
    .filter((name) => /^A_(Walk|Run)_/.test(name))
    .map((name) => [name, measureClip(clips.get(name))]),
);

export const mixer = new AnimationMixer(model);
const movingActions = [];

/** Looping action of a clip. Each call clones the clip, so states never share actions. */
export function action(name) {
  const created = mixer.clipAction(clips.get(name).clone());
  created.loop = LoopRepeat;
  if (motion.has(name)) {
    movingActions.push({ action: created, velocity: motion.get(name).velocity });
  }
  return created;
}

export const contactsOf = (name) => motion.get(name)?.contacts ?? [];

const FOOTPRINT_LIFETIME = 1.4;
const footprintGeometry = new PlaneGeometry(0.1, 0.18);
const footprints = Array.from({ length: 24 }, () => ({
  mesh: floorLayer(
    footprintGeometry,
    new MeshBasicMaterial({ color: hex(COLORS.accent), transparent: true, depthWrite: false }),
    0,
    0.004,
  ),
  age: FOOTPRINT_LIFETIME,
  ground: new Vector2(),
}));
let nextFootprint = 0;
const groundShift = new Vector2();
const toePositions = toes.map(() => new Vector3());

/** Time event callback: a footprint under the lower toe, if the action carries enough weight */
export function footprint(eventAction) {
  if (eventAction.weight < 0.3) {
    return;
  }
  const [left, right] = toes.map((toe, i) => toe.getWorldPosition(toePositions[i]));
  const toe = left.y < right.y ? left : right;
  const entry = footprints[nextFootprint++ % footprints.length];
  entry.age = 0;
  entry.ground.set(toe.x, toe.z).add(groundShift);
}

const velocity = new Vector2();
const wrap = (value) => -(((value % GRID_TILE) + GRID_TILE) % GRID_TILE);

export function updateGround(deltaTime) {
  velocity.set(0, 0);
  for (const entry of movingActions) {
    velocity.addScaledVector(entry.velocity, entry.action.weight * entry.action.timeScale);
  }
  groundShift.addScaledVector(velocity, deltaTime * mixer.timeScale);
  grid.position.x = wrap(groundShift.x);
  grid.position.z = wrap(groundShift.y);
  for (const entry of footprints) {
    entry.age += deltaTime;
    entry.mesh.material.opacity = 0.75 * Math.max(0, 1 - entry.age / FOOTPRINT_LIFETIME);
    entry.mesh.position.x = entry.ground.x - groundShift.x;
    entry.mesh.position.z = entry.ground.y - groundShift.y;
  }
}
