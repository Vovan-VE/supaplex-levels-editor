import { ISizeLimit } from "../../types";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../box";

export const resizable: ISizeLimit = {
  minWidth: LEVEL_WIDTH,
  maxWidth: LEVEL_WIDTH,
  minHeight: LEVEL_HEIGHT,
  maxHeight: LEVEL_HEIGHT,
};
