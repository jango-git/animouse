import {
  UIDummy,
  UIGraphics,
  UIHeightConstraint,
  UIHorizontalDistanceConstraint,
  UIImage,
  UIMode,
  UINineSlice,
  UIOrientation,
  UIResizePolicy,
  UIText,
  UIVerticalDistanceConstraint,
  UIViewportLayer,
  UIWidthConstraint,
} from "laymur";

import { bright, CANVAS_SIZE, controlColors, dim } from "./draw.js";
import { FRAME_TEXTURE_SIZE, frameTexture, githubIcon, npmIcon, sourceIcon } from "./textures.js";

const VERSION = "0.10.0";
const REPOSITORY = "https://github.com/jango-git/animouse";
const NPM = "https://www.npmjs.com/package/animouse";
const SOURCES = `${REPOSITORY}/blob/gh-pages/src/scenes/`;

const MONO_FONT = "Ubuntu Sans Mono";
const SANS_FONT = "Space Grotesk";
const PANEL_WIDTH = { [UIOrientation.HORIZONTAL]: 600, [UIOrientation.VERTICAL]: 552 };
/* From the top of the panel to its diagram, and from the diagram to the control strip */
const DIAGRAM_TOP = { [UIOrientation.HORIZONTAL]: 120, [UIOrientation.VERTICAL]: 96 };
const CONTROLS_GAP = { [UIOrientation.HORIZONTAL]: 24, [UIOrientation.VERTICAL]: 16 };
const CONTROLS_HEIGHT = 120;
const CHARACTER_EASING = 8;
const CHARACTER_GAP = 20;
const PORTRAIT_HEADER_HEIGHT = 260;
const FADE_OUT = 0.15;
const FADE_IN = 0.25;
const BUTTON_HEIGHT = { [UIOrientation.HORIZONTAL]: 44, [UIOrientation.VERTICAL]: 56 };
const BUTTON_PADDING = 18;
const BUTTON_GAP = 10;
const ICON_SIZE = { [UIOrientation.HORIZONTAL]: 24, [UIOrientation.VERTICAL]: 28 };
/* The border of the frame texture, two texture pixels per layer unit as in the landscape panel */
const FRAME_BORDER = 8;

const LANDSCAPE = UIOrientation.HORIZONTAL;
const PORTRAIT = UIOrientation.VERTICAL;
const ALWAYS = UIOrientation.ALWAYS;

/* Anchors run from 0 at the left or bottom edge to 1 at the right or top edge */
const horizontalDistance = (a, b, anchorA, anchorB, distance, orientation = ALWAYS) =>
  new UIHorizontalDistanceConstraint(a, b, { anchorA, anchorB, distance, orientation });
const verticalDistance = (a, b, anchorA, anchorB, distance, orientation = ALWAYS) =>
  new UIVerticalDistanceConstraint(a, b, { anchorA, anchorB, distance, orientation });
const fixSize = (element, width, height, orientation) => {
  new UIWidthConstraint(element, { width, orientation });
  new UIHeightConstraint(element, { height, orientation });
};

const setContent = (element, content) => {
  if (element.content[0]?.text !== content) {
    element.content = content;
  }
};

/**
 * The layer is at least 1920 by 900 units in landscape and 600 by 1300 units in portrait, so the
 * panel fits a short landscape phone and the tabs fit a narrow portrait one
 */
class PageResizePolicy extends UIResizePolicy {
  calculateScale(width, height) {
    const [minWidth, minHeight] = width > height ? [1920, 900] : [600, 1300];
    return Math.max(minWidth / width, minHeight / height);
  }
}

/**
 * The page around the character: title, links, scene tabs and the panel of the current scene. Buttons
 * are larger in portrait, where they are pressed with a finger.
 */
