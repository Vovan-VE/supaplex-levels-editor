import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { ISupaplexLevelset } from "../../types";
import { LEVEL_BYTES_LENGTH, LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";

function validateBuffer(buffer: ArrayBufferLike): Error | null {
  if (buffer.byteLength < LEVEL_BYTES_LENGTH) {
    return new Error("Invalid file size: less then level size");
  }
  return null;
}

export function isReadableBuffer(buffer: ArrayBufferLike): boolean {
  const err = validateBuffer(buffer);
  return !err;
}

export const readLevelset = (buffer: ArrayBufferLike): ISupaplexLevelset => {
  const err = validateBuffer(buffer);
  if (err) throw err;

  return createLevelset([
    createLevel(LEVEL_WIDTH, LEVEL_HEIGHT, new Uint8Array(buffer)),
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
