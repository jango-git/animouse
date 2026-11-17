import { UIColor } from "laymur";

export const COLORS = {
  accent: "#2fd3a8",
  text: "#ececec",
  dim: "#868686",
  stage: "#050505",
  body: "#2a2a2a",
};
export const TAU = Math.PI * 2;

/* Scenes draw their diagram in a square canvas of this many pixels, with y going down */
export const CANVAS_SIZE = 1200;

export const hex = (color) => parseInt(color.slice(1), 16);
export const rgba = (color, alpha) => {
  const value = hex(color);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};
export const accent = (alpha = 1) => new UIColor(hex(COLORS.accent), alpha);
export const bright = (alpha = 1) => new UIColor(hex(COLORS.text), alpha);
export const dim = (alpha = 1) => new UIColor(hex(COLORS.dim), alpha);

/* Everything that can be pressed has a frame, with a line this many canvas pixels wide */
export const FRAME_LINE = 3;

/** The closed outline of a frame, with the line kept inside the box */
export function framePoints(x, y, width, height) {
  const inset = FRAME_LINE / 2;
  const left = x + inset;
  const top = y + inset;
  const right = x + width - inset;
  const bottom = y + height - inset;
  const middle = (left + right) / 2;
  return [
    [middle, top],
    [right, top],
    [right, bottom],
    [left, bottom],
    [left, top],
    [middle, top],
  ];
}

export function drawFrame(graphics, x, y, width, height, color) {
  graphics.drawPolyline(framePoints(x, y, width, height), color, FRAME_LINE);
}

/**
 * Frame and label colors of a control. The current one is in the accent color, the one under the
 * pointer is bright, and one that cannot be pressed now fades.
 */
export function controlColors({ isCurrent = false, isHovered = false, isEnabled = true }) {
  if (isCurrent) {
    return [accent(), bright()];
  }
  if (!isEnabled) {
    return [dim(0.12), dim(0.6)];
  }
  return isHovered ? [bright(0.7), bright()] : [dim(0.3), dim()];
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const signed = (value) => `${value < 0 ? "" : " "}${value.toFixed(2)}`;

export function circle(x, y, radius, segments = 160) {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const angle = (i / segments) * TAU;
    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
  });
}

export function dashedLine(graphics, [x0, y0], [x1, y1], color, width) {
  for (let t = 0; t < 1; t += 0.1) {
    const end = t + 0.05;
    graphics.drawPolyline(
      [
        [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t],
        [x0 + (x1 - x0) * end, y0 + (y1 - y0) * end],
      ],
      color,
      width,
    );
  }
}

export function anchorMark(graphics, x, y, weight) {
  const size = 14 + 26 * weight;
  graphics.drawRect(x - size / 2, y - size / 2, size, size, accent(0.5 + 0.5 * weight));
}

export function cursorMark(graphics, x, y) {
  const radius = 28;
  graphics.drawPolyline(circle(x, y, radius, 64), bright(), 3);
  graphics.drawRect(x - radius - 14, y - 1, 14, 2, bright());
  graphics.drawRect(x + radius, y - 1, 14, 2, bright());
  graphics.drawRect(x - 1, y - radius - 14, 2, 14, bright());
  graphics.drawRect(x - 1, y + radius, 2, 14, bright());
}

const SLIDER_LEFT = 300;
const SLIDER_RIGHT = CANVAS_SIZE;

export function slider(graphics, value, min, max) {
  const x = SLIDER_LEFT + (SLIDER_RIGHT - SLIDER_LEFT) * ((value - min) / (max - min));
  graphics.drawRect(SLIDER_LEFT, 59, SLIDER_RIGHT - SLIDER_LEFT, 2, dim(0.5));
  graphics.drawRect(SLIDER_LEFT, 56, x - SLIDER_LEFT, 8, accent());
  graphics.drawRect(x - 4, 36, 8, 48, bright());
}

export function sliderValue(x, min, max) {
  return min + (max - min) * clamp((x - SLIDER_LEFT) / (SLIDER_RIGHT - SLIDER_LEFT), 0, 1);
}
