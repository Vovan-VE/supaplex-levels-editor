import { ISupaplexFormat } from "../../types";
import { fillLevelBorder } from "../../fillLevelBorder";
import { reader, writer } from "../../io";
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
  readLevelset: reader.readLevelset,
  writeLevelset: writer.writeLevelset,
  createLevelset,
  createLevel: ({ borderTile } = {}) =>
    fillLevelBorder(createLevel(), borderTile),
};
