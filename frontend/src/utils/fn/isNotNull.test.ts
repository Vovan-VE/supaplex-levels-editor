import { isNotNull } from "./isNotNull";

it("isNotNull", () => {
  expect(isNotNull(0)).toBe(true);
  expect(isNotNull("")).toBe(true);
  expect(isNotNull({})).toBe(true);
  expect(isNotNull(true)).toBe(true);
  expect(isNotNull(false)).toBe(true);

  expect(isNotNull(null)).toBe(false);
  expect(isNotNull(undefined)).toBe(false);
});
