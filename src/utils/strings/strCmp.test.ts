import { strCmp } from "./strCmp";

it("strCmp", () => {
  expect(strCmp("", "")).toBe(0);
  expect(strCmp("", "a")).toBe(-1);
  expect(strCmp("a", "")).toBe(1);
  expect(strCmp("a", "b")).toBe(-1);
  expect(strCmp("b", "a")).toBe(1);
  expect(strCmp("aa", "aa")).toBe(0);
  expect(strCmp("ab", "aa")).toBe(1);
  expect(strCmp("aa", "ab")).toBe(-1);
});
