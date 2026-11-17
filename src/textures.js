import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

import { FRAME_LINE, framePoints } from "./draw.js";

export function canvasTexture(size, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  draw(canvas.getContext("2d"), size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function strokePolyline(context, points) {
  context.beginPath();
  for (const [x, y] of points) {
    context.lineTo(x, y);
  }
  context.stroke();
}

/* The interface textures are white and take the color of their element */

const ICON_SIZE = 128;
export const FRAME_TEXTURE_SIZE = 64;

const whiteTexture = (size, draw) =>
  canvasTexture(size, (context) => {
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#ffffff";
    draw(context);
  });

/* The frame of a button, stretched as a nine-slice */
export function frameTexture() {
  const texture = whiteTexture(FRAME_TEXTURE_SIZE, (context) => {
    context.lineWidth = FRAME_LINE;
    strokePolyline(context, framePoints(0, 0, FRAME_TEXTURE_SIZE, FRAME_TEXTURE_SIZE));
  });
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  return texture;
}

/* The GitHub mark in a 16 unit box */
const GITHUB =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";

/* The npm mark in a 24 unit box: a square with the letter cut out */
const NPM = "M0 0h24v24H0zM5.13 5.32l13.84.02-.01 13.84h-3.46l.01-10.38h-3.46l-.01 10.37H5.11z";

export const githubIcon = () =>
  whiteTexture(ICON_SIZE, (context) => {
    context.scale(ICON_SIZE / 16, ICON_SIZE / 16);
    context.fill(new Path2D(GITHUB));
  });

/* The npm square is drawn smaller than the box so that it weighs as much as the round mark */
export const npmIcon = () =>
  whiteTexture(ICON_SIZE, (context) => {
    const inset = 0.08 * ICON_SIZE;
    context.translate(inset, inset);
    context.scale((ICON_SIZE - 2 * inset) / 24, (ICON_SIZE - 2 * inset) / 24);
    context.fill(new Path2D(NPM), "evenodd");
  });

/* Angle brackets and a slash in a 24 unit box */
export const sourceIcon = () =>
  whiteTexture(ICON_SIZE, (context) => {
    context.scale(ICON_SIZE / 24, ICON_SIZE / 24);
    context.lineWidth = 2.4;
    context.lineJoin = "miter";
    strokePolyline(context, [
      [7.5, 5],
      [1.5, 12],
      [7.5, 19],
    ]);
    strokePolyline(context, [
      [16.5, 5],
      [22.5, 12],
      [16.5, 19],
    ]);
    strokePolyline(context, [
      [14, 3],
      [10, 21],
    ]);
  });
