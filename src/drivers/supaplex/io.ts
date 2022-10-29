import { ISupaplexReader, ISupaplexWriter } from "./types";
import { createLevelFromArrayBuffer, LEVEL_BYTES_LENGTH } from "./level";
import { createLevelset } from "./levelset";

function* levelsFromBuffer(buffer: ArrayBuffer) {
  if (buffer.byteLength % LEVEL_BYTES_LENGTH) {
    throw new Error("Invalid file size: not a module of level size");
  }

  const count = Math.floor(buffer.byteLength / LEVEL_BYTES_LENGTH);
  for (let i = 0; i < count; i++) {
    yield createLevelFromArrayBuffer(buffer, i * LEVEL_BYTES_LENGTH);
  }
}

export const reader: ISupaplexReader = {
  readLevelset: (file) => createLevelset(levelsFromBuffer(file)),
};

export const writer: ISupaplexWriter = {
  writeLevelset: (levelset) => {
    const result = new Uint8Array(levelset.levelsCount * LEVEL_BYTES_LENGTH);
    let i = 0;
    for (const level of levelset.getLevels()) {
      result.set(level.raw, i * LEVEL_BYTES_LENGTH);
      i++;
    }
    return result.buffer;
  },
};
