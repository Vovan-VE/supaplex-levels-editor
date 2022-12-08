import { fillLevelBorder } from "../../fillLevelBorder";
import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { ISupaplexFormat } from "../../types";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";
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
  createLevelset: (levels) => createLevelset(levels ?? 111),
  createLevel: ({ borderTile } = {}) =>
    fillLevelBorder(createLevel(LEVEL_WIDTH, LEVEL_HEIGHT), borderTile),
};
