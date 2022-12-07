import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../../../supaplex/box";
import { fillLevelBorder } from "../../../supaplex/fillLevelBorder";
import { IMegaplexFormat } from "../../types";
import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { resizable } from "../../resizable";
import { readLevelset, writeLevelset } from "../../io";

export const MPX: IMegaplexFormat = {
  title: "MPX",
  fileExtensionDefault: "mpx",
  resizable,
  minLevelsCount: 1,
  maxLevelsCount: 0x7fff,
  demoSupport: true,
  supportReport: () => null,
  readLevelset,
  writeLevelset,
  createLevelset,
  createLevel: ({
    width = LEVEL_WIDTH,
    height = LEVEL_HEIGHT,
    borderTile,
  } = {}) => fillLevelBorder(createLevel(width, height), borderTile),
};
