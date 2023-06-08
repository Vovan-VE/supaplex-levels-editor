import { clipRect } from "./clipRect";
import { IBounds, Rect } from "./types";

it("clipRect", () => {
  const b: IBounds = { width: 10, height: 10 };

  //     ==========
  //       ---
  expect(clipRect({ x: 1, y: 2, width: 3, height: 4 }, b)).toEqual<Rect>({
    x: 1,
    y: 2,
    width: 3,
    height: 4,
  });

  //     ==========
  //       --------------
  expect(clipRect({ x: 1, y: 2, width: 13, height: 14 }, b)).toEqual<Rect>({
    x: 1,
    y: 2,
    width: 9,
    height: 8,
  });

  //     ==========
  //                 --------------
  expect(clipRect({ x: 11, y: 12, width: 3, height: 4 }, b)).toEqual<Rect>({
    x: 10,
    y: 10,
    width: 0,
    height: 0,
  });

  //     ==========
  //    ---
  expect(clipRect({ x: -1, y: -2, width: 3, height: 4 }, b)).toEqual<Rect>({
    x: 0,
    y: 0,
    width: 2,
    height: 2,
  });

  //     ==========
  // ---
  expect(clipRect({ x: -11, y: -12, width: 3, height: 4 }, b)).toEqual<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  //     ==========
  //   --------------
  expect(clipRect({ x: -1, y: -2, width: 13, height: 14 }, b)).toEqual<Rect>({
    x: 0,
    y: 0,
    width: 10,
    height: 10,
  });
});
