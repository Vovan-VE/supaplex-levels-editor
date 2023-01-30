import { isEmptyObject } from "./isEmptyObject";

it("isEmptyObject", () => {
  expect(isEmptyObject({})).toBe(true);

  expect(isEmptyObject({ x: 42 })).toBe(false);
  expect(isEmptyObject({ x: 0, y: false })).toBe(false);
});
