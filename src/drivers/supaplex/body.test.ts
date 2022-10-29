import { BODY_LENGTH, supaplexBox } from "./box";
import { LevelBody } from "./body";
import { TILE_EXIT, TILE_HARDWARE, TILE_MURPHY, TILE_SPACE } from "./tiles-id";
import { AnyBox } from "../megaplex/box";

describe("LevelBody", () => {
  const data = new Uint8Array(BODY_LENGTH);
  for (let i = 65; i-- > 0; ) {
    data[i] = i;
  }

  describe("constructor", () => {
    it("no data", () => {
      const body = new LevelBody(supaplexBox);
      expect(body.length).toEqual(BODY_LENGTH);
      expect(body.raw).toEqual(new Uint8Array(BODY_LENGTH));
    });

    it("data", () => {
      const body = new LevelBody(supaplexBox, data);
      expect(body.length).toEqual(BODY_LENGTH);
      expect(body.raw).toEqual(data);
    });

    it("throw", () => {
      expect(() => new LevelBody(supaplexBox, new Uint8Array(100))).toThrow(
        new Error(`Invalid buffer length 100, expected ${BODY_LENGTH}`),
      );
    });
  });

  it("getTile", () => {
    const body = new LevelBody(supaplexBox, data);

    expect(body.getTile(0, 0)).toBe(0);
    expect(body.getTile(1, 0)).toBe(1);
    expect(body.getTile(2, 0)).toBe(2);
    expect(body.getTile(58, 0)).toBe(58);
    expect(body.getTile(59, 0)).toBe(59);
    expect(body.getTile(0, 1)).toBe(60);
    expect(body.getTile(1, 1)).toBe(61);
    expect(body.getTile(2, 1)).toBe(62);
    expect(body.getTile(3, 1)).toBe(63);
    expect(body.getTile(4, 1)).toBe(64);
    expect(body.getTile(5, 1)).toBe(0);
    expect(body.getTile(6, 1)).toBe(0);

    const e = /^Cell coords \(-?\d+, -?\d+\) are out of range$/;
    expect(() => body.getTile(-2, 0)).toThrow(e);
    expect(() => body.getTile(-1, 0)).toThrow(e);
    expect(() => body.getTile(60, 0)).toThrow(e);
    expect(() => body.getTile(61, 0)).toThrow(e);
    expect(() => body.getTile(0, -2)).toThrow(e);
    expect(() => body.getTile(0, -1)).toThrow(e);
    expect(() => body.getTile(0, 24)).toThrow(e);
    expect(() => body.getTile(0, 25)).toThrow(e);
  });

  it("setTile", () => {
    const body = new LevelBody(supaplexBox, data);

    expect(body.setTile(2, 1, 62)).toBe(body);

    const body1 = body.setTile(2, 1, 95);
    expect(body1.getTile(2, 1)).toBe(95);
    expect(body.getTile(2, 1)).toBe(62);
    const offset = supaplexBox.coordsToOffset(2, 1);
    expect(body1.raw[offset]).toBe(95);
    expect(body.raw[offset]).toBe(62);
    expect(data[offset]).toBe(62);

    const e1 = /^Cell coords \(-?\d+, -?\d+\) are out of range$/;
    expect(() => body.setTile(-2, 0, 0)).toThrow(e1);
    expect(() => body.setTile(-1, 0, 0)).toThrow(e1);
    expect(() => body.setTile(60, 0, 0)).toThrow(e1);
    expect(() => body.setTile(61, 0, 0)).toThrow(e1);
    expect(() => body.setTile(0, -2, 0)).toThrow(e1);
    expect(() => body.setTile(0, -1, 0)).toThrow(e1);
    expect(() => body.setTile(0, 24, 0)).toThrow(e1);
    expect(() => body.setTile(0, 25, 0)).toThrow(e1);

    const e2 = /^Invalid byte -?\d+$/;
    expect(() => body.setTile(0, 0, -2)).toThrow(e2);
    expect(() => body.setTile(0, 0, -1)).toThrow(e2);
    expect(() => body.setTile(0, 0, 256)).toThrow(e2);
    expect(() => body.setTile(0, 0, 257)).toThrow(e2);
  });

  describe("tilesRenderStream", () => {
    it("empty", () => {
      const data = Uint8Array.of(
        TILE_HARDWARE,
        TILE_HARDWARE,
        TILE_HARDWARE,
        TILE_HARDWARE,
        TILE_HARDWARE,
        TILE_HARDWARE,
        TILE_MURPHY,
        TILE_SPACE,
        TILE_EXIT,
        TILE_HARDWARE,
        TILE_HARDWARE,
        TILE_HARDWARE,
        TILE_HARDWARE,
        TILE_HARDWARE,
        TILE_HARDWARE,
      );
      const body = new LevelBody(new AnyBox(5, 3), data);
      const full = [
        [0, 0, 5, TILE_HARDWARE],
        [0, 1, 1, TILE_HARDWARE],
        [1, 1, 1, TILE_MURPHY],
        [2, 1, 1, TILE_SPACE],
        [3, 1, 1, TILE_EXIT],
        [4, 1, 1, TILE_HARDWARE],
        [0, 2, 5, TILE_HARDWARE],
      ];
      expect([...body.tilesRenderStream(0, 0, 5, 3, 5, 3)]).toEqual(full);
      expect([...body.tilesRenderStream(-2, -3, 42, 37, 5, 3)]).toEqual(full);

      expect([...body.tilesRenderStream(1, -1, 3, 10, 5, 3)]).toEqual([
        [1, 0, 3, TILE_HARDWARE],
        [1, 1, 1, TILE_MURPHY],
        [2, 1, 1, TILE_SPACE],
        [3, 1, 1, TILE_EXIT],
        [1, 2, 3, TILE_HARDWARE],
      ]);
    });
  });
});
