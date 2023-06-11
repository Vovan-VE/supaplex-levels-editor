import { createNewLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { ISupaplexFormat } from "../../types";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";
import { readLevelset, writeLevelset } from "./io";
import { supportReport } from "./supportReport";

export const DAT: ISupaplexFormat = {
  title: "DAT",
  fileExtensions: /(dat|d\d{2})/i,
  fileExtensionDefault: "dat",
  resizable: {
    minWidth: LEVEL_WIDTH,
    maxWidth: LEVEL_WIDTH,
    minHeight: LEVEL_HEIGHT,
    maxHeight: LEVEL_HEIGHT,
  },
  minLevelsCount: 1,
  maxLevelsCount: null,
  supportReport,
  readLevelset,
  writeLevelset,
  createLevelset: (levels) => createLevelset(levels ?? 111),
  createLevel: (options) =>
    createNewLevel({
      ...options,
      width: LEVEL_WIDTH,
      height: LEVEL_HEIGHT,
    }),
};
