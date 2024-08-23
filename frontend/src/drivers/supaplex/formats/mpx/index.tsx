import { Trans } from "i18n/Trans";
import { createNewLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { ISupaplexFormat } from "../../types";
import { SIGNATURE_MAX_LENGTH } from "../std";
import { readLevelset, writeLevelset } from "./io";
import { supportReport } from "./supportReport";

export const MPX: ISupaplexFormat = {
  title: "MPX",
  description: <Trans i18nKey="main:supaplex.format.mpx.desc" />,
  fileExtensionDefault: "mpx",
  resizable: {
    maxWidth: 0x7fff,
    maxHeight: 0x7fff,
  },
  minLevelsCount: 1,
  maxLevelsCount: 0x7fff,
  demoSupport: true,
  signatureMaxLength: SIGNATURE_MAX_LENGTH,
  supportReport,
  readLevelset,
  writeLevelset,
  createLevelset: (levels) => createLevelset(levels ?? 1),
  createLevel: createNewLevel,
};
