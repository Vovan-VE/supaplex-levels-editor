import { ISupaplexFormat } from "../../types";
import { fillLevelBorder } from "../../fillLevelBorder";
import { readLevelset, writeLevelset } from "../../io";
import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { resizable } from "../resizable";

export const DAT: ISupaplexFormat = {
  title: "DAT",
  fileExtensions: /(dat|d\d{2})/i,
  fileExtensionDefault: "dat",
  resizable,
  minLevelsCount: 1,
  maxLevelsCount: null,
  supportReport: () => null,
  readLevelset,
  writeLevelset,
  createLevelset,
  createLevel: ({ borderTile } = {}) =>
    fillLevelBorder(createLevel(), borderTile),
};
