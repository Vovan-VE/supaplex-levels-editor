import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { ISupaplexLevelset } from "../../types";
import { LEVEL_BYTES_LENGTH, LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";

export const readLevelset = (file: ArrayBuffer): ISupaplexLevelset => {
  if (file.byteLength < LEVEL_BYTES_LENGTH) {
    throw new Error("Invalid file size: less then level size");
  }

  let startOfSignature = LEVEL_BYTES_LENGTH;
  if (file.byteLength > LEVEL_BYTES_LENGTH) {
    const trailer = new Uint8Array(file, LEVEL_BYTES_LENGTH);
    const p = trailer.indexOf(0xff, 1);
    if (p > 0) {
      startOfSignature += p + 1;
    }
  }

  return createLevelset([
    createLevel(
      LEVEL_WIDTH,
      LEVEL_HEIGHT,
      new Uint8Array(file, 0, startOfSignature),
    ),
  ]);
};

export const writeLevelset = (levelset: ISupaplexLevelset): ArrayBuffer =>
  levelset.getLevel(0).raw.buffer;
