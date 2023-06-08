import { inRect } from "./inRect";
import { Rect } from "./types";

it("inRect", () => {
  const rect: Rect = { x: 3, y: 10, width: 4, height: 7 };

  expect(inRect(1, 1, rect)).toBeFalsy();
  expect(inRect(3, 1, rect)).toBeFalsy();
  expect(inRect(6, 1, rect)).toBeFalsy();
  expect(inRect(7, 1, rect)).toBeFalsy();
  expect(inRect(8, 1, rect)).toBeFalsy();
  expect(inRect(1, 10, rect)).toBeFalsy();
  expect(inRect(3, 10, rect)).toBeTruthy();
  expect(inRect(6, 10, rect)).toBeTruthy();
  expect(inRect(7, 10, rect)).toBeFalsy();
  expect(inRect(8, 10, rect)).toBeFalsy();
  expect(inRect(1, 16, rect)).toBeFalsy();
  expect(inRect(3, 16, rect)).toBeTruthy();
  expect(inRect(6, 16, rect)).toBeTruthy();
  expect(inRect(7, 16, rect)).toBeFalsy();
  expect(inRect(8, 16, rect)).toBeFalsy();
  expect(inRect(1, 17, rect)).toBeFalsy();
  expect(inRect(3, 17, rect)).toBeFalsy();
  expect(inRect(6, 17, rect)).toBeFalsy();
  expect(inRect(7, 17, rect)).toBeFalsy();
  expect(inRect(8, 17, rect)).toBeFalsy();
  expect(inRect(1, 18, rect)).toBeFalsy();
  expect(inRect(3, 18, rect)).toBeFalsy();
  expect(inRect(6, 18, rect)).toBeFalsy();
  expect(inRect(7, 18, rect)).toBeFalsy();
  expect(inRect(8, 18, rect)).toBeFalsy();
});
