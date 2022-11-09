import { isOffsetInRange } from "../number";
import { RectA } from "./types";

export const inRect = (x: number, y: number, rect: RectA) =>
  isOffsetInRange(x, rect[0], rect[2]) && isOffsetInRange(y, rect[1], rect[3]);
