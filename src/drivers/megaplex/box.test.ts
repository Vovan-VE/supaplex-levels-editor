import { AnyBox } from "./box";

it("box", () => {
  const box = new AnyBox(5, 3);

  expect(box.width).toBe(5);
  expect(box.height).toBe(3);
  expect(box.length).toBe(15);
  expect(box.coordsToOffset(0, 0)).toBe(0);
  expect(box.coordsToOffset(4, 0)).toBe(4);
  expect(box.coordsToOffset(0, 2)).toBe(10);
  expect(box.coordsToOffset(4, 2)).toBe(14);

  expect(() => box.validateCoords?.(0, 0)).not.toThrow();
  expect(() => box.validateCoords?.(4, 0)).not.toThrow();
  expect(() => box.validateCoords?.(0, 2)).not.toThrow();
  expect(() => box.validateCoords?.(4, 2)).not.toThrow();

  const e = /^Cell coords \(-?\d+, -?\d+\) are out of range$/;
  expect(() => box.validateCoords?.(-1, 0)).toThrow(e);
  expect(() => box.validateCoords?.(5, 0)).toThrow(e);
  expect(() => box.validateCoords?.(0, -1)).toThrow(e);
  expect(() => box.validateCoords?.(0, 3)).toThrow(e);
});
