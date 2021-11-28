import { BODY_LENGTH, supaplexBox } from "./box";
import { LevelBody } from "./body";

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

  it("getCell", () => {
    const body = new LevelBody(supaplexBox, data);

    expect(body.getCell(0, 0)).toBe(0);
    expect(body.getCell(1, 0)).toBe(1);
    expect(body.getCell(2, 0)).toBe(2);
    expect(body.getCell(58, 0)).toBe(58);
    expect(body.getCell(59, 0)).toBe(59);
    expect(body.getCell(0, 1)).toBe(60);
    expect(body.getCell(1, 1)).toBe(61);
    expect(body.getCell(2, 1)).toBe(62);
    expect(body.getCell(3, 1)).toBe(63);
    expect(body.getCell(4, 1)).toBe(64);
    expect(body.getCell(5, 1)).toBe(0);
    expect(body.getCell(6, 1)).toBe(0);

    const e = /^Cell coords \(-?\d+, -?\d+\) are out of range$/;
    expect(() => body.getCell(-2, 0)).toThrow(e);
    expect(() => body.getCell(-1, 0)).toThrow(e);
    expect(() => body.getCell(60, 0)).toThrow(e);
    expect(() => body.getCell(61, 0)).toThrow(e);
    expect(() => body.getCell(0, -2)).toThrow(e);
    expect(() => body.getCell(0, -1)).toThrow(e);
    expect(() => body.getCell(0, 24)).toThrow(e);
    expect(() => body.getCell(0, 25)).toThrow(e);
  });

  it("setCell", () => {
    const body = new LevelBody(supaplexBox, data);

    body.setCell(1, 2, 95);
    expect(body.getCell(1, 2)).toBe(95);
    const offset = supaplexBox.coordsToOffset(1, 2);
    expect(body.raw[offset]).toBe(95);
    expect(data[offset]).toBe(0);

    const prev = jest.fn();
    body.setCell(1, 2, 41, prev);
    expect(prev).toHaveBeenCalledWith(95);
    expect(body.getCell(1, 2)).toBe(41);

    expect(() =>
      body.setCell(1, 2, 23, () => {
        throw new Error("Boo");
      }),
    ).toThrow(new Error("Boo"));
    expect(body.getCell(1, 2)).toBe(41);

    const e1 = /^Cell coords \(-?\d+, -?\d+\) are out of range$/;
    expect(() => body.setCell(-2, 0, 0)).toThrow(e1);
    expect(() => body.setCell(-1, 0, 0)).toThrow(e1);
    expect(() => body.setCell(60, 0, 0)).toThrow(e1);
    expect(() => body.setCell(61, 0, 0)).toThrow(e1);
    expect(() => body.setCell(0, -2, 0)).toThrow(e1);
    expect(() => body.setCell(0, -1, 0)).toThrow(e1);
    expect(() => body.setCell(0, 24, 0)).toThrow(e1);
    expect(() => body.setCell(0, 25, 0)).toThrow(e1);

    const e2 = /^Invalid byte -?\d+$/;
    expect(() => body.setCell(0, 0, -2)).toThrow(e2);
    expect(() => body.setCell(0, 0, -1)).toThrow(e2);
    expect(() => body.setCell(0, 0, 256)).toThrow(e2);
    expect(() => body.setCell(0, 0, 257)).toThrow(e2);
  });
});
