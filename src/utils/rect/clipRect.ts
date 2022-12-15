import { IBounds, Rect } from "./types";

export const clipRect = (
  { x, y, width: w, height: h }: Rect,
  { width, height }: IBounds,
): Rect => {
  if (x >= width) {
    x = width;
    w = 0;
  } else {
    if (x < 0) {
      w += x;
      if (w < 0) {
        w = 0;
      }
      x = 0;
    }
    if (x + w > width) {
      w = width - x;
    }
  }

  if (y >= height) {
    y = height;
    h = 0;
  } else {
    if (y < 0) {
      h += y;
      if (h < 0) {
        h = 0;
      }
      y = 0;
    }
    if (y + h > height) {
      h = height - y;
    }
  }
  return { x, y, width: w, height: h };
};
