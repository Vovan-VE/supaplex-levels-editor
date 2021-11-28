import { LEVEL_BYTES_LENGTH, SupaplexLevel } from "./level";
import { dumpLevel } from "./helpers.dev";
import { TILE_SP_PORT_U, TILE_ZONK } from "./tiles";
import { ISupaplexSpecPort, ISupaplexSpecPortProps } from "./types";

describe("level", () => {
  const testLevelData = Uint8Array.of(
    ...[
      "\x01",
      "\x00\x02",
      "\x00\x00\x03",
      "\x00\x00\x00\x04",
      "\x00\x00\x00\x00\x05",
      "\x00\x00\x00\x00\x00\x06",
      "\x00\x00\x00\x00\x00\x00\x07",
      "\x19\x00\x00\x00\x00\x00\x00\x08",
      "\x00\x1A\x00\x00\x00\x00\x00\x00\x09",
      "\x00\x00\x1B\x00\x00\x00\x00\x00\x00\x0A",
      "\x00\x00\x00\x1C\x00\x00\x00\x00\x00\x00\x0B",
      "\x00\x00\x00\x00\x1D\x00\x00\x00\x00\x00\x00\x0C",
      "\x00\x00\x00\x00\x00\x1E\x00\x00\x00\x00\x00\x00\x0D",
      "\x00\x00\x00\x00\x00\x00\x1F\x00\x00\x00\x00\x00\x00\x0E",
      "\x00\x00\x00\x00\x00\x00\x00\x20\x00\x00\x00\x00\x00\x00\x0F",
      "\x00\x00\x00\x00\x00\x00\x00\x00\x21\x00\x00\x00\x00\x00\x00\x10",
      "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x22\x00\x00\x00\x00\x00\x00\x11",
      "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x23\x00\x00\x00\x00\x00\x00\x12",
      "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x24\x00\x00\x00\x00\x00\x00\x13",
      "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x25\x00\x00\x00\x00\x00\x00\x14",
      "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x26\x00\x00\x00\x00\x00\x00\x15",
      "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x27\x00\x00\x00\x00\x00\x00\x16",
      "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x28\x00\x00\x00\x00\x00\x00\x17",
      "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x29\x2A\x00\x00\x00\x00\x00\x18",
    ]
      .map((s) => s.padEnd(60, "\x00").split(""))
      .flat()
      .map((c) => c.charCodeAt(0)),
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
    ..."\x05\xB8\x01\x02\x01\x00"
      .padEnd(10 * 6, "\x00")
      .split("")
      .map((c) => c.charCodeAt(0)),
    ...[0, 0, 0, 0],
  );
  expect(testLevelData.length).toBe(1536);

  describe("constructor", () => {
    it("no params", () => {
      expect(dumpLevel(new SupaplexLevel())).toMatchSnapshot();
    });

    it("wrong size", () => {
      expect(() => new SupaplexLevel(Uint8Array.of(0, 1, 6, 5))).toThrow(
        new Error(`Invalid buffer length 4, expected ${LEVEL_BYTES_LENGTH}`),
      );
    });
    it("buffer", () => {
      const level = new SupaplexLevel(testLevelData);
      expect(dumpLevel(level)).toMatchSnapshot();

      // it operates on copy
      level.setCell(0, 0, 20);
      // and origin was not changed
      expect(testLevelData[0]).toBe(1);
    });
  });

  it("copy", () => {
    const a = new SupaplexLevel();
    a.title = "First level title";
    a.setCell(10, 15, 6);

    const b = a.copy();
    expect(dumpLevel(b)).toEqual(dumpLevel(a));

    b.title = "Copy level title";
    b.setCell(10, 15, 1);
    let dump = dumpLevel(b);
    expect(dump).not.toEqual(dumpLevel(a));
    expect(dump).toMatchSnapshot();
  });

  it("getCell", () => {
    const level = new SupaplexLevel(testLevelData);

    expect(level.getCell(0, 0)).toBe(1);
    expect(level.getCell(1, 1)).toBe(2);
    expect(level.getCell(2, 2)).toBe(3);
    expect(level.getCell(23, 23)).toBe(24);

    expect(level.getCell(16, 23)).toBe(0x29);
    expect(level.getCell(17, 23)).toBe(0x2a);
  });

  describe("setCell", () => {
    it("usual", () => {
      const level = new SupaplexLevel(testLevelData);
      level.setCell(10, 2, 7);
      expect(level.getCell(10, 2)).toBe(7);
      expect(level.specPortsCount).toBe(1);
    });

    it("add spec port", () => {
      const level = new SupaplexLevel(testLevelData);
      level.setCell(10, 2, TILE_SP_PORT_U);
      expect(level.getCell(10, 2)).toBe(TILE_SP_PORT_U);
      expect(level.specPortsCount).toBe(2);
      expect([...level.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
        {
          x: 12,
          y: 12,
          setsGravity: true,
          setsFreezeZonks: true,
          setsFreezeEnemies: true,
        },
        {
          x: 10,
          y: 2,
          setsGravity: false,
          setsFreezeZonks: false,
          setsFreezeEnemies: false,
        },
      ]);
    });

    it("keep spec port", () => {
      const level = new SupaplexLevel(testLevelData);
      level.setCell(12, 12, TILE_SP_PORT_U);
      expect(level.getCell(12, 12)).toBe(TILE_SP_PORT_U);
      expect(level.specPortsCount).toBe(1);
      expect([...level.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
        {
          x: 12,
          y: 12,
          setsGravity: true,
          setsFreezeZonks: true,
          setsFreezeEnemies: true,
        },
      ]);
    });

    it("remove spec port", () => {
      const level = new SupaplexLevel(testLevelData);
      level.setCell(12, 12, TILE_ZONK);
      expect(level.getCell(12, 12)).toBe(TILE_ZONK);
      expect(level.specPortsCount).toBe(0);
      expect([...level.getSpecPorts()]).toEqual([]);
    });
  });

  it("findSpecPort", () => {
    const level = new SupaplexLevel(testLevelData);
    expect(level.findSpecPort(12, 12)).toEqual<ISupaplexSpecPortProps>({
      setsGravity: true,
      setsFreezeZonks: true,
      setsFreezeEnemies: true,
    });
  });
});
