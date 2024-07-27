import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { ISupaplexLevel, ISupaplexLevelset } from "../../types";
import { FOOTER_BYTE_LENGTH } from "../std";

// MPX format
// 04 : "MPX "
// 04 : 01 00 01 00
//      -ver- -----
//            levels
//            count
// repeat for every level {
// 04 :  w 00  h 00
// 08 : 15 00 00 00
//      -offset+1--
// 0C : 82 06 00 00
//      ---size----
// }
// repeat for every level {
//    : std sp level with respect to w & h
//    : demo
// }
//
// - https://git.artsoft.org/?p=rocksndiamonds.git;a=commit;h=29ea60b3
// - https://github.com/ArtsoftEntertainment/rocksndiamonds/commit/29ea60b3#diff-6854d2255acd6155f61b1558b39cbce581fad371b897b8ab58a90e6a227a6a5eR370

const MPX_SIGN = new Uint8Array("MPX ".split("").map((ch) => ch.charCodeAt(0)));
const MIN_FILE_SIZE = 8 + 12 + 1 + FOOTER_BYTE_LENGTH;

const cmpUint8Array = (
  buffer: ArrayBuffer,
  byteOffset: number,
  match: Uint8Array,
) =>
  new Uint8Array(buffer, byteOffset, match.length).every(
    (b, i) => b === match[i],
  );

const getInt16LE = (file: ArrayBuffer, byteOffset: number) =>
  new DataView(file, byteOffset, 2).getInt16(0, true);

const getInt32LE = (file: ArrayBuffer, byteOffset: number) =>
  new DataView(file, byteOffset, 4).getInt32(0, true);

const setInt16LE = (buffer: Uint8Array, byteOffset: number, value: number) => {
  new DataView(buffer.buffer).setInt16(byteOffset, value, true);
};

const setInt32LE = (buffer: Uint8Array, byteOffset: number, value: number) => {
  new DataView(buffer.buffer).setInt32(byteOffset, value, true);
};

export const readLevelset = (file: ArrayBuffer): ISupaplexLevelset => {
  if (file.byteLength < MIN_FILE_SIZE || !cmpUint8Array(file, 0, MPX_SIGN)) {
    throw new Error("Unrecognized file format");
  }

  const ver = getInt16LE(file, 4);
  let levelsCount = getInt16LE(file, 6);
  const widths: number[] = [];
  const heights: number[] = [];
  const offsets: number[] = [];
  const sizes: number[] = [];
  if (ver === 0x2020 && levelsCount === 0x2020) {
    // 4 spaces
    //ver = 1;
    levelsCount = 1;
    widths.push(getInt16LE(file, 8));
    heights.push(getInt16LE(file, 10));
    offsets.push(20);
    sizes.push(widths[0] * heights[0] + FOOTER_BYTE_LENGTH);
  } else {
    if (ver !== 1) {
      throw new Error(`Unsupported format version ${ver}`);
    }
    for (let i = 0, at = 8; i < levelsCount; i++, at += 12) {
      widths.push(getInt16LE(file, at));
      heights.push(getInt16LE(file, at + 2));
      offsets.push(getInt32LE(file, at + 4) - 1);
      sizes.push(getInt32LE(file, at + 8));
    }
  }

  const levels: ISupaplexLevel[] = [];
  for (let i = 0; i < levelsCount; i++) {
    levels.push(
      createLevel(
        widths[i],
        heights[i],
        new Uint8Array(file, offsets[i], sizes[i]),
      ),
    );
  }

  return createLevelset(levels);
};

export const writeLevelset = (levelset: ISupaplexLevelset): ArrayBuffer => {
  // warnings covered by "support report"
  const levelsCount = Math.min(0x7fff, levelset.levelsCount);
  const levels = levelset.getLevels().slice(0, levelsCount);

  const widths: number[] = [];
  const heights: number[] = [];
  const offsets: number[] = [];
  const sizes: number[] = [];

  let offset = 8 + 12 * levelsCount;
  for (const [i, level] of levels.entries()) {
    // errors covered by "support report"
    if (level.width > 0x7fff || level.height > 0x7fff) {
      throw new Error(
        `Level ${i + 1} is too large: ${level.width}x${level.height}`,
      );
    }
    if (offset >= 0x7fffffff - 1) {
      throw new Error(
        `Level ${
          i + 1
        } cannot be saved due to MPX file format limitations (offset+1 exceeds maximum)`,
      );
    }

    widths.push(level.width);
    heights.push(level.height);
    offsets.push(offset);
    sizes.push(level.length);
    offset += level.length;
  }

  const result = new Uint8Array(offset);
  result.set(MPX_SIGN, 0);
  setInt16LE(result, 4, 1);
  setInt16LE(result, 6, levelsCount);
  for (let i = 0, at = 8; i < levelsCount; i++, at += 12) {
    setInt16LE(result, at, widths[i]);
    setInt16LE(result, at + 2, heights[i]);
    setInt32LE(result, at + 4, offsets[i] + 1);
    setInt32LE(result, at + 8, sizes[i]);

    result.set(levels[i].raw, offsets[i]);
  }

  return result.buffer;
};
