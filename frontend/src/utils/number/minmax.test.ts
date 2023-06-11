import { minmax } from "./minmax";

it("minmax", () => {
  expect(minmax(-42, 1, 10)).toBe(1);
  expect(minmax(1, 1, 10)).toBe(1);
  expect(minmax(5, 1, 10)).toBe(5);
  expect(minmax(10, 1, 10)).toBe(10);
  expect(minmax(42, 1, 10)).toBe(10);
});
