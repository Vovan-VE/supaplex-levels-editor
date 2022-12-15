import { Rect } from "./types";

export const fromDrag = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Rect => ({
  x: Math.min(x1, x2),
  y: Math.min(y1, y2),
  width: Math.abs(x2 - x1) + 1,
  height: Math.abs(y2 - y1) + 1,
});
