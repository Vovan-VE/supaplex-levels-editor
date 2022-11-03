import { RectA } from "./types";

export const fromDrag = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): RectA => [
  Math.min(x1, x2),
  Math.min(y1, y2),
  Math.abs(x2 - x1) + 1,
  Math.abs(y2 - y1) + 1,
];
