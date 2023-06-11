import { isOffsetInRange } from "./isOffsetInRange";

it("isOffsetInRange", () => {
  expect(isOffsetInRange(1, 5, 3)).toBeFalsy();
  expect(isOffsetInRange(4, 5, 3)).toBeFalsy();
  expect(isOffsetInRange(5, 5, 3)).toBeTruthy();
  expect(isOffsetInRange(6, 5, 3)).toBeTruthy();
  expect(isOffsetInRange(7, 5, 3)).toBeTruthy();
  expect(isOffsetInRange(8, 5, 3)).toBeFalsy();
  expect(isOffsetInRange(9, 5, 3)).toBeFalsy();
});
