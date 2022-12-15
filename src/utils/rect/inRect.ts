import { isOffsetInRange } from "../number";
import { Rect } from "./types";

export const inRect = (x: number, y: number, rect: Rect) =>
  isOffsetInRange(x, rect.x, rect.width) &&
  isOffsetInRange(y, rect.y, rect.height);
