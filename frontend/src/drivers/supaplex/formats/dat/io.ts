import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { ISupaplexLevel, ISupaplexLevelset } from "../../types";
import { LEVEL_BYTES_LENGTH, LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";

function validateBuffer(buffer: ArrayBuffer): Error | null {
  if (buffer.byteLength % LEVEL_BYTES_LENGTH) {
    return new Error("Invalid file size: not a module of level size");
  }
  return null;
}

export function isReadableBuffer(buffer: ArrayBuffer): boolean {
  const err = validateBuffer(buffer);
  return !err;
}

function* levelsFromBuffer(buffer: ArrayBuffer): Iterable<ISupaplexLevel> {
  const err = validateBuffer(buffer);
  if (err) throw err;

  // // Edge case: *.SP with length mod 1536 is read as *.DAT
  // // [1536 bytes one level] [1 byte level index] [*bytes demo] FF ([*bytes signature] FF)?
  // if (
  //   buffer.byteLength > LEVEL_BYTES_LENGTH + 2 &&
  //   looksLikeDemo(buffer.slice(LEVEL_BYTES_LENGTH))
  // ) {
  //   throw new Error("An *.SP demo detected");
  // }

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
  for (const [i, level] of levelset.getLevels().entries()) {
    let lvl = level;
    // errors covered by "support report"
    if (lvl.width > LEVEL_WIDTH || lvl.height > LEVEL_HEIGHT) {
      throw new Error(
        `Level ${i + 1} is too large: ${lvl.width}x${lvl.height}`,
      );
    }

    // warnings covered by "support report"
    if (lvl.width < LEVEL_WIDTH || lvl.height < LEVEL_HEIGHT) {
      lvl = lvl.resize({ width: LEVEL_WIDTH, height: LEVEL_HEIGHT });
    }
    lvl = lvl.setDemo(null).setDemoSeed({ hi: 0, lo: 0 }).setSignature(null);

    result.set(lvl.raw, i * LEVEL_BYTES_LENGTH);
  }
  return result.buffer;
};

// function looksLikeDemo(buffer: ArrayBuffer): boolean {
//   const bytes = new Uint8Array(buffer);
//   const p1 = bytes.indexOf(0xff, 1);
//   // absent or not far enough => not a demo
//   if (p1 < 2) return false;
//   const p2 = bytes.indexOf(0xff, p1 + 1);
//   // no signature, ok
//   if (p2 < 0) return true;
//   // signature FF <end>, ok
//   return p2 === bytes.length - 1;
//   // TODO: demo body bytes check
// }
