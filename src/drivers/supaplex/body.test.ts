import { AnyBox } from "./AnyBox";
import { BODY_LENGTH, LEVEL_HEIGHT, LEVEL_WIDTH } from "./formats/std";
import { createLevelBody } from "./body";
import { TILE_EXIT, TILE_HARDWARE, TILE_MURPHY, TILE_SPACE } from "./tiles-id";

const supaplexBox = new AnyBox(LEVEL_WIDTH, LEVEL_HEIGHT);

describe("createLevelBody", () => {
  const data = new Uint8Array(BODY_LENGTH);
  for (let i = 65; i-- > 0; ) {
    data[i] = i;
  }

  describe("constructor", () => {
    it("no data", () => {
      const body = createLevelBody(supaplexBox);
      expect(body.length).toEqual(BODY_LENGTH);
      expect(body.raw).toEqual(new Uint8Array(BODY_LENGTH));
    });

    it("data", () => {
      const body = createLevelBody(supaplexBox, data);
      expect(body.length).toEqual(BODY_LENGTH);
      expect(body.raw).toEqual(data);
    });

    it("throw", () => {
      expect(() => createLevelBody(supaplexBox, new Uint8Array(100))).toThrow(
        new Error(`Invalid buffer length 100, expected ${BODY_LENGTH}`),
      );
    });
  });

  it("getTile", () => {
    const body = createLevelBody(supaplexBox, data);

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
    const body = createLevelBody(supaplexBox, data);

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

  it("batch", () => {
    const body = createLevelBody(new AnyBox(10_000, 10_000));

    // how many copies will we make in 1.5 sec?
    let start = Date.now();
    let result = body;
    let count = 0;
    let took: number;
    for (; (took = Date.now() - start) < 1500; count++) {
      result = result.setTile(count, count, 6);
    }
    expect(count).toBeGreaterThan(5);
    expect(result).not.toBe(body);
    expect(body.getTile(1, 1)).toBe(0);
    expect(result.getTile(1, 1)).toBe(6);

    // then doing the same in batch - it must be faster
    start = Date.now();
    result = body.batch((result) => {
      for (let i = count; i-- > 0; ) {
        result = result.setTile(i, i, 6);
      }
      return result;
    });
    // it must take time shorten then 2 copies
    expect(Date.now() - start).toBeLessThan((took / count) * 2);
    expect(result).not.toBe(body);
    expect(body.getTile(1, 1)).toBe(0);
    expect(result.getTile(1, 1)).toBe(6);
  });

  describe("tilesRenderStream", () => {
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
    const body = createLevelBody(new AnyBox(5, 3), data);

    it("full", () => {
      const full = [
        [0, 0, 5, TILE_HARDWARE],
        [0, 1, 1, TILE_HARDWARE],
        [1, 1, 1, TILE_MURPHY],
        [2, 1, 1, TILE_SPACE],
        [3, 1, 1, TILE_EXIT],
        [4, 1, 1, TILE_HARDWARE],
        [0, 2, 5, TILE_HARDWARE],
      ];
      expect([...body.tilesRenderStream(0, 0, 5, 3)]).toEqual(full);
      expect([...body.tilesRenderStream(-2, -3, 42, 37)]).toEqual(full);
    });

    it("oversize", () => {
      expect([...body.tilesRenderStream(1, -1, 3, 10)]).toEqual([
        [1, 0, 3, TILE_HARDWARE],
        [1, 1, 1, TILE_MURPHY],
        [2, 1, 1, TILE_SPACE],
        [3, 1, 1, TILE_EXIT],
        [1, 2, 3, TILE_HARDWARE],
      ]);
    });

    it("undersize", () => {
      expect([...body.tilesRenderStream(1, 1, 0, 0)]).toEqual([]);
      expect([...body.tilesRenderStream(5, 0, 10, 10)]).toEqual([]);
      expect([...body.tilesRenderStream(10, 10, 10, 10)]).toEqual([]);
      expect([...body.tilesRenderStream(10, 10, 0, 0)]).toEqual([]);
    });
  });

  describe("copyRegion", () => {
    const body = createLevelBody(supaplexBox, data);

    it("full", () => {
      expect(body.copyRegion(-1, -2, 62, 26)[2]).toBe(body);
      expect(body.copyRegion(0, 0, 60, 24)[2]).toBe(body);
    });

    it("empty", () => {
      expect(body.copyRegion(1, 1, 0, 10)[2].width).toBe(0);
      expect(body.copyRegion(1, 1, 10, 0)[2].height).toBe(0);
      expect(body.copyRegion(1, 1, 0, 0)[2].width).toBe(0);
      expect(body.copyRegion(1, 1, 0, 0)[2].height).toBe(0);
    });

    it("part", () => {
      const [, , cut] = body.copyRegion(1, 0, 4, 3);
      expect(cut.width).toBe(4);
      expect(cut.height).toBe(3);
      expect([...cut.tilesRenderStream(0, 0, 4, 3)]).toEqual([
        [0, 0, 1, 1],
        [1, 0, 1, 2],
        [2, 0, 1, 3],
        [3, 0, 1, 4],
        [0, 1, 1, 61],
        [1, 1, 1, 62],
        [2, 1, 1, 63],
        [3, 1, 1, 64],
        [0, 2, 4, 0],
      ]);
      expect(cut.getTile(0, 0)).toBe(1);
      expect(cut.getTile(3, 0)).toBe(4);
      expect(cut.getTile(0, 1)).toBe(61);
      expect(cut.getTile(3, 1)).toBe(64);
      expect(cut.getTile(0, 2)).toBe(0);
      expect(cut.getTile(3, 2)).toBe(0);
    });
  });

  it("findPlayer", () => {
    let body = createLevelBody(supaplexBox);
    expect(body.findPlayer()).toBeNull();

    body = body.setTile(37, 19, TILE_MURPHY);
    expect(body.findPlayer()).toEqual([37, 19]);

    body = body.setTile(38, 19, TILE_MURPHY);
    expect(body.findPlayer()).toEqual([37, 19]);
    body = body.setTile(30, 20, TILE_MURPHY);
    expect(body.findPlayer()).toEqual([37, 19]);

    body = body.setTile(40, 15, TILE_MURPHY);
    expect(body.findPlayer()).toEqual([40, 15]);
  });
});
