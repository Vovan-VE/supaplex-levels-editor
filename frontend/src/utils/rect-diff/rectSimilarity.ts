import { inBounds, Point2D, Rect } from "../rect";
import { IDataRect } from "./dataRect";

export type SimilarTilesMap = ReadonlyMap<number, number>;

export interface RectSimilarityOptions {
  first: IDataRect;
  second: IDataRect;
  firstRegion: Rect;
  secondStart: Point2D;
  similarTiles?: SimilarTilesMap;
  needContinue?: (r: RectSimilarityResult) => unknown;
}

export interface RectSimilarityResult {
  sameCount: number;
  similarCount: number;
  differentCount: number;
}

export const rectSimilarity = ({
  first,
  second,
  firstRegion: { x: ax0, y: ay0, width, height },
  secondStart: { x: bx0, y: by0 },
  similarTiles,
  needContinue,
}: RectSimilarityOptions): RectSimilarityResult => {
  if (process.env.NODE_ENV !== "production") {
    if (!inBounds(ax0, ay0, first)) {
      throw new RangeError(`First start point out of range`);
    }
    if (!inBounds(ax0 + width - 1, ay0 + height - 1, first)) {
      throw new RangeError(`First end point out of range`);
    }
    if (!inBounds(bx0, by0, second)) {
      throw new RangeError(`Second start point out of range`);
    }
    if (!inBounds(bx0 + width - 1, by0 + height - 1, second)) {
      throw new RangeError(`Second end point out of range`);
    }
  }

  let sameCount = 0;
  let similarCount = 0;
  let differentCount = 0;
  const res = (): RectSimilarityResult => ({
    sameCount,
    similarCount,
    differentCount,
  });

  for (let j = 0; j < height; j++) {
    const ay = ay0 + j;
    const by = by0 + j;
    for (let i = 0; i < width; i++) {
      if (needContinue) {
        const r = res();
        if (!needContinue(r)) {
          return r;
        }
      }

      const ax = ax0 + i;
      const bx = bx0 + i;

      let aTile = first.getTile(ax, ay);
      let bTile = second.getTile(bx, by);
      if (aTile === bTile) {
        sameCount++;
        continue;
      }
      if (similarTiles) {
        const aS = similarTiles.get(aTile);
        const bS = similarTiles.get(bTile);
        if (aS !== undefined) {
          if (aS === (bS ?? bTile)) {
            similarCount++;
            continue;
          }
        } else if (bS !== undefined) {
          if (aTile === bS) {
            similarCount++;
            continue;
          }
        }
      }
      differentCount++;
    }
  }

  return res();
};
