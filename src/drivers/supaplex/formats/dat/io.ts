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
  for (let [i, level] of levelset.getLevels().entries()) {
    // errors covered by "support report"
    if (level.width > LEVEL_WIDTH || level.height > LEVEL_HEIGHT) {
      throw new Error(
        `Level ${i + 1} is too large: ${level.width}x${level.height}`,
      );
    }

    // warnings covered by "support report"
    if (level.width < LEVEL_WIDTH || level.height < LEVEL_HEIGHT) {
      level = level.resize({ width: LEVEL_WIDTH, height: LEVEL_HEIGHT });
    }
    level = level.setDemo(null);

    result.set(level.raw, i * LEVEL_BYTES_LENGTH);
  }
  return result.buffer;
};
