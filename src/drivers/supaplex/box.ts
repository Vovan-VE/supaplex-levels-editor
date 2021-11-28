import { IBox } from "./internal";

export const LEVEL_WIDTH = 60;
export const LEVEL_HEIGHT = 24;
export const BODY_LENGTH = LEVEL_WIDTH * LEVEL_HEIGHT;

export const supaplexBox: IBox = {
  // width: LEVEL_WIDTH,
  // height: LEVEL_HEIGHT,
  length: BODY_LENGTH,
  coordsToOffset: (x: number, y: number) => y * LEVEL_WIDTH + x,
  validateCoords:
    process.env.NODE_ENV === "production"
      ? undefined
      : (x: number, y: number) => {
          if (x < 0 || x >= LEVEL_WIDTH || y < 0 || y >= LEVEL_HEIGHT) {
            throw new RangeError(`Cell coords (${x}, ${y}) are out of range`);
          }
        },
} as const;
