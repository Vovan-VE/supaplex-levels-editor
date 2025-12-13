import { calcMask } from "./calcMask";
import { IDataRect } from "./dataRect";
import { findBestMatch, FindBestMatchResult } from "./findBestMatch";
import { SimilarTilesMap } from "./rectSimilarity";

export interface RectDiffOptions {
  first: IDataRect;
  second: IDataRect;
  similarTiles?: SimilarTilesMap;
  borderTiles?: ReadonlySet<number>;
}

export const rectDiff = ({
  first,
  second,
  similarTiles,
  borderTiles,
}: RectDiffOptions): FindBestMatchResult =>
  findBestMatch({
    first,
    second,
    firstMask: borderTiles && calcMask(first, borderTiles, similarTiles),
    secondMask: borderTiles && calcMask(second, borderTiles, similarTiles),
    similarTiles,
  });
