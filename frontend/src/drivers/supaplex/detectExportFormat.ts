import { ISupaplexLevel } from "./types";
import { FormatName } from "./formats";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "./formats/std";

export const detectExportFormat = (level: ISupaplexLevel): FormatName => {
  if (level.width === LEVEL_WIDTH && level.height === LEVEL_HEIGHT) {
    return "sp";
  }
  return "mpx";
};
