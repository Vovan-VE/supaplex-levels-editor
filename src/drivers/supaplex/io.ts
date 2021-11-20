import { ISupaplexLevelset, ISupaplexReader } from "./types";
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

export const readLevelset = async (file: Blob): Promise<ISupaplexLevelset> =>
  new SupaplexLevelset(levelsFromBuffer(await file.arrayBuffer()));

export const reader: ISupaplexReader = {
  readLevelset,
};
