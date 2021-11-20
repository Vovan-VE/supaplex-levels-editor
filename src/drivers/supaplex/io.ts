import { ISupaplexLevelset, ISupaplexReader, ISupaplexWriter } from "./types";
import { LEVEL_BYTES_LENGTH, SupaplexLevel } from "./level";
import { SupaplexLevelset } from "./levelset";

function* levelsFromBuffer(buffer: ArrayBuffer) {
  if (buffer.byteLength % LEVEL_BYTES_LENGTH) {
    throw new Error("Invalid file size: not a module of level size");
  }

  const count = Math.floor(buffer.byteLength / LEVEL_BYTES_LENGTH);
  for (let i = 0; i < count; i++) {
    yield SupaplexLevel.fromArrayBuffer(buffer, i * LEVEL_BYTES_LENGTH);
  }
}

function* levelsToRaw(levelset: ISupaplexLevelset) {
  for (const level of levelset.getLevels()) {
    yield level.raw;
  }
}

export const readLevelset = async (file: Blob): Promise<ISupaplexLevelset> =>
  new SupaplexLevelset(levelsFromBuffer(await file.arrayBuffer()));

export const writeLevelset = async (
  levelset: ISupaplexLevelset,
): Promise<Blob> => new Blob([...levelsToRaw(levelset)]);

export const reader: ISupaplexReader = {
  readLevelset,
};

export const writer: ISupaplexWriter = {
  writeLevelset,
};