export async function createInterface(scenes, onSelect) {
  await Promise.all([
    document.fonts.load(`500 20px "${MONO_FONT}"`),
    document.fonts.load(`40px "${SANS_FONT}"`),
  ]);

  const layer = new UIViewportLayer({ resizePolicy: new PageResizePolicy() });
  layer.mode = UIMode.INTERACTIVE;

  let current = 0;
  let shown = 0;
  let sinceSwitch = Infinity;
  let alpha = 1;
  let characterBottom = null;

  const text = (content, { fontSize = 20, fontFamily = MONO_FONT, color = dim() } = {}) => {
    const fontWeight = fontFamily === MONO_FONT ? 500 : 400;
    const element = new UIText(layer, content, {
      commonStyle: { fontFamily, fontSize, fontWeight, color: "#ffffff" },
    });
    element.color = color;
    return element;
  };

  /*
   * A button is a label or an icon in a frame, and the frame takes the pointer. A label sets the
   * width of its frame, and an icon sits in the middle of a square one.
   */
  const buttonFrame = frameTexture();
  const hovered = new Set();
  const button = (content, onClick) => {
    const isIcon = typeof content !== "string";
    const label = isIcon ? new UIImage(layer, content) : text(content);
    const frame = new UINineSlice(layer, buttonFrame, {
      sliceBorders: FRAME_BORDER / FRAME_TEXTURE_SIZE,
      sliceRegions: FRAME_BORDER / 2,
    });
    frame.mode = UIMode.INTERACTIVE;
    for (const orientation of [LANDSCAPE, PORTRAIT]) {
      const height = BUTTON_HEIGHT[orientation];
      if (isIcon) {
        fixSize(label, ICON_SIZE[orientation], ICON_SIZE[orientation], orientation);
        fixSize(frame, height, height, orientation);
      } else {
        fixSize(frame, label.width + 2 * BUTTON_PADDING, height, orientation);
      }
    }
    horizontalDistance(
      frame,
      label,
      isIcon ? 0.5 : 0,
      isIcon ? 0.5 : 0,
      isIcon ? 0 : BUTTON_PADDING,
    );
    if (isIcon) {
      verticalDistance(frame, label, 0.5, 0.5, 0);
    }
    const entry = { label, frame };
    frame.signalPointerEntered.on(() => {
      hovered.add(entry);
      document.body.style.cursor = "pointer";
    });
    frame.signalPointerLeft.on(() => {
      hovered.delete(entry);
      document.body.style.cursor = "";
    });
    frame.signalPointerClicked.on(onClick);
    return entry;
  };
  const paint = ({ label, frame }, [frameColor, labelColor], alpha = 1) => {
    frame.color = frameColor;
    frame.color.a *= alpha;
    label.color = labelColor;
    label.color.a *= alpha;
  };
  const openLink = (url) => window.open(url, "_blank", "noopener");

  /*
   * In portrait the header stands in the column of the panel, which is centered when the screen
   * is wider than the page
   */
  const panel = new UIDummy(layer);

  const brand = text("ANIMOUSE", { fontSize: 40, fontFamily: SANS_FONT, color: bright() });
  horizontalDistance(layer, brand, 0, 0, 48, LANDSCAPE);
  horizontalDistance(panel, brand, 0, 0, 0, PORTRAIT);
  verticalDistance(brand, layer, 1, 1, 34, LANDSCAPE);
  verticalDistance(brand, layer, 1, 1, 24, PORTRAIT);
  const version = text(VERSION, { fontSize: 17 });
  horizontalDistance(brand, version, 0, 0, 2);
  verticalDistance(version, brand, 1, 0, 20);

  const npm = button(npmIcon(), () => openLink(NPM));
  const github = button(githubIcon(), () => openLink(REPOSITORY));
  const source = button(sourceIcon(), () => openLink(SOURCES + scenes[current].source));
  horizontalDistance(npm.frame, layer, 1, 1, 48, LANDSCAPE);
  horizontalDistance(npm.frame, panel, 1, 1, 0, PORTRAIT);
  horizontalDistance(github.frame, npm.frame, 1, 0, BUTTON_GAP);
  horizontalDistance(source.frame, github.frame, 1, 0, BUTTON_GAP);
  verticalDistance(github.frame, brand, 0.5, 0.5, 0);
  verticalDistance(github.frame, npm.frame, 0, 0, 0);
  verticalDistance(github.frame, source.frame, 0, 0, 0);

  /*
   * Tab names start with a capital, so their top edges line up. In portrait the tabs do not fit in
   * one row and take two rows of three.
   */
  const tabs = scenes.map((scene, i) => button(scene.tab, () => select(i)));
  const frames = tabs.map((tab) => tab.frame);
  horizontalDistance(layer, frames[0], 0, 0, 48, LANDSCAPE);
  horizontalDistance(panel, frames[0], 0, 0, 0, PORTRAIT);
  verticalDistance(frames[0], layer, 1, 1, 136, LANDSCAPE);
  verticalDistance(frames[0], layer, 1, 1, 114, PORTRAIT);
  /* The caps of a label are 16 units tall, and they sit in the middle of the frame */
  tabs.forEach(({ label, frame }, i) => {
    verticalDistance(label, frame, 1, 1, 14, LANDSCAPE);
    verticalDistance(label, frame, 1, 1, 20, PORTRAIT);
    if (i === 0) {
      return;
    }
    horizontalDistance(frames[i - 1], frame, 1, 0, BUTTON_GAP, LANDSCAPE);
    verticalDistance(frame, frames[0], 1, 1, 0, LANDSCAPE);
    if (i % 3 === 0) {
      horizontalDistance(panel, frame, 0, 0, 0, PORTRAIT);
      verticalDistance(frame, frames[i - 3], 1, 0, BUTTON_GAP, PORTRAIT);
    } else {
      horizontalDistance(frames[i - 1], frame, 1, 0, BUTTON_GAP, PORTRAIT);
      verticalDistance(frame, frames[i - 1], 1, 1, 0, PORTRAIT);
    }
  });

  /*
   * The panel: title and readout, a square diagram and a control strip under it. In portrait the
   * panel stands on the bottom edge and keeps only the rows of the diagram the scene draws in,
   * given by its `bounds`, and the strip only for a scene with controls. The character above the
   * panel gets the room.
   */
  const stripHeight = (orientation) =>
    CONTROLS_GAP[orientation] + (PANEL_WIDTH[orientation] * CONTROLS_HEIGHT) / CANVAS_SIZE;
  const portraitHeight = new UIHeightConstraint(panel, { height: 1, orientation: PORTRAIT });
  new UIHeightConstraint(panel, {
    height: DIAGRAM_TOP[LANDSCAPE] + PANEL_WIDTH[LANDSCAPE] + stripHeight(LANDSCAPE),
    orientation: LANDSCAPE,
  });
  for (const orientation of [LANDSCAPE, PORTRAIT]) {
    new UIWidthConstraint(panel, { width: PANEL_WIDTH[orientation], orientation });
  }
  horizontalDistance(panel, layer, 1, 1, 180, LANDSCAPE);
  verticalDistance(layer, panel, 0.5, 0.5, -20, LANDSCAPE);
  horizontalDistance(layer, panel, 0.5, 0.5, 0, PORTRAIT);
  verticalDistance(layer, panel, 0, 0, 28, PORTRAIT);

  const title = text(scenes[0].title, { fontSize: 36, fontFamily: SANS_FONT, color: bright() });
  horizontalDistance(panel, title, 0, 0, 0);
  verticalDistance(title, panel, 1, 1, 0);
  const readout = text("-");
  horizontalDistance(panel, readout, 0, 0, 0);
  verticalDistance(readout, panel, 1, 1, 58);

  /** A drawing area of the panel with a pool of labels, both placed in canvas pixels */
  function canvasArea(canvasHeight, top, labelCount, handlerName) {
    const graphics = new UIGraphics(layer, { width: CANVAS_SIZE, height: canvasHeight });
    graphics.mode = UIMode.INTERACTIVE;
    horizontalDistance(panel, graphics, 0, 0, 0);
    const offsets = {};
    for (const orientation of [LANDSCAPE, PORTRAIT]) {
      const width = PANEL_WIDTH[orientation];
      fixSize(graphics, width, (width * canvasHeight) / CANVAS_SIZE, orientation);
      offsets[orientation] = verticalDistance(
        graphics,
        panel,
        1,
        1,
        top(width, orientation),
        orientation,
      );
    }

    const labels = Array.from({ length: labelCount }, () => {
      const element = text("-");
      element.mode = UIMode.HIDDEN;
      return {
        element,
        horizontal: horizontalDistance(graphics, element, 0, 0, 0),
        vertical: verticalDistance(element, graphics, 0.5, 1, 0),
      };
    });
    let used = 0;

    /*
     * A scene that is not dragged presses targets, and targetAt tells what is under the pointer:
     * the cursor and the hover color follow it
     */
    let pointer = null;
    const toCanvas = (event) => [
      ((event.x - graphics.x) / graphics.width) * CANVAS_SIZE,
      (1 - (event.y - graphics.y) / graphics.height) * canvasHeight,
    ];
    const followsDrag = () => handlerName !== "press" || scenes[current].isDraggable;
    const handle = (event) => {
      scenes[current][handlerName]?.(...toCanvas(event));
    };
    graphics.signalPointerPressed.on(handle);
    graphics.signalPointerDragged.on((event) => {
      if (followsDrag()) {
        handle(event);
      }
    });
    graphics.signalPointerMoved.on((event) => {
      pointer = toCanvas(event);
      const scene = scenes[current];
      let cursor = "";
      if (scene[handlerName]) {
        cursor = followsDrag() ? "crosshair" : scene.targetAt?.(...pointer) ? "pointer" : "";
      }
      document.body.style.cursor = cursor;
    });
    graphics.signalPointerLeft.on(() => {
      pointer = null;
      document.body.style.cursor = "";
    });

    return {
      graphics,
      offsets,
      get pointer() {
        return pointer;
      },
      label(content, x, y, { anchorX = 0, anchorY = 0.5, color = dim() } = {}) {
        const { element, horizontal, vertical } = labels[used++];
        setContent(element, content);
        const scale = graphics.width / CANVAS_SIZE;
        horizontal.anchorB = anchorX;
        horizontal.distance = x * scale;
        vertical.anchorA = anchorY;
        vertical.distance = y * scale;
        element.color = color;
        element.color.a *= alpha;
        element.mode = UIMode.VISIBLE;
      },
      begin() {
        used = 0;
        graphics.clear();
        graphics.color.a = alpha;
      },
      end() {
        for (let i = used; i < labelCount; i++) {
          labels[i].element.mode = UIMode.HIDDEN;
        }
      },
    };
  }
  const diagram = canvasArea(
    CANVAS_SIZE,
    (width, orientation) => DIAGRAM_TOP[orientation],
    16,
    "press",
  );
  const controls = canvasArea(
    CONTROLS_HEIGHT,
    (width, orientation) => DIAGRAM_TOP[orientation] + width + CONTROLS_GAP[orientation],
    2,
    "pressControls",
  );
  const showScene = (index) => {
    const scene = scenes[index];
    const hasControls = Boolean(scene.pressControls);
    const [top, bottom] = scene.bounds ?? [0, CANVAS_SIZE];
    const scale = PANEL_WIDTH[PORTRAIT] / CANVAS_SIZE;
    const diagramBottom = DIAGRAM_TOP[PORTRAIT] + (bottom - top) * scale;
    title.content = scene.title;
    diagram.offsets[PORTRAIT].distance = DIAGRAM_TOP[PORTRAIT] - top * scale;
    controls.offsets[PORTRAIT].distance = diagramBottom + CONTROLS_GAP[PORTRAIT];
    portraitHeight.height = diagramBottom + (hasControls ? stripHeight(PORTRAIT) : 0);
    controls.graphics.mode = hasControls ? UIMode.INTERACTIVE : UIMode.HIDDEN;
  };
  showScene(0);

  function select(index) {
    if (index !== current) {
      current = index;
      sinceSwitch = 0;
      onSelect(index);
    }
  }

  return {
    /** Fades the old scene out and the new one in, then draws the shown scene */
    update(deltaTime) {
      sinceSwitch += deltaTime;
      if (sinceSwitch < FADE_OUT) {
        alpha = 1 - sinceSwitch / FADE_OUT;
      } else {
        if (shown !== current) {
          shown = current;
          showScene(shown);
        }
        alpha = Math.min(1, (sinceSwitch - FADE_OUT) / FADE_IN);
      }

      tabs.forEach((tab, i) => {
        paint(tab, controlColors({ isCurrent: i === current, isHovered: hovered.has(tab) }));
      });
      for (const link of [npm, github, source]) {
        paint(link, controlColors({ isHovered: hovered.has(link) }), link === source ? alpha : 1);
      }
      title.color.a = alpha;
      readout.color.a = alpha;

      diagram.begin();
      controls.begin();
      scenes[shown].draw(diagram, controls);
      diagram.end();
      controls.end();
      /* An empty text has no bounds, so an empty readout keeps a placeholder */
      setContent(readout, scenes[shown].readout() || "-");

      /* The character follows the top of the panel smoothly when the panel changes height */
      const target = panel.y + panel.height + CHARACTER_GAP;
      characterBottom =
        characterBottom === null
          ? target
          : characterBottom +
            (target - characterBottom) * (1 - Math.exp(-CHARACTER_EASING * deltaTime));
    },

    /** Where the character goes: left of the panel in landscape, above it in portrait */
    characterFrame() {
      if (layer.width > layer.height) {
        return [(0.6 * panel.x) / layer.width, 0.56, 0.5];
      }
      const top = layer.height - PORTRAIT_HEADER_HEIGHT;
      const bottom = characterBottom;
      return [0.5, 1 - (top + bottom) / 2 / layer.height, (0.82 * (top - bottom)) / layer.height];
    },

    render(renderer, deltaTime) {
      layer.render(renderer, deltaTime);
    },
  };
}
