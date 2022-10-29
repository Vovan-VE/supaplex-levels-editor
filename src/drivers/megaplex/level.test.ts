import { createLevel, MegaplexLevel } from "./level";
import { FOOTER_BYTE_LENGTH, TITLE_LENGTH } from "../supaplex/footer";
import { dumpLevel, readExampleFile } from "./helpers.dev";
import {
  TILE_HARDWARE,
  TILE_INFOTRON,
  TILE_SP_PORT_D,
  TILE_SP_PORT_R,
  TILE_SP_PORT_U,
  TILE_ZONK,
} from "../supaplex/tiles-id";
import {
  ISupaplexSpecPort,
  ISupaplexSpecPortProps,
} from "../supaplex/internal";
import { reader } from "./io";

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
      const level = createLevel(3, 2);

      expect(level.width).toBe(3);
      expect(level.height).toBe(2);
      expect(level.length).toBe(6 + FOOTER_BYTE_LENGTH);

      expect(level.getTile(0, 0)).toEqual(0);
      expect(level.getTile(2, 1)).toEqual(0);
      expect(level.title).toBe("".padEnd(TITLE_LENGTH));
    });

    it("data", () => {
      const level = createLevel(3, 2, testLevelData);

      expect(dumpLevel(level)).toMatchSnapshot();
    });

    it("throw", () => {
      expect(() => createLevel(3, 2, new Uint8Array(42))).toThrow(
        new Error(
          `Invalid buffer length 42, expected at least ${
            6 + FOOTER_BYTE_LENGTH
          }`,
        ),
      );
    });
  });

  it("raw", () => {
    const level = createLevel(3, 2, testLevelData);
    expect(level.raw).toEqual(testLevelData);
    expect(level.length).toEqual(testLevelData.length);

    const demo = Uint8Array.of(10, 20, 30, 40, 50, 60, 70);
    const next = level.setDemoSeed({ lo: 0x12, hi: 0x34 }).setDemo(demo);
    expect(next.length).toEqual(testLevelData.length + 7 + 2);
    expect(next.length).toEqual(6 + 96 + 7 + 2);

    const modFooter = new Uint8Array(testFooter);
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

  it("copy", () => {
    const a = createLevel(3, 2)
      .setTitle("First level title")
      .setTile(1, 0, 6) as MegaplexLevel;

    let b = a.copy();
    expect(dumpLevel(b)).toEqual(dumpLevel(a));

    b = b.setTitle("Copy level title").setTile(1, 0, 1);
    let dump = dumpLevel(b);
    expect(dump).not.toEqual(dumpLevel(a));
    expect(dump).toMatchSnapshot();
  });

  describe("resize", () => {
    it("simple", () => {
      const a = createLevel(3, 2, testLevelData);

      let b = a.resize(5, 4);
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

      const c = b.resize(3, 2);
      expect(dumpLevel(c)).toEqual(dumpLevel(a));
    });
  });

  it("getTile", () => {
    const level = createLevel(3, 2, testLevelData);

    expect(level.getTile(0, 0)).toEqual(0);
    expect(level.getTile(1, 0)).toEqual(TILE_SP_PORT_U);
    expect(level.getTile(2, 0)).toEqual(4);
    expect(level.getTile(0, 1)).toEqual(1);
    expect(level.getTile(1, 1)).toEqual(3);
    expect(level.getTile(2, 1)).toEqual(5);
  });

  describe("setTile", () => {
    it("usual", () => {
      const level = createLevel(3, 2, testLevelData);
      const copy = level.setTile(2, 0, 7);
      expect(level.getTile(2, 0)).toBe(4);
      expect(level.specPortsCount).toBe(1);
      expect(copy.getTile(2, 0)).toBe(7);
      expect(copy.specPortsCount).toBe(1);
    });

    it("noop", () => {
      const level = createLevel(3, 2, testLevelData);
      expect(level.setTile(2, 0, level.getTile(2, 0))).toBe(level);
    });

    it("add spec port", () => {
      const level = createLevel(3, 2, testLevelData);
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
      const level = createLevel(3, 2, testLevelData);
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
      const level = createLevel(3, 2, testLevelData);
      const copy = level.setTile(1, 0, TILE_ZONK);
      expect(copy.getTile(1, 0)).toBe(TILE_ZONK);
      expect(copy.specPortsCount).toBe(0);
      expect([...copy.getSpecPorts()]).toEqual([]);
    });
  });

  it("findSpecPort", () => {
    const level = createLevel(3, 2, testLevelData);
    expect(level.findSpecPort(1, 0)).toEqual<ISupaplexSpecPortProps>({
      setsGravity: true,
      setsFreezeZonks: true,
      setsFreezeEnemies: true,
    });
  });

  describe("tilesRenderStream", () => {
    it("huge maze", async () => {
      const data = await readExampleFile("HUDEMAZ1.mpx");
      const level = reader.readLevelset(data.buffer).getLevel(0);

      const a = [...level.tilesRenderStream(0, 0, 202, 202)];
      expect(a.length).toBeLessThan(202 * 202);
      expect(a[0]).toEqual([0, 0, 202, TILE_HARDWARE]);
      expect(a[a.length - 1]).toEqual([0, 201, 202, TILE_HARDWARE]);
    });
  });
});
