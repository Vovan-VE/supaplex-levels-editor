import { ISupaplexFormat } from "../../types";
import { DAT } from "../dat";
import { readLevelset, writeLevelset } from "./io";
import { createLevelset } from "../../levelset";
import { fillLevelBorder } from "../../fillLevelBorder";
import { createLevel } from "../../level";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";

export const SP: ISupaplexFormat = {
  title: "SP",
  fileExtensionDefault: "sp",
  resizable: DAT.resizable,
  minLevelsCount: 1,
  maxLevelsCount: 1,
  demoSupport: true,
  supportReport: () => null,
  readLevelset,
  writeLevelset,
  createLevelset: (levels) => createLevelset(levels ?? 1),
  createLevel: ({ borderTile } = {}) =>
    fillLevelBorder(createLevel(LEVEL_WIDTH, LEVEL_HEIGHT), borderTile),
};
