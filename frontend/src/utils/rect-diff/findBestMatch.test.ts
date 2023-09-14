import { findBestMatch, FindBestMatchResult } from "./findBestMatch";
import { mkData } from "./helpers.dev/mkData";
import { CalcMaskResult } from "./calcMask";
import { FANCY } from "./helpers.dev/defs";

it("general case", () => {
  const first = mkData(
    //
    "###########",
    "###########",
    "###.o#.o###",
    "###c #c ###",
    "###01##2###",
    "###########",
    "###.o######",
    "###d #.o###",
    "###########",
    "###########",
    "###########",
  );
  const firstMask: CalcMaskResult = {
    padding: {
      left: 2,
      top: 1,
      right: 9,
      bottom: 10,
    },
  };

  const second = mkData(
    //
    "####",
    "#.o#",
    "#c #",
    "####",
  );
  const secondMask: CalcMaskResult = {
    padding: {
      left: 0,
      top: 0,
      right: 3,
      bottom: 3,
    },
  };

  const match = findBestMatch({
    first,
    firstMask,
    second,
    secondMask,
    similarTiles: FANCY,
  });

  expect(match).toEqual<FindBestMatchResult>({
    area: { x: 5, y: 1, width: 4, height: 4 },
    firstAt: { x: 5, y: 1 },
    secondAt: { x: 0, y: 0 },
    similarity: {
      sameCount: 15,
      similarCount: 1,
      differentCount: 0,
    },
  });
});

it("simple case", () => {
  const first = mkData(
    //
    "#####",
    "#M..#",
    "#.&E#",
    "#####",
  );
  const second = mkData(
    //
    "#####",
    "#Mo.#",
    "#%&E0",
    "###21",
  );
  const match = findBestMatch({
    first,
    second,
    similarTiles: FANCY,
  });
  expect(match).toEqual<FindBestMatchResult>({
    area: { x: 0, y: 0, width: 5, height: 4 },
    firstAt: { x: 0, y: 0 },
    secondAt: { x: 0, y: 0 },
    similarity: {
      sameCount: 15,
      similarCount: 3,
      differentCount: 2,
    },
  });
});
