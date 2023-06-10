import { createLevel, createNewLevel } from "./level";
import {
  BODY_LENGTH,
  FOOTER_BYTE_LENGTH,
  LEVEL_BYTES_LENGTH,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  TITLE_LENGTH,
} from "./formats/std";
import {
  TILE_HARDWARE,
  TILE_INFOTRON,
  TILE_SP_PORT_D,
  TILE_SP_PORT_R,
  TILE_SP_PORT_U,
  TILE_ZONK,
} from "./tiles-id";
import {
  ISupaplexSpecPort,
  ISupaplexSpecPortProps,
  LocalOpt,
} from "./internal";
import { readLevelset } from "./formats/mpx/io";
import { dumpLevel, readExampleFile } from "./helpers.dev";

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

  const testFooter3x2 = Uint8Array.of(
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
  expect(testFooter3x2.length).toBe(96);

  const testLevelData3x2 = Uint8Array.of(
    0,
    TILE_SP_PORT_U,
    4,
    1,
    3,
    5,
    ...testFooter3x2,
  );

  describe("constructor", () => {
    it("no params", () => {
      expect(dumpLevel(createLevel(60, 24))).toMatchSnapshot();
    });
    it("no data", () => {
      const level = createLevel(3, 2);

      expect(level.width).toBe(3);
      expect(level.height).toBe(2);
      expect(level.length).toBe(6 + FOOTER_BYTE_LENGTH);

      expect(level.getTile(0, 0)).toEqual(0);
      expect(level.getTile(2, 1)).toEqual(0);
      expect(level.title).toBe("".padEnd(TITLE_LENGTH));
    });

    it("wrong size", () => {
      expect(LEVEL_WIDTH).toBe(60);
      expect(LEVEL_HEIGHT).toBe(24);
      expect(BODY_LENGTH).toBe(1440);
      expect(LEVEL_BYTES_LENGTH).toBe(1536);
      expect(() => createLevel(60, 24, Uint8Array.of(0, 1, 6, 5))).toThrow(
        new Error(
          `Invalid buffer length 4, expected at least ${LEVEL_BYTES_LENGTH}`,
        ),
      );
    });
    it("data", () => {
      const level = createLevel(3, 2, testLevelData3x2);

      expect(dumpLevel(level)).toMatchSnapshot();
    });
  });

  it("raw", () => {
    const level = createLevel(3, 2, testLevelData3x2);
    expect(level.raw).toEqual(testLevelData3x2);
    expect(level.length).toEqual(testLevelData3x2.length);

    const demo = Uint8Array.of(10, 20, 30, 40, 50, 60, 70);
    const next = level.setDemoSeed({ lo: 0x12, hi: 0x34 }).setDemo(demo);
    expect(next.length).toEqual(testLevelData3x2.length + 7 + 2);
    expect(next.length).toEqual(6 + 96 + 7 + 2);

    const modFooter = new Uint8Array(testFooter3x2);
    modFooter[94] = 0x12;
    modFooter[95] = 0x34;
    expect(next.raw).toEqual(
      Uint8Array.of(
        0,
        TILE_SP_PORT_U,
        4,
        1,
        3,
        5,
        ...modFooter,
        0,
        ...demo,
        0xff,
      ),
    );
  });

  describe("resize", () => {
    it("simple", () => {
      const a = createLevel(3, 2, testLevelData3x2);

      let b = a.resize({ width: 5, height: 4 });
      expect(dumpLevel(b)).toMatchSnapshot();

      b = b
        .setTile(3, 0, TILE_INFOTRON)
        .setTile(4, 0, TILE_SP_PORT_R)
        .setTile(0, 2, TILE_ZONK)
        .setTile(0, 3, TILE_SP_PORT_D)
        .setSpecPort(4, 0, {
          setsGravity: true,
          setsFreezeZonks: false,
          setsFreezeEnemies: true,
        })
        .setSpecPort(0, 3, {
          setsGravity: false,
          setsFreezeZonks: true,
          setsFreezeEnemies: true,
        });
      expect(dumpLevel(b)).toMatchSnapshot();

      const c = b.resize({ width: 3, height: 2 });
      expect(dumpLevel(c)).toEqual(dumpLevel(a));
    });

    it("noop", () => {
      const a = createLevel(3, 2);
      expect(a.resize({ width: 3, height: 2 })).toBe(a);
    });
  });

  it("getTile", () => {
    const level = createLevel(3, 2, testLevelData3x2);

    expect(level.getTile(0, 0)).toEqual(0);
    expect(level.getTile(1, 0)).toEqual(TILE_SP_PORT_U);
    expect(level.getTile(2, 0)).toEqual(4);
    expect(level.getTile(0, 1)).toEqual(1);
    expect(level.getTile(1, 1)).toEqual(3);
    expect(level.getTile(2, 1)).toEqual(5);
  });

  describe("setTile", () => {
    it("noop", () => {
      const level = createLevel(3, 2, testLevelData3x2);
      expect(level.setTile(2, 0, level.getTile(2, 0))).toBe(level);
    });

    it("usual", () => {
      const level = createLevel(3, 2, testLevelData3x2);
      const copy = level.setTile(2, 0, 7);
      expect(level.getTile(2, 0)).toBe(4);
      expect(level.specPortsCount).toBe(1);
      expect(copy.getTile(2, 0)).toBe(7);
      expect(copy.specPortsCount).toBe(1);
    });

    it("add spec port", () => {
      const level = createLevel(3, 2, testLevelData3x2);
      const copy = level.setTile(2, 0, TILE_SP_PORT_U);
      expect(level.getTile(2, 0)).toBe(4);
      expect(level.specPortsCount).toBe(1);
      expect(copy.getTile(2, 0)).toBe(TILE_SP_PORT_U);
      expect(copy.specPortsCount).toBe(2);
      expect([...copy.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
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
      const level = createLevel(3, 2, testLevelData3x2);
      const copy = level.setTile(1, 0, TILE_SP_PORT_R);
      expect(level.getTile(1, 0)).toBe(TILE_SP_PORT_U);
      expect(level.specPortsCount).toBe(1);
      expect(copy.getTile(1, 0)).toBe(TILE_SP_PORT_R);
      expect(copy.specPortsCount).toBe(1);
      expect([...copy.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
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
      const level = createLevel(3, 2, testLevelData3x2);
      const copy = level.setTile(1, 0, TILE_ZONK);
      expect(copy.getTile(1, 0)).toBe(TILE_ZONK);
      expect(copy.specPortsCount).toBe(0);
      expect([...copy.getSpecPorts()]).toEqual([]);
    });
  });

  describe("batch", () => {
    it("std", () => {
      const origin = createLevel(60, 24);

      // how many copies will we make in 1.5 sec?
      let start = Date.now();
      let result = origin;
      let count = 0;
      let took: number;
      for (; (took = Date.now() - start) < 1000; count++) {
        result = result.setTile(10, 10, 1 + (count % 10));
      }
      expect(count).toBeGreaterThan(1000);
      expect(result).not.toBe(origin);
      expect(origin.getTile(10, 10)).toBe(0);
      expect(result.getTile(10, 10)).not.toBe(0);

      // then doing the same in batch - it must be faster
      start = Date.now();
      result = origin.batch((result) => {
        for (let i = count; i-- > 0; ) {
          result = result.setTile(10, 10, 1 + (i % 10));
        }
        return result.setTitle("Foo bar");
      });
      // it must take less time
      expect(Date.now() - start).toBeLessThan(took / 3);
      // expect(Date.now() - start).toBeLessThan((took / count) * 2);
      expect(result).not.toBe(origin);
      expect(origin.getTile(10, 10)).toBe(0);
      expect(result.getTile(10, 10)).not.toBe(0);
      expect(origin.title).toBe("                       ");
      expect(result.title).toBe("Foo bar                ");
    });

    it("100k * 10k", () => {
      const origin = createLevel(100_000, 10_000);

      // how many copies will we make in 1.5 sec?
      let start = Date.now();
      let result = origin;
      let count = 0;
      let took: number;
      for (; (took = Date.now() - start) < 1000; count++) {
        result = result.setTile(10, 10, 1 + (count % 10));
      }
      expect(count).toBeGreaterThan(2);
      expect(result).not.toBe(origin);
      expect(origin.getTile(10, 10)).toBe(0);
      expect(result.getTile(10, 10)).not.toBe(0);

      // then doing the same in batch - it must be faster
      start = Date.now();
      result = origin.batch((result) => {
        for (let i = count; i-- > 0; ) {
          result = result.setTile(10, 10, 1 + (i % 10));
        }
        return result.setTitle("Foo bar");
      });
      // it must take time shorten then 2 copies, but sometimes
      expect(Date.now() - start).toBeLessThan((took / count) * 3);
      expect(result).not.toBe(origin);
      expect(origin.getTile(10, 10)).toBe(0);
      expect(result.getTile(10, 10)).not.toBe(0);
      expect(origin.title).toBe("                       ");
      expect(result.title).toBe("Foo bar                ");
    });
  });

  it("findSpecPort", () => {
    const level = createLevel(3, 2, testLevelData3x2);
    expect(level.findSpecPort(1, 0)).toEqual<ISupaplexSpecPortProps>({
      setsGravity: true,
      setsFreezeZonks: true,
      setsFreezeEnemies: true,
    });
  });

  it("setSpecPort", () => {
    const level = createLevel(60, 24, testLevelData);
    expect(level.setSpecPort(12, 12)).toBe(level);
    expect(
      level.setSpecPort(12, 12, {
        setsGravity: true,
        setsFreezeZonks: true,
        setsFreezeEnemies: true,
      }),
    ).toBe(level);
    expect(
      level.setSpecPort(12, 12, {
        setsGravity: false,
        setsFreezeZonks: true,
        setsFreezeEnemies: true,
      }),
    ).not.toBe(level);
  });

  describe("tilesRenderStream", () => {
    it("huge maze", async () => {
      const data = await readExampleFile("HUDEMAZ1.mpx");
      const level = readLevelset(data.buffer).getLevel(0);

      const a = [...level.tilesRenderStream(0, 0, 202, 202)];
      expect(a.length).toBeLessThan(202 * 202);
      expect(a[0]).toEqual([0, 0, 202, TILE_HARDWARE]);
      expect(a[a.length - 1]).toEqual([0, 201, 202, TILE_HARDWARE]);
    });
  });

  it("copyRegion", () => {
    const level = createLevel(60, 24, testLevelData);
    const region = level.copyRegion({ x: 11, y: 11, width: 3, height: 3 });
    expect([
      ...region.tiles.tilesRenderStream(
        0,
        0,
        region.tiles.width,
        region.tiles.height,
      ),
    ]).toEqual([
      [0, 0, 1, 0xc],
      [1, 0, 2, 0],
      [0, 1, 1, 0],
      [1, 1, 1, 0xd],
      [2, 1, 1, 0],
      [0, 2, 2, 0],
      [2, 2, 1, 0xe],
    ]);
    expect(region.tiles.getTile(0, 0)).toBe(0xc);
    expect(region.tiles.getTile(1, 0)).toBe(0);
    expect(region.tiles.getTile(2, 0)).toBe(0);
    expect(region.tiles.getTile(0, 1)).toBe(0);
    expect(region.tiles.getTile(1, 1)).toBe(0xd);
    expect(region.tiles.getTile(2, 1)).toBe(0);
    expect(region.tiles.getTile(0, 2)).toBe(0);
    expect(region.tiles.getTile(1, 2)).toBe(0);
    expect(region.tiles.getTile(2, 2)).toBe(0xe);
    expect(region.specPorts).toEqual([
      {
        x: 1,
        y: 1,
        setsGravity: true,
        setsFreezeZonks: true,
        setsFreezeEnemies: true,
      },
    ]);
  });

  describe("pasteRegion", () => {
    const level = createLevel(60, 24, testLevelData);
    const region = level.copyRegion({ x: 11, y: 11, width: 3, height: 3 });

    it("other place", () => {
      // (10;11)
      // 00 0c 00 00
      // 00 00 0d 00
      // 00 00 00 0e
      // 00 00 00 00
      expect([...level.tilesRenderStream(10, 11, 4, 4)]).toEqual([
        [10, 11, 1, 0],
        [11, 11, 1, 0xc],
        [12, 11, 2, 0],
        [10, 12, 2, 0],
        [12, 12, 1, 0xd],
        [13, 12, 1, 0],
        [10, 13, 3, 0],
        [13, 13, 1, 0xe, 1],
        [10, 14, 4, 0],
      ]);
      const next = level.pasteRegion(10, 12, region);
      // 00 0c 00 00
      // 0c 00 00 00
      // 00 0d 00 0e
      // 00 00 0e 00
      expect([...next.tilesRenderStream(10, 11, 4, 4)]).toEqual([
        [10, 11, 1, 0],
        [11, 11, 1, 0xc],
        [12, 11, 2, 0],
        [10, 12, 1, 0xc],
        [11, 12, 3, 0],
        [10, 13, 1, 0],
        [11, 13, 1, 0xd],
        [12, 13, 1, 0],
        [13, 13, 1, 0xe, 1],
        [10, 14, 2, 0],
        [12, 14, 1, 0xe],
        [13, 14, 1, 0],
      ]);
      expect(next.specPortsCount).toBe(2);
      expect([...next.getSpecPorts()]).toEqual([
        {
          x: 11,
          y: 13,
          setsGravity: true,
          setsFreezeZonks: true,
          setsFreezeEnemies: true,
        },
        {
          x: 12,
          y: 14,
          setsGravity: false,
          setsFreezeZonks: false,
          setsFreezeEnemies: false,
        },
      ]);
    });

    it("outside partial", () => {
      // (0;0)
      // 01 00 00 00
      // 00 02 00 00
      // 00 00 03 00
      // 00 00 00 04
      expect([...level.tilesRenderStream(0, 0, 4, 4)]).toEqual([
        [0, 0, 1, 1],
        [1, 0, 3, 0],
        [0, 1, 1, 0],
        [1, 1, 1, 2],
        [2, 1, 2, 0],
        [0, 2, 2, 0],
        [2, 2, 1, 3],
        [3, 2, 1, 0],
        [0, 3, 3, 0],
        [3, 3, 1, 4],
      ]);
      const next = level.pasteRegion(-2, 1, region);
      // 01 00 00 00
      // 00 02 00 00
      // 00 00 03 00
      // 0e 00 00 04
      expect([...next.tilesRenderStream(0, 0, 4, 4)]).toEqual([
        [0, 0, 1, 1],
        [1, 0, 3, 0],
        [0, 1, 1, 0],
        [1, 1, 1, 2],
        [2, 1, 2, 0],
        [0, 2, 2, 0],
        [2, 2, 1, 3],
        [3, 2, 1, 0],
        [0, 3, 1, 0xe],
        [1, 3, 2, 0],
        [3, 3, 1, 4],
      ]);
      expect(next.specPortsCount).toBe(2);
      expect([...next.getSpecPorts()]).toEqual([
        {
          x: 12,
          y: 12,
          setsGravity: true,
          setsFreezeZonks: true,
          setsFreezeEnemies: true,
        },
        {
          x: 0,
          y: 3,
          setsGravity: false,
          setsFreezeZonks: false,
          setsFreezeEnemies: false,
        },
      ]);
    });

    it("outside noop", () => {
      expect(level.pasteRegion(-5, 10, region)).toBe(level);
      expect(level.raw).toEqual(testLevelData);
    });
  });

  it("localOptions", () => {
    const level = createLevel(60, 24);

    expect(level.localOptions).toEqual(undefined);
    expect(level.setLocalOptions({})).toBe(level);
    expect(
      level.setLocalOptions({
        [LocalOpt.UsePlasma]: undefined,
        [LocalOpt.UsePlasmaLimit]: undefined,
        [LocalOpt.UsePlasmaTime]: undefined,
        [LocalOpt.UseZonker]: 0,
        [LocalOpt.UseSerialPorts]: "",
      }),
    ).toBe(level);

    const p = level.setLocalOptions({ [LocalOpt.UsePlasma]: true });
    expect(p.usePlasma).toBe(true);
    expect(p.localOptions).toEqual({ [LocalOpt.UsePlasma]: 1 });
    expect(level.setUsePlasma(true).localOptions).toEqual({
      [LocalOpt.UsePlasma]: 1,
    });

    const pl = level.setLocalOptions({ [LocalOpt.UsePlasmaLimit]: 42 });
    expect(pl.usePlasmaLimit).toBe(42);
    expect(pl.localOptions).toEqual({ [LocalOpt.UsePlasmaLimit]: 42 });
    expect(level.setUsePlasmaLimit(42).localOptions).toEqual({
      [LocalOpt.UsePlasmaLimit]: 42,
    });

    const pt = level.setLocalOptions({ [LocalOpt.UsePlasmaTime]: 37 });
    expect(pt.usePlasmaTime).toBe(37);
    expect(pt.localOptions).toEqual({ [LocalOpt.UsePlasmaTime]: 37 });
    expect(level.setUsePlasmaTime(37).localOptions).toEqual({
      [LocalOpt.UsePlasmaTime]: 37,
    });

    const z = level.setLocalOptions({ [LocalOpt.UseZonker]: true });
    expect(z.useZonker).toBe(true);
    expect(z.localOptions).toEqual({ [LocalOpt.UseZonker]: 1 });
    expect(level.setUseZonker(true).localOptions).toEqual({
      [LocalOpt.UseZonker]: 1,
    });

    const s = level.setLocalOptions({ [LocalOpt.UseSerialPorts]: true });
    expect(s.useSerialPorts).toBe(true);
    expect(s.localOptions).toEqual({ [LocalOpt.UseSerialPorts]: 1 });
    expect(level.setUseSerialPorts(true).localOptions).toEqual({
      [LocalOpt.UseSerialPorts]: 1,
    });

    const all = level.setLocalOptions({
      [LocalOpt.UsePlasma]: true,
      [LocalOpt.UsePlasmaLimit]: 42,
      [LocalOpt.UsePlasmaTime]: 37,
      [LocalOpt.UseZonker]: 91,
      [LocalOpt.UseSerialPorts]: "lol",
    });
    expect(all.usePlasma).toBe(true);
    expect(all.usePlasmaLimit).toBe(42);
    expect(all.usePlasmaTime).toBe(37);
    expect(all.useZonker).toBe(true);
    expect(all.useSerialPorts).toBe(true);
    expect(all.localOptions).toEqual({
      [LocalOpt.UsePlasma]: 1,
      [LocalOpt.UsePlasmaLimit]: 42,
      [LocalOpt.UsePlasmaTime]: 37,
      [LocalOpt.UseZonker]: 1,
      [LocalOpt.UseSerialPorts]: 1,
    });
  });
});

describe("createNewLevel", () => {
  it("no options", () => {
    expect(dumpLevel(createNewLevel())).toMatchSnapshot();
  });

  it("size", () => {
    expect(
      dumpLevel(createNewLevel({ width: 5, height: 3 })),
    ).toMatchSnapshot();
  });

  it("border", () => {
    expect(
      dumpLevel(createNewLevel({ width: 5, height: 3, borderTile: TILE_ZONK })),
    ).toMatchSnapshot();
  });

  it("fill", () => {
    expect(
      dumpLevel(
        createNewLevel({ width: 5, height: 3, fillTile: TILE_INFOTRON }),
      ),
    ).toMatchSnapshot();
  });

  it("all", () => {
    expect(
      dumpLevel(
        createNewLevel({
          width: 5,
          height: 3,
          borderTile: TILE_ZONK,
          fillTile: TILE_INFOTRON,
        }),
      ),
    ).toMatchSnapshot();
    expect(
      dumpLevel(
        createNewLevel({
          width: 5,
          height: 3,
          borderTile: TILE_INFOTRON,
          fillTile: TILE_INFOTRON,
        }),
      ),
    ).toMatchSnapshot();
  });
});