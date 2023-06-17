import { ISupaplexFormat } from "../../types";
import { DAT } from "../dat";
import { readLevelset, writeLevelset } from "./io";
import { createLevelset } from "../../levelset";
import { SIGNATURE_MAX_LENGTH } from "../std";
import { supportReport } from "./supportReport";

export const SP: ISupaplexFormat = {
  title: "SP",
  fileExtensionDefault: "sp",
  resizable: DAT.resizable,
  minLevelsCount: 1,
  maxLevelsCount: 1,
  demoSupport: true,
  signatureMaxLength: SIGNATURE_MAX_LENGTH,
  supportReport,
  readLevelset,
  writeLevelset,
  createLevelset: (levels) => createLevelset(levels ?? 1),
  createLevel: DAT.createLevel,
};
