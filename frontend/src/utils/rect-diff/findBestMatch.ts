import { IBounds, Point2D, Rect } from "../rect";
import { CalcMaskResult } from "./calcMask";
import { IDataRect } from "./dataRect";
import {
  rectSimilarity,
  RectSimilarityResult,
  SimilarTilesMap,
} from "./rectSimilarity";

export interface FindBestMatchOptions {
  first: IDataRect;
  second: IDataRect;
  firstMask?: CalcMaskResult;
  secondMask?: CalcMaskResult;
  similarTiles?: SimilarTilesMap;
}

export interface FindBestMatchResult {
  // REFACT: back to `IBounds`? useless x & y?
  area: Rect;
  firstAt: Point2D;
  secondAt: Point2D;
  similarity: RectSimilarityResult;
}

export const findBestMatch = ({
  first,
  second,
  firstMask,
  secondMask,
  similarTiles,
}: FindBestMatchOptions): FindBestMatchResult => {
  let { width: aWidth, height: aHeight } = first;
  let { width: bWidth, height: bHeight } = second;
  let ax0 = 0;
  let ay0 = 0;
  let bx0 = 0;
  let by0 = 0;
  if (firstMask) {
    let right: number;
    let bottom: number;
    ({ left: ax0, top: ay0, right, bottom } = firstMask.padding);
    aWidth = right - ax0 + 1;
    aHeight = bottom - ay0 + 1;
  }
  if (secondMask) {
    let right: number;
    let bottom: number;
    ({ left: bx0, top: by0, right, bottom } = secondMask.padding);
    bWidth = right - bx0 + 1;
    bHeight = bottom - by0 + 1;
  }

  const width = Math.min(aWidth, bWidth);
  const height = Math.min(aHeight, bHeight);
  const area: IBounds = { width, height };

  let bestAAt: Point2D;
  let bestBAt: Point2D;
  let best: RectSimilarityResult | undefined;
  const needContinue = (next: RectSimilarityResult) =>
    !best || cmpMatch(next, best) <= 0;

  // both X and Y directions by the same logic independently, covering all
  // possible cases:
  //
  // -----------     -----------     -----------
  // =======           =======           =======
  //
  // -------           -------           -------
  // ===========     ===========     ===========
  //
  // moving the short one across the long one

  // length to move the moving (short) one
  const lX = Math.abs(aWidth - bWidth);
  const lY = Math.abs(aHeight - bHeight);
  // if first one is long, that is static
  const longXA = aWidth >= bWidth;
  const longYA = aHeight >= bHeight;
  // number of overlapping tiles
  const maxCount = width * height;
  SEARCH: for (let dy = 0; dy <= lY; dy++) {
    // an Y coords to start cmp from
    let ay = ay0;
    let by = by0;
    if (longYA) {
      ay += dy;
    } else {
      by += dy;
    }

    for (let dx = 0; dx <= lX; dx++) {
      // an X coords to start cmp from
      let ax = ax0;
      let bx = bx0;
      if (longXA) {
        ax += dx;
      } else {
        bx += dx;
      }

      const aAt: Point2D = { x: ax, y: ay };
      const bAt: Point2D = { x: bx, y: by };
      const next = rectSimilarity({
        first,
        second,
        firstRegion: { ...area, ...aAt },
        secondStart: bAt,
        similarTiles,
        needContinue,
      });
      // no previous or next is better
      if (!best || cmpMatch(next, best) < 0) {
        bestAAt = aAt;
        bestBAt = bAt;
        best = next;
      }
      // all tiles are the same - done
      if (next.sameCount === maxCount) {
        break SEARCH;
      }
    }
  }

  // there was at least one iteration, so all are surely assigned

  return {
    area: { ...bestAAt!, ...area },
    firstAt: bestAAt!,
    secondAt: bestBAt!,
    similarity: best!,
  };
};

// like sort cmp function, the "lesser" item (return <0) will first,
// which is better item
const cmpMatch = (a: RectSimilarityResult, b: RectSimilarityResult): number =>
  a.differentCount - b.differentCount || a.similarCount - b.similarCount;
