import { MegaplexLevel } from "./level";
import { FOOTER_BYTE_LENGTH, TITLE_LENGTH } from "../supaplex/footer";
import { dumpLevel } from "./helpers.dev";
import { TILE_SP_PORT_U, TILE_ZONK } from "../supaplex/tiles";
import { ISupaplexSpecPort, ISupaplexSpecPortProps } from "../supaplex/types";

describe("level", () => {
  const testFooter = Uint8Array.of(
    ...[0, 0, 0, 0],
    // G
    1,
    ...[0],
    // title
    ..."-- Lorem ipsum --"
      .padEnd(23)
      .split("")
      .map((c) => c.charCodeAt(0)),
    // freeze zonks
    2,
    // infotrons need
    42,
    // spec ports count
    1,
    // spec port db
    ..."\x00\x02\x01\x02\x01\x00"
      .padEnd(10 * 6, "\x00")
      .split("")
      .map((c) => c.charCodeAt(0)),
    ...[0, 0, 0, 0],
  );
  expect(testFooter.length).toBe(96);

  const testLevelData = Uint8Array.of(
    0,
    TILE_SP_PORT_U,
    4,
    1,
    3,
    5,
    ...testFooter,
  );

  describe("constructor", () => {
    it("no data", () => {
      const level = new MegaplexLevel(3, 2);

      expect(level.width).toBe(3);
      expect(level.height).toBe(2);
      expect(level.length).toBe(6 + FOOTER_BYTE_LENGTH);

      expect(level.getCell(0, 0)).toEqual(0);
      expect(level.getCell(2, 1)).toEqual(0);
      expect(level.title).toBe("".padEnd(TITLE_LENGTH));
    });

    it("data", () => {
      const level = new MegaplexLevel(3, 2, testLevelData);

      expect(dumpLevel(level)).toMatchSnapshot();
    });

    it("throw", () => {
      expect(() => new MegaplexLevel(3, 2, new Uint8Array(42))).toThrow(
        new Error(
          `Invalid buffer length 42, expected at least ${
            6 + FOOTER_BYTE_LENGTH
          }`,
        ),
      );
    });
  });

  it("raw", () => {
    const level = new MegaplexLevel(3, 2, testLevelData);
    expect(level.raw).toEqual(testLevelData);
  });

  it("getCell", () => {
    const level = new MegaplexLevel(3, 2, testLevelData);

    expect(level.getCell(0, 0)).toEqual(0);
    expect(level.getCell(1, 0)).toEqual(TILE_SP_PORT_U);
    expect(level.getCell(2, 0)).toEqual(4);
    expect(level.getCell(0, 1)).toEqual(1);
    expect(level.getCell(1, 1)).toEqual(3);
    expect(level.getCell(2, 1)).toEqual(5);
  });

  describe("setCell", () => {
    it("usual", () => {
      const level = new MegaplexLevel(3, 2, testLevelData);
      level.setCell(2, 0, 7);
      expect(level.getCell(2, 0)).toBe(7);
      expect(level.specPortsCount).toBe(1);
    });

    it("add spec port", () => {
      const level = new MegaplexLevel(3, 2, testLevelData);
      level.setCell(2, 0, TILE_SP_PORT_U);
      expect(level.getCell(2, 0)).toBe(TILE_SP_PORT_U);
      expect(level.specPortsCount).toBe(2);
      expect([...level.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
        {
          x: 1,
          y: 0,
          setsGravity: true,
          setsFreezeZonks: true,
          setsFreezeEnemies: true,
        },
        {
          x: 2,
          y: 0,
          setsGravity: false,
          setsFreezeZonks: false,
          setsFreezeEnemies: false,
        },
      ]);
    });

    it("keep spec port", () => {
      const level = new MegaplexLevel(3, 2, testLevelData);
      level.setCell(1, 0, TILE_SP_PORT_U);
      expect(level.getCell(1, 0)).toBe(TILE_SP_PORT_U);
      expect(level.specPortsCount).toBe(1);
      expect([...level.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
        {
          x: 1,
          y: 0,
          setsGravity: true,
          setsFreezeZonks: true,
          setsFreezeEnemies: true,
        },
      ]);
    });

    it("remove spec port", () => {
      const level = new MegaplexLevel(3, 2, testLevelData);
      level.setCell(1, 0, TILE_ZONK);
      expect(level.getCell(1, 0)).toBe(TILE_ZONK);
      expect(level.specPortsCount).toBe(0);
      expect([...level.getSpecPorts()]).toEqual([]);
    });
  });

  it("findSpecPort", () => {
    const level = new MegaplexLevel(3, 2, testLevelData);
    expect(level.findSpecPort(1, 0)).toEqual<ISupaplexSpecPortProps>({
      setsGravity: true,
      setsFreezeZonks: true,
      setsFreezeEnemies: true,
    });
  });
});
