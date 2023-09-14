import { IDataRect } from "./dataRect";
import { SimilarTilesMap } from "./rectSimilarity";

// export const enum MASK {
//   UNSET = 0,
//   TRANSPARENT,
//   OPAQUE,
// }

export interface CalcMaskPadding {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface CalcMaskResult {
  padding: CalcMaskPadding;
  // mask: IDataRect;
}

export const calcMask = (
  canonical: IDataRect,
  borderTiles: ReadonlySet<number>,
  similarTiles?: SimilarTilesMap,
): CalcMaskResult => {
  const { width, height } = canonical;
  // // by default the mask is filled with zeros, shich is `MASK.UNSET`
  // const mask = new DataRect(width, height);

  // first check if sides are wide filled by borders
  let [left, top, right, bottom] = [0, 0, width - 1, height - 1];
  {
    const isValid = () => left < right && top < bottom;

    interface Side {
      lStart: () => number;
      lEnd: () => number;
      oCur: () => number;
      oDelta: number;
      coords: (l: number, o: number) => [x: number, y: number];
      shift: () => void;
    }

    const sides: Side[] = [
      // left
      {
        lStart: () => top,
        lEnd: () => bottom,
        oCur: () => left,
        oDelta: 1,
        coords: (l, o) => [o, l],
        shift: () => left++,
      },
      // right
      {
        lStart: () => top,
        lEnd: () => bottom,
        oCur: () => right,
        oDelta: -1,
        coords: (l, o) => [o, l],
        shift: () => right--,
      },
      // top
      {
        lStart: () => left,
        lEnd: () => right,
        oCur: () => top,
        oDelta: 1,
        coords: (l, o) => [l, o],
        shift: () => top++,
      },
      // bottom
      {
        lStart: () => left,
        lEnd: () => right,
        oCur: () => bottom,
        oDelta: -1,
        coords: (l, o) => [l, o],
        shift: () => bottom--,
      },
    ];

    function isBorderTile(x: number, y: number): boolean {
      let tile = canonical.getTile(x, y);
      if (similarTiles) {
        const same = similarTiles.get(tile);
        if (same !== undefined) {
          tile = same;
        }
      }
      return borderTiles.has(tile);
    }
    function trimEdge({ lStart, lEnd, oCur, oDelta, coords }: Side): boolean {
      const _lStart = lStart();
      const _lEnd = lEnd();
      const _oCur = oCur();
      for (let l = _lStart; l <= _lEnd; l++) {
        let [x, y] = coords(l, _oCur);
        if (!isBorderTile(x, y)) {
          return false;
        }
        [x, y] = coords(l, _oCur + oDelta);
        if (!isBorderTile(x, y)) {
          return false;
        }
      }
      // for (let l = _lStart; l <= _lEnd; l++) {
      //   const [x, y] = coords(l, _oCur);
      //   mask.setTile(x, y, MASK.TRANSPARENT);
      // }
      return true;
    }

    for (const side of sides) {
      while (isValid() && trimEdge(side)) {
        side.shift();
      }
    }

    // for (let y = top; y <= bottom; y++) {
    //   for (let x = left; x <= right; x++) {
    //     mask.setTile(x, y, MASK.OPAQUE);
    //   }
    // }
  }

  // more complicated non-rectangular mask can be calculated, but not right now
  // ... mask.setTile(x, y, MASK._...);

  return {
    padding: {
      left,
      top,
      right,
      bottom,
    },
    // mask,
  } as const;
};
