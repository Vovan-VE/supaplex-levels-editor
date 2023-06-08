import { moveAfter } from "./moveAfter";

const input: ReadonlyMap<string, number> = new Map([
  ["a", 10],
  ["b", 20],
  ["c", 30],
  ["d", 40],
  ["e", 50],
]);
const backup = new Map(input);

afterAll(() => {
  expect(input).toEqual(backup);
});

it("useless input", () => {
  expect(moveAfter(input, "x", "b")).toBe(input);
  expect(moveAfter(input, "b", "x")).toBe(input);
  expect(moveAfter(input, "b", "b")).toBe(input);
});

describe("forward", () => {
  it("from start", () => {
    expect(moveAfter(input, "a", "c")).toEqual(
      new Map([
        ["b", 20],
        ["c", 30],
        ["a", 10],
        ["d", 40],
        ["e", 50],
      ]),
    );
  });

  it("from mid", () => {
    expect(moveAfter(input, "b", "d")).toEqual(
      new Map([
        ["a", 10],
        ["c", 30],
        ["d", 40],
        ["b", 20],
        ["e", 50],
      ]),
    );
  });

  it("from prev", () => {
    expect(moveAfter(input, "b", "c")).toEqual(
      new Map([
        ["a", 10],
        ["c", 30],
        ["b", 20],
        ["d", 40],
        ["e", 50],
      ]),
    );
  });

  it("to end", () => {
    expect(moveAfter(input, "b", "e")).toEqual(
      new Map([
        ["a", 10],
        ["c", 30],
        ["d", 40],
        ["e", 50],
        ["b", 20],
      ]),
    );
  });
});

describe("backward", () => {
  it("from end", () => {
    expect(moveAfter(input, "e", "b")).toEqual(
      new Map([
        ["a", 10],
        ["b", 20],
        ["e", 50],
        ["c", 30],
        ["d", 40],
      ]),
    );
  });

  it("from mid", () => {
    expect(moveAfter(input, "d", "a")).toEqual(
      new Map([
        ["a", 10],
        ["d", 40],
        ["b", 20],
        ["c", 30],
        ["e", 50],
      ]),
    );
  });

  it("from next", () => {
    expect(moveAfter(input, "b", "a")).toBe(input);
    expect(moveAfter(input, "c", "b")).toBe(input);
    expect(moveAfter(input, "d", "c")).toBe(input);
    expect(moveAfter(input, "e", "d")).toBe(input);
  });
});
