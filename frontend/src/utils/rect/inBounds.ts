import { IBounds } from "./types";

export const inBounds = (x: number, y: number, b: IBounds) =>
  x >= 0 && y >= 0 && x < b.width && y < b.height;
