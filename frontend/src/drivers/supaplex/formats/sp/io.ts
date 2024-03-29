import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { ISupaplexLevelset } from "../../types";
import { LEVEL_BYTES_LENGTH, LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";

export const readLevelset = (file: ArrayBuffer): ISupaplexLevelset => {
  if (file.byteLength < LEVEL_BYTES_LENGTH) {
    throw new Error("Invalid file size: less then level size");
  }

  return createLevelset([
    createLevel(LEVEL_WIDTH, LEVEL_HEIGHT, new Uint8Array(file)),
  ]);
};

export const writeLevelset = (levelset: ISupaplexLevelset): ArrayBuffer => {
  let level = levelset.getLevel(0);

  // errors covered by "support report"
  if (level.width > LEVEL_WIDTH || level.height > LEVEL_HEIGHT) {
    throw new Error(`Level is too large: ${level.width}x${level.height}`);
  }

  // warnings covered by "support report"
  if (level.width < LEVEL_WIDTH || level.height < LEVEL_HEIGHT) {
    level = level.resize({ width: LEVEL_WIDTH, height: LEVEL_HEIGHT });
  }

  return level.raw.buffer;
};
