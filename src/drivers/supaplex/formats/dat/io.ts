import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { ISupaplexLevel, ISupaplexLevelset } from "../../types";
import { LEVEL_BYTES_LENGTH, LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";

function* levelsFromBuffer(buffer: ArrayBuffer): Iterable<ISupaplexLevel> {
  if (buffer.byteLength % LEVEL_BYTES_LENGTH) {
    throw new Error("Invalid file size: not a module of level size");
  }

  const count = Math.floor(buffer.byteLength / LEVEL_BYTES_LENGTH);
  for (let i = 0; i < count; i++) {
    yield createLevel(
      LEVEL_WIDTH,
      LEVEL_HEIGHT,
      new Uint8Array(buffer, i * LEVEL_BYTES_LENGTH, LEVEL_BYTES_LENGTH),
    );
  }
}

export const readLevelset = (file: ArrayBuffer): ISupaplexLevelset =>
  createLevelset(levelsFromBuffer(file));

export const writeLevelset = (levelset: ISupaplexLevelset): ArrayBuffer => {
  const result = new Uint8Array(levelset.levelsCount * LEVEL_BYTES_LENGTH);
  let i = 0;
  for (const level of levelset.getLevels()) {
    result.set(level.raw, i * LEVEL_BYTES_LENGTH);
    i++;
  }
  return result.buffer;
};
