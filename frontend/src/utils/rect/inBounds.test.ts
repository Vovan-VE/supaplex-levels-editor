import { inBounds } from "./inBounds";
import { IBounds } from "./types";

it("inBounds", () => {
  const b: IBounds = { width: 10, height: 5 };

  expect(inBounds(-2, -1, b)).toBeFalsy();
  expect(inBounds(0, -1, b)).toBeFalsy();
  expect(inBounds(2, -1, b)).toBeFalsy();
  expect(inBounds(9, -1, b)).toBeFalsy();
  expect(inBounds(10, -1, b)).toBeFalsy();
  expect(inBounds(11, -1, b)).toBeFalsy();

  expect(inBounds(-2, 0, b)).toBeFalsy();
  expect(inBounds(0, 0, b)).toBeTruthy();
  expect(inBounds(2, 0, b)).toBeTruthy();
  expect(inBounds(9, 0, b)).toBeTruthy();
  expect(inBounds(10, 0, b)).toBeFalsy();
  expect(inBounds(11, 0, b)).toBeFalsy();

  expect(inBounds(-2, 1, b)).toBeFalsy();
  expect(inBounds(0, 1, b)).toBeTruthy();
  expect(inBounds(2, 1, b)).toBeTruthy();
  expect(inBounds(9, 1, b)).toBeTruthy();
  expect(inBounds(10, 1, b)).toBeFalsy();
  expect(inBounds(11, 1, b)).toBeFalsy();

  expect(inBounds(-2, 4, b)).toBeFalsy();
  expect(inBounds(0, 4, b)).toBeTruthy();
  expect(inBounds(2, 4, b)).toBeTruthy();
  expect(inBounds(9, 4, b)).toBeTruthy();
  expect(inBounds(10, 4, b)).toBeFalsy();
  expect(inBounds(11, 4, b)).toBeFalsy();

  expect(inBounds(-2, 5, b)).toBeFalsy();
  expect(inBounds(0, 5, b)).toBeFalsy();
  expect(inBounds(2, 5, b)).toBeFalsy();
  expect(inBounds(9, 5, b)).toBeFalsy();
  expect(inBounds(10, 5, b)).toBeFalsy();
  expect(inBounds(11, 5, b)).toBeFalsy();

  expect(inBounds(-2, 7, b)).toBeFalsy();
  expect(inBounds(0, 7, b)).toBeFalsy();
  expect(inBounds(2, 7, b)).toBeFalsy();
  expect(inBounds(9, 7, b)).toBeFalsy();
  expect(inBounds(10, 7, b)).toBeFalsy();
  expect(inBounds(11, 7, b)).toBeFalsy();
});
