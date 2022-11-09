import { clipRect } from "./clipRect";
import { IBounds } from "./types";

it("clipRect", () => {
  const b: IBounds = { width: 10, height: 10 };

  //     ==========
  //       ---
  expect(clipRect([1, 2, 3, 4], b)).toEqual([1, 2, 3, 4]);

  //     ==========
  //       --------------
  expect(clipRect([1, 2, 13, 14], b)).toEqual([1, 2, 9, 8]);

  //     ==========
  //                 --------------
  expect(clipRect([11, 12, 3, 4], b)).toEqual([10, 10, 0, 0]);

  //     ==========
  //    ---
  expect(clipRect([-1, -2, 3, 4], b)).toEqual([0, 0, 2, 2]);

  //     ==========
  // ---
  expect(clipRect([-11, -12, 3, 4], b)).toEqual([0, 0, 0, 0]);

  //     ==========
  //   --------------
  expect(clipRect([-1, -2, 13, 14], b)).toEqual([0, 0, 10, 10]);
});
