import {
  LEVEL_BYTES_LENGTH,
  specPortCoordsToOffset,
  specPortOffsetToCoords,
  SupaplexLevel,
} from "./level";
import { dumpLevel } from "./helpers.dev";
import { TILE_SP_PORT_U, TILE_ZONK } from "./tiles";
import { ISupaplexSpecPort, ISupaplexSpecPortProps } from "./types";

it("spec port coords", () => {
  expect(specPortCoordsToOffset(0, 0)).toEqual([0, 0]);
  expect(specPortOffsetToCoords(0, 0)).toEqual([0, 0]);

  expect(specPortOffsetToCoords(...specPortCoordsToOffset(0, 59))).toEqual([
    0, 59,
  ]);
  expect(specPortOffsetToCoords(...specPortCoordsToOffset(23, 59))).toEqual([
    23, 59,
  ]);
  expect(specPortOffsetToCoords(...specPortCoordsToOffset(23, 0))).toEqual([
    23, 0,
  ]);
});

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

    const e = /^Cell coords \(-?\d+, -?\d+\) are out of range$/;
    expect(() => level.getCell(-2, 0)).toThrow(e);
    expect(() => level.getCell(-1, 0)).toThrow(e);
    expect(() => level.getCell(60, 0)).toThrow(e);
    expect(() => level.getCell(61, 0)).toThrow(e);
    expect(() => level.getCell(0, -2)).toThrow(e);
    expect(() => level.getCell(0, -1)).toThrow(e);
    expect(() => level.getCell(0, 24)).toThrow(e);
    expect(() => level.getCell(0, 25)).toThrow(e);
  });

  describe("setCell", () => {
    it("validate", () => {
      const level = new SupaplexLevel(testLevelData);

      const e1 = /^Cell coords \(-?\d+, -?\d+\) are out of range$/;
      expect(() => level.setCell(-2, 0, 0)).toThrow(e1);
      expect(() => level.setCell(-1, 0, 0)).toThrow(e1);
      expect(() => level.setCell(60, 0, 0)).toThrow(e1);
      expect(() => level.setCell(61, 0, 0)).toThrow(e1);
      expect(() => level.setCell(0, -2, 0)).toThrow(e1);
      expect(() => level.setCell(0, -1, 0)).toThrow(e1);
      expect(() => level.setCell(0, 24, 0)).toThrow(e1);
      expect(() => level.setCell(0, 25, 0)).toThrow(e1);

      const e2 = /^Invalid byte -?\d+$/;
      expect(() => level.setCell(0, 0, -2)).toThrow(e2);
      expect(() => level.setCell(0, 0, -1)).toThrow(e2);
      expect(() => level.setCell(0, 0, 256)).toThrow(e2);
      expect(() => level.setCell(0, 0, 257)).toThrow(e2);
    });

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

  it("initialGravity", () => {
    const level = new SupaplexLevel(testLevelData);

    expect(level.initialGravity).toBe(true);

    level.initialGravity = false;
    expect(level.initialGravity).toBe(false);

    level.initialGravity = true;
    expect(level.initialGravity).toBe(true);
  });

  it("title", () => {
    const level = new SupaplexLevel(testLevelData);

    expect(level.title).toBe("-- Lorem ipsum --      ");

    level.title = "==== Foo bar ====";
    expect(level.title).toBe("==== Foo bar ====      ");

    level.title = "Lorem ipsum dolor sit a";
    expect(level.title).toBe("Lorem ipsum dolor sit a");

    level.title = "";
    expect(level.title).toBe("                       ");

    expect(() => {
      level.title = "123456789012345678901234";
    }).toThrow(new RangeError("Title length exceeds limit"));

    expect(() => {
      level.title = "-- foo \n bar --";
    }).toThrow(new Error("Unsupported characters found"));
    expect(() => {
      level.title = "-- foo \x80 bar --";
    }).toThrow(new Error("Unsupported characters found"));
    expect(() => {
      level.title = "-- foo \xFF bar --";
    }).toThrow(new Error("Unsupported characters found"));
    expect(() => {
      level.title = "-- foo \u00A0 bar --";
    }).toThrow(new Error("Unsupported characters found"));
  });

  it("initialFreezeZonks", () => {
    const level = new SupaplexLevel(testLevelData);

    expect(level.initialFreezeZonks).toBe(true);

    level.initialFreezeZonks = false;
    expect(level.initialFreezeZonks).toBe(false);

    level.initialFreezeZonks = true;
    expect(level.initialFreezeZonks).toBe(true);
  });

  it("infotronsNeed", () => {
    const level = new SupaplexLevel(testLevelData);
    expect(level.infotronsNeed).toBe(42);

    level.infotronsNeed = 37;
    expect(level.infotronsNeed).toBe(37);

    level.infotronsNeed = "all";
    expect(level.infotronsNeed).toBe("all");

    expect(() => {
      level.infotronsNeed = 0;
    }).toThrow(
      new RangeError("Value cannot be 0 since it has special meaning"),
    );
    expect(() => {
      level.infotronsNeed = 256;
    }).toThrow(/^Invalid byte -?\d+$/);
    expect(() => {
      level.infotronsNeed = 257;
    }).toThrow(/^Invalid byte -?\d+$/);
  });

  it("clearSpecPorts", () => {
    const level = new SupaplexLevel(testLevelData);

    level.clearSpecPorts();
    expect(level.specPortsCount).toBe(0);
  });

  it("findSpecPort", () => {
    const level = new SupaplexLevel(testLevelData);

    expect(level.findSpecPort(12, 12)).toEqual<ISupaplexSpecPortProps>({
      setsGravity: true,
      setsFreezeZonks: true,
      setsFreezeEnemies: true,
    });
    expect(level.findSpecPort(13, 12)).toBeUndefined();
  });

  describe("setSpecPort", () => {
    it("overflow", () => {
      const level = new SupaplexLevel(testLevelData);

      level.setSpecPort(2, 1);
      level.setSpecPort(3, 1);
      level.setSpecPort(4, 1);
      level.setSpecPort(5, 1);
      level.setSpecPort(6, 1);
      level.setSpecPort(7, 1);
      level.setSpecPort(8, 1);
      level.setSpecPort(9, 1);
      level.setSpecPort(10, 1);
      expect(level.specPortsCount).toBe(10);
      expect(() => level.setSpecPort(11, 1)).toThrow(
        new RangeError("Cannot add more spec ports"),
      );
    });

    it("no op", () => {
      const level = new SupaplexLevel(testLevelData);

      level.setSpecPort(12, 12);

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
  });

  describe("deleteSpecPort", () => {
    it("no op", () => {
      const level = new SupaplexLevel(testLevelData);

      level.deleteSpecPort(10, 1);

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

    it("mid", () => {
      const level = new SupaplexLevel(testLevelData);

      level.setSpecPort(10, 1, {
        setsGravity: true,
        setsFreezeZonks: false,
        setsFreezeEnemies: true,
      });
      level.deleteSpecPort(12, 12);

      expect(level.specPortsCount).toBe(1);
      expect([...level.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
        {
          x: 10,
          y: 1,
          setsGravity: true,
          setsFreezeZonks: false,
          setsFreezeEnemies: true,
        },
      ]);
    });
  });
});
