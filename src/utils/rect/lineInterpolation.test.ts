import { lineInterpolation } from "./lineInterpolation";

it("point", () => {
  expect(lineInterpolation({ x: 3, y: 4 }, { x: 3, y: 4 })).toEqual([
    { x: 3, y: 4 },
  ]);
});

it("horizontal+", () => {
  expect(lineInterpolation({ x: 3, y: 4 }, { x: 5, y: 4 })).toEqual([
    { x: 3, y: 4 },
    { x: 4, y: 4 },
    { x: 5, y: 4 },
  ]);
});
it("horizontal-", () => {
  expect(lineInterpolation({ x: 5, y: 4 }, { x: 3, y: 4 })).toEqual([
    { x: 3, y: 4 },
    { x: 4, y: 4 },
    { x: 5, y: 4 },
  ]);
});

it("vertical+", () => {
  expect(lineInterpolation({ x: 3, y: 4 }, { x: 3, y: 6 })).toEqual([
    { x: 3, y: 4 },
    { x: 3, y: 5 },
    { x: 3, y: 6 },
  ]);
});
it("vertical-", () => {
  expect(lineInterpolation({ x: 3, y: 6 }, { x: 3, y: 4 })).toEqual([
    { x: 3, y: 4 },
    { x: 3, y: 5 },
    { x: 3, y: 6 },
  ]);
});

describe("45 deg", () => {
  it("x+ y+", () => {
    expect(lineInterpolation({ x: 3, y: 4 }, { x: 5, y: 6 })).toEqual([
      { x: 3, y: 4 },
      { x: 4, y: 5 },
      { x: 5, y: 6 },
    ]);
  });
  it("x+ y-", () => {
    expect(lineInterpolation({ x: 3, y: 6 }, { x: 5, y: 4 })).toEqual([
      { x: 3, y: 6 },
      { x: 4, y: 5 },
      { x: 5, y: 4 },
    ]);
  });
  it("x- y+", () => {
    expect(lineInterpolation({ x: 5, y: 4 }, { x: 3, y: 6 })).toEqual([
      { x: 5, y: 4 },
      { x: 4, y: 5 },
      { x: 3, y: 6 },
    ]);
  });
  it("x- y-", () => {
    expect(lineInterpolation({ x: 5, y: 6 }, { x: 3, y: 4 })).toEqual([
      { x: 5, y: 6 },
      { x: 4, y: 5 },
      { x: 3, y: 4 },
    ]);
  });
});

describe("others", () => {
  it("->5 v2", () => {
    expect(lineInterpolation({ x: 3, y: 4 }, { x: 7, y: 5 })).toEqual([
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 7, y: 5 },
    ]);
    expect(lineInterpolation({ x: 2, y: 3 }, { x: 6, y: 4 })).toEqual([
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
    ]);
  });
  it("->7 v5", () => {
    expect(lineInterpolation({ x: 3, y: 4 }, { x: 9, y: 8 })).toEqual([
      { x: 3, y: 4 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
      { x: 6, y: 6 },
      { x: 7, y: 7 },
      { x: 8, y: 7 },
      { x: 9, y: 8 },
    ]);
  });
  it("->2 v5", () => {
    expect(lineInterpolation({ x: 3, y: 4 }, { x: 4, y: 8 })).toEqual([
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 6 },
      { x: 4, y: 7 },
      { x: 4, y: 8 },
    ]);
  });
  it("<-2 v5", () => {
    expect(lineInterpolation({ x: 3, y: 4 }, { x: 2, y: 8 })).toEqual([
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 2, y: 6 },
      { x: 2, y: 7 },
      { x: 2, y: 8 },
    ]);
  });
  it("<-5 v2", () => {
    expect(lineInterpolation({ x: 7, y: 4 }, { x: 3, y: 5 })).toEqual([
      { x: 7, y: 4 },
      { x: 6, y: 4 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ]);
  });
  it("<-5 ^2", () => {
    expect(lineInterpolation({ x: 7, y: 5 }, { x: 3, y: 4 })).toEqual([
      { x: 7, y: 5 },
      { x: 6, y: 5 },
      { x: 5, y: 4 },
      { x: 4, y: 4 },
      { x: 3, y: 4 },
    ]);
  });
  it("<-2 ^5", () => {
    expect(lineInterpolation({ x: 4, y: 8 }, { x: 3, y: 4 })).toEqual([
      { x: 4, y: 8 },
      { x: 4, y: 7 },
      { x: 3, y: 6 },
      { x: 3, y: 5 },
      { x: 3, y: 4 },
    ]);
  });
  it("->2 ^5", () => {
    expect(lineInterpolation({ x: 3, y: 8 }, { x: 4, y: 4 })).toEqual([
      { x: 3, y: 8 },
      { x: 3, y: 7 },
      { x: 4, y: 6 },
      { x: 4, y: 5 },
      { x: 4, y: 4 },
    ]);
  });
  it("->5 ^2", () => {
    expect(lineInterpolation({ x: 3, y: 5 }, { x: 7, y: 4 })).toEqual([
      { x: 3, y: 5 },
      { x: 4, y: 5 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
      { x: 7, y: 4 },
    ]);
  });
});
