import { ISupaplexFormat } from "../../types";
import { fillLevelBorder } from "../../fillLevelBorder";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../../box";
import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { readLevelset, writeLevelset } from "./io";

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
  supportReport: () => null,
  readLevelset,
  writeLevelset,
  createLevelset,
  createLevel: ({ borderTile } = {}) =>
    fillLevelBorder(createLevel(), borderTile),
};
