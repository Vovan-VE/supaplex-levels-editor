import { createNewLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { ISupaplexFormat } from "../../types";
import { readLevelset, writeLevelset } from "./io";
import { supportReport } from "./supportReport";

export const MPX: ISupaplexFormat = {
  title: "MPX",
  fileExtensionDefault: "mpx",
  resizable: {
    maxWidth: 0x7fff,
    maxHeight: 0x7fff,
  },
  minLevelsCount: 1,
  maxLevelsCount: 0x7fff,
  demoSupport: true,
  supportReport,
  readLevelset,
  writeLevelset,
  createLevelset: (levels) => createLevelset(levels ?? 1),
  createLevel: createNewLevel,
};
