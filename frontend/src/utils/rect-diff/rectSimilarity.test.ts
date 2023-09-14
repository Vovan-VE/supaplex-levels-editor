import { rectSimilarity, RectSimilarityResult } from "./rectSimilarity";
import { mkData } from "./helpers.dev/mkData";
import { FANCY } from "./helpers.dev/defs";

describe("same size", () => {
  const a = mkData(
    //
    "### o",
    "##  o",
    "# ..o",
    "oooo#",
  );
  const { width, height } = a;

  it("same", () => {
    const b = mkData(
      //
      "### o",
      "##  o",
      "# ..o",
      "oooo#",
    );

    const r = rectSimilarity({
      first: a,
      second: b,
      firstRegion: { x: 0, y: 0, width, height },
      secondStart: { x: 0, y: 0 },
      similarTiles: FANCY,
    });

    expect(r).toEqual<RectSimilarityResult>({
      sameCount: width * height,
      similarCount: 0,
      differentCount: 0,
    });
  });

  it("some similar", () => {
    const b = mkData(
      //
      "##0 o",
      "#1  o",
      "2 ,.o",
      "oooo#",
    );

    const r = rectSimilarity({
      first: a,
      second: b,
      firstRegion: { x: 0, y: 0, width, height },
      secondStart: { x: 0, y: 0 },
      similarTiles: FANCY,
    });

    expect(r).toEqual<RectSimilarityResult>({
      sameCount: width * height - 4,
      similarCount: 4,
      differentCount: 0,
    });
  });

  it("some different", () => {
    const b = mkData(
      //
      "### x",
      "#z xo",
      "# .yo",
      "oioo#",
    );

    const r = rectSimilarity({
      first: a,
      second: b,
      firstRegion: { x: 0, y: 0, width, height },
      secondStart: { x: 0, y: 0 },
      similarTiles: FANCY,
    });

    expect(r).toEqual<RectSimilarityResult>({
      sameCount: width * height - 5,
      similarCount: 0,
      differentCount: 5,
    });
  });

  it("all diff", () => {
    const b = mkData(
      //
      "lorem",
      "ipsum",
      "dolor",
      "sit .",
    );

    const r = rectSimilarity({
      first: a,
      second: b,
      firstRegion: { x: 0, y: 0, width, height },
      secondStart: { x: 0, y: 0 },
      similarTiles: FANCY,
    });

    expect(r).toEqual<RectSimilarityResult>({
      sameCount: 0,
      similarCount: 0,
      differentCount: width * height,
    });
  });

  it("mess", () => {
    const b = mkData(
      //
      "-#- -",
      "----o",
      "-----",
      "o-o-#",
    );

    const r = rectSimilarity({
      first: a,
      second: b,
      firstRegion: { x: 0, y: 0, width, height },
      secondStart: { x: 0, y: 0 },
      similarTiles: FANCY,
    });

    expect(r).toEqual<RectSimilarityResult>({
      sameCount: 6,
      similarCount: 0,
      differentCount: width * height - 6,
    });
  });
});

describe("diff size", () => {
  const a = mkData(
    //
    "### o..",
    "##  o..",
    "# ..o..",
    "oooo#..",
    "#.  oo#",
  );

  describe("smaller", () => {
    const b = mkData(
      //
      "### o",
      "##  o",
      "# ..o",
      "oooo#",
    );
    const { width, height } = b;

    it("same left top", () => {
      const r = rectSimilarity({
        first: a,
        second: b,
        firstRegion: { x: 0, y: 0, width, height },
        secondStart: { x: 0, y: 0 },
        similarTiles: FANCY,
      });

      expect(r).toEqual<RectSimilarityResult>({
        sameCount: width * height,
        similarCount: 0,
        differentCount: 0,
      });
    });

    it("mid top", () => {
      const r = rectSimilarity({
        first: a,
        second: b,
        firstRegion: { x: 1, y: 0, width, height },
        secondStart: { x: 0, y: 0 },
        similarTiles: FANCY,
      });

      expect(r).toEqual<RectSimilarityResult>({
        sameCount: 8,
        similarCount: 0,
        differentCount: width * height - 8,
      });
    });

    it("right top", () => {
      const r = rectSimilarity({
        first: a,
        second: b,
        firstRegion: { x: 2, y: 0, width, height },
        secondStart: { x: 0, y: 0 },
        similarTiles: FANCY,
      });

      expect(r).toEqual<RectSimilarityResult>({
        sameCount: 4,
        similarCount: 0,
        differentCount: width * height - 4,
      });
    });

    it("left bottom", () => {
      const r = rectSimilarity({
        first: a,
        second: b,
        firstRegion: { x: 0, y: 1, width, height },
        secondStart: { x: 0, y: 0 },
        similarTiles: FANCY,
      });

      expect(r).toEqual<RectSimilarityResult>({
        sameCount: 6,
        similarCount: 0,
        differentCount: width * height - 6,
      });
    });

    it("right bottom", () => {
      const r = rectSimilarity({
        first: a,
        second: b,
        firstRegion: { x: 2, y: 1, width, height },
        secondStart: { x: 0, y: 0 },
        similarTiles: FANCY,
      });

      expect(r).toEqual<RectSimilarityResult>({
        sameCount: 4,
        similarCount: 0,
        differentCount: width * height - 4,
      });
    });
  });

  describe("wide low", () => {
    const b = mkData(
      //
      "### o..ox",
      "##  o..xy",
      "# ..o..#x",
      "oooo#..yo",
    );
    const { width } = a;
    const { height } = b;

    it("mid bottom", () => {
      const r = rectSimilarity({
        first: a,
        second: b,
        firstRegion: { x: 0, y: 1, width, height },
        secondStart: { x: 1, y: 0 },
        similarTiles: FANCY,
      });

      expect(r).toEqual<RectSimilarityResult>({
        sameCount: 9,
        similarCount: 0,
        differentCount: width * height - 9,
      });
    });
  });

  describe("thin high", () => {
    const b = mkData(
      //
      "..xo#",
      "### o",
      "##  o",
      "# ..o",
      "oooo#",
      "#.  o",
      "#.o..",
    );
    const { width } = b;
    const { height } = a;

    it("mid mid", () => {
      const r = rectSimilarity({
        first: a,
        second: b,
        firstRegion: { x: 1, y: 0, width, height },
        secondStart: { x: 0, y: 1 },
        similarTiles: FANCY,
      });

      expect(r).toEqual<RectSimilarityResult>({
        sameCount: 10,
        similarCount: 0,
        differentCount: width * height - 10,
      });
    });
  });
});

it("mess", () => {
  const a = mkData(
    //
    "       ",
    "  ### o",
    "  ##  o",
    "  # ..o",
    "  oooo#",
  );
  const b = mkData(
    //
    "##0 o   ",
    "#1  y   ",
    "2z,.o   ",
    "ooox#   ",
    "        ",
    "        ",
  );

  const width = 5;
  const height = 4;

  const r = rectSimilarity({
    first: a,
    second: b,
    firstRegion: { x: 2, y: 1, width, height },
    secondStart: { x: 0, y: 0 },
    similarTiles: FANCY,
  });

  expect(r).toEqual<RectSimilarityResult>({
    sameCount: width * height - 4 - 3,
    similarCount: 4,
    differentCount: 3,
  });
});
