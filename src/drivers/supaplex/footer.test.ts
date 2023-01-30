import { FOOTER_BYTE_LENGTH, LEVEL_WIDTH, TITLE_LENGTH } from "./formats/std";
import {
  createLevelFooter,
  specPortCoordsToOffset,
  specPortOffsetToCoords,
} from "./footer";
import { ISupaplexSpecPort, ISupaplexSpecPortProps } from "./internal";

it("spec port coords", () => {
  expect(specPortCoordsToOffset(0, 0, 60)).toEqual([0, 0]);
  expect(specPortOffsetToCoords(0, 0, 60)).toEqual([0, 0]);

  expect(
    specPortOffsetToCoords(...specPortCoordsToOffset(0, 59, 60), 60),
  ).toEqual([0, 59]);
  expect(
    specPortOffsetToCoords(...specPortCoordsToOffset(23, 59, 60), 60),
  ).toEqual([23, 59]);
  expect(
    specPortOffsetToCoords(...specPortCoordsToOffset(23, 0, 60), 60),
  ).toEqual([23, 0]);

  expect(() => specPortCoordsToOffset(254, 128, 255)).toThrow(
    new RangeError(
      `Spec port at coords (254, 128) with width 255 cannot be saved`,
    ),
  );
});

describe("footer", () => {
  const testFooterData = Uint8Array.of(
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
    // demo speed extras
    ...[0, 0],
    // demo_seed_lo demo_seed_hi
    ...[0x34, 0x12],
  );
  expect(testFooterData.length).toBe(96);

  describe("constructor", () => {
    it("no params", () => {
      const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);
      expect(footer.initialGravity).toBe(true);
      expect(footer.title).toBe("-- Lorem ipsum --      ");
      expect(footer.initialFreezeZonks).toBe(true);
      expect(footer.infotronsNeed).toBe(42);
      expect(footer.specPortsCount).toBe(1);
      expect([...footer.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
        {
          x: 12,
          y: 12,
          setsGravity: true,
          setsFreezeZonks: true,
          setsFreezeEnemies: true,
        },
      ]);
    });

    it("wrong size", () => {
      expect(() =>
        createLevelFooter(LEVEL_WIDTH, Uint8Array.of(0, 1, 6, 5)),
      ).toThrow(
        new Error(
          `Invalid buffer length 4, expected exactly ${FOOTER_BYTE_LENGTH}`,
        ),
      );
    });
    it("buffer", () => {
      const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

      const copy = footer.setTitle("");
      // and origin was not changed
      expect(testFooterData[6]).toBe("-".charCodeAt(0));
      expect(copy.title).toBe("".padEnd(TITLE_LENGTH));
    });
  });

  it("initialGravity", () => {
    const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

    expect(footer.initialGravity).toBe(true);

    expect(footer.setInitialGravity(true)).toBe(footer);

    const next = footer.setInitialGravity(false);
    expect(next.initialGravity).toBe(false);
    expect(next.setInitialGravity(false)).toBe(next);
    expect(next.setInitialGravity(true).initialGravity).toBe(true);

    expect(footer.initialGravity).toBe(true);
  });

  it("title", () => {
    const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

    expect(footer.title).toBe("-- Lorem ipsum --      ");
    expect(footer.setTitle("-- Lorem ipsum --      ")).toBe(footer);
    expect(footer.setTitle("-- Lorem ipsum --")).toBe(footer);

    expect(footer.setTitle("==== Foo bar ====").title).toBe(
      "==== Foo bar ====      ",
    );
    expect(footer.setTitle("Lorem ipsum dolor sit a").title).toBe(
      "Lorem ipsum dolor sit a",
    );
    expect(footer.setTitle("").title).toBe("                       ");

    expect(() => footer.setTitle("123456789012345678901234")).toThrow(
      new RangeError("Title length exceeds limit"),
    );
    expect(() => footer.setTitle("-- foo \n bar --")).toThrow(
      new Error("Unsupported characters found"),
    );
    expect(() => footer.setTitle("-- foo \x80 bar --")).toThrow(
      new Error("Unsupported characters found"),
    );
    expect(() => footer.setTitle("-- foo \xFF bar --")).toThrow(
      new Error("Unsupported characters found"),
    );
    expect(() => footer.setTitle("-- foo \u00A0 bar --")).toThrow(
      new Error("Unsupported characters found"),
    );

    expect(footer.title).toBe("-- Lorem ipsum --      ");
  });

  it("initialFreezeZonks", () => {
    const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

    expect(footer.initialFreezeZonks).toBe(true);

    expect(footer.setInitialFreezeZonks(true)).toBe(footer);
    const next = footer.setInitialFreezeZonks(false);

    expect(next.initialFreezeZonks).toBe(false);
    expect(next.setInitialFreezeZonks(false)).toBe(next);
    expect(next.setInitialFreezeZonks(true).initialFreezeZonks).toBe(true);

    expect(footer.initialFreezeZonks).toBe(true);
  });

  it("infotronsNeed", () => {
    const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);
    expect(footer.infotronsNeed).toBe(42);

    expect(footer.setInfotronsNeed(42)).toBe(footer);
    expect(footer.setInfotronsNeed(37).infotronsNeed).toBe(37);
    expect(footer.setInfotronsNeed(0).infotronsNeed).toBe(0);

    expect(() => footer.setInfotronsNeed(256)).toThrow(/^Invalid byte -?\d+$/);
    expect(() => footer.setInfotronsNeed(-2)).toThrow(/^Invalid byte -?\d+$/);
  });

  it("copySpecPortsInRegion", () => {
    const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);
    expect(
      footer.copySpecPortsInRegion({ x: 0, y: 0, width: 60, height: 12 }),
    ).toEqual([]);
    expect(
      footer.copySpecPortsInRegion({ x: 0, y: 0, width: 12, height: 24 }),
    ).toEqual([]);
    expect(
      footer.copySpecPortsInRegion({ x: 11, y: 11, width: 3, height: 3 }),
    ).toEqual([
      {
        x: 1,
        y: 1,
        setsGravity: true,
        setsFreezeZonks: true,
        setsFreezeEnemies: true,
      },
    ]);
  });

  it("clearSpecPorts", () => {
    const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

    const next = footer.clearSpecPorts();
    expect(next.specPortsCount).toBe(0);
    expect(next.clearSpecPorts()).toBe(next);
    expect(footer.specPortsCount).toBe(1);
  });

  it("findSpecPort", () => {
    const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

    expect(footer.findSpecPort(12, 12)).toEqual<ISupaplexSpecPortProps>({
      setsGravity: true,
      setsFreezeZonks: true,
      setsFreezeEnemies: true,
    });
    expect(footer.findSpecPort(13, 12)).toBeUndefined();
  });

  describe("setSpecPort", () => {
    it("overflow", () => {
      const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

      const copy = footer
        .setSpecPort(2, 1)
        .setSpecPort(3, 1)
        .setSpecPort(4, 1)
        .setSpecPort(5, 1)
        .setSpecPort(6, 1)
        .setSpecPort(7, 1)
        .setSpecPort(8, 1)
        .setSpecPort(9, 1)
        .setSpecPort(10, 1);

      expect(footer.specPortsCount).toBe(1);
      expect(copy.specPortsCount).toBe(10);
      expect(() => copy.setSpecPort(11, 1)).toThrow(
        new RangeError("Cannot add more spec ports"),
      );
    });

    it("no op", () => {
      const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

      expect(footer.setSpecPort(12, 12)).toBe(footer);
      expect(
        footer.setSpecPort(12, 12, {
          setsGravity: true,
          setsFreezeZonks: true,
          setsFreezeEnemies: true,
        }),
      ).toBe(footer);
    });

    it("update", () => {
      const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

      const copy = footer.setSpecPort(12, 12, {
        setsGravity: false,
        setsFreezeZonks: true,
        setsFreezeEnemies: false,
      });

      expect(footer.specPortsCount).toBe(1);
      expect(copy.specPortsCount).toBe(1);
      expect([...footer.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
        {
          x: 12,
          y: 12,
          setsGravity: true,
          setsFreezeZonks: true,
          setsFreezeEnemies: true,
        },
      ]);
      expect([...copy.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
        {
          x: 12,
          y: 12,
          setsGravity: false,
          setsFreezeZonks: true,
          setsFreezeEnemies: false,
        },
      ]);
    });
  });

  describe("deleteSpecPort", () => {
    it("no op", () => {
      const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

      expect(footer.deleteSpecPort(10, 1)).toBe(footer);

      expect(footer.specPortsCount).toBe(1);
      expect([...footer.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
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
      const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

      const copy = footer
        .setSpecPort(10, 1, {
          setsGravity: true,
          setsFreezeZonks: false,
          setsFreezeEnemies: true,
        })
        .deleteSpecPort(12, 12);

      expect(copy.specPortsCount).toBe(1);
      expect([...copy.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
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

  it("demo seed", () => {
    const footer = createLevelFooter(LEVEL_WIDTH, testFooterData);

    const seed1 = { lo: 0x34, hi: 0x12 };
    const seed2 = { lo: 0xdd, hi: 0xcc };

    expect(footer.demoSeed).toEqual(seed1);
    expect(footer.setDemoSeed(seed1)).toBe(footer);

    const next = footer.setDemoSeed(seed2);
    expect(next.demoSeed).toEqual(seed2);
    expect(next).not.toBe(footer);
    expect(footer.demoSeed).toEqual(seed1);
  });

  it("demo", () => {
    const srcMain = new Uint8Array(FOOTER_BYTE_LENGTH);
    srcMain.set(
      ""
        .padEnd(23)
        .split("")
        .map((ch) => ch.charCodeAt(0)),
      6,
    );

    const src = Uint8Array.of(
      ...srcMain,
      0,
      10,
      20,
      30,
      40,
      50,
      60,
      42,
      0,
      23,
      0xff,
    );

    let footer = createLevelFooter(1, src);
    expect(footer.demo).toEqual(
      Uint8Array.of(10, 20, 30, 40, 50, 60, 42, 0, 23),
    );
    expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + 9 + 2);

    footer = footer.setDemo(Uint8Array.of(2, 4, 8));
    expect(footer.demo).toEqual(Uint8Array.of(2, 4, 8));
    expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + 3 + 2);
    expect(footer.getRaw()).toEqual(
      Uint8Array.of(...srcMain, 0, 2, 4, 8, 0xff),
    );

    footer = footer.setDemo(Uint8Array.of(11, 13, 17, 19, 23));
    expect(footer.demo).toEqual(Uint8Array.of(11, 13, 17, 19, 23));
    expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + 5 + 2);
    expect(footer.getRaw()).toEqual(
      Uint8Array.of(...srcMain, 0, 11, 13, 17, 19, 23, 0xff),
    );

    footer = footer.setDemo(null);
    expect(footer.demo).toBe(null);
    expect(footer.length).toEqual(FOOTER_BYTE_LENGTH);
    expect(footer.getRaw()).toEqual(srcMain);

    footer = createLevelFooter(1, srcMain);
    expect(footer.demo).toBe(null);
    expect(footer.length).toEqual(FOOTER_BYTE_LENGTH);
    expect(footer.getRaw()).toEqual(srcMain);

    footer = createLevelFooter(1);
    expect(footer.demo).toBe(null);
    expect(footer.length).toEqual(FOOTER_BYTE_LENGTH);
    expect(footer.getRaw()).toEqual(srcMain);
  });

  it("usePlasma", () => {
    const footer = createLevelFooter(LEVEL_WIDTH);

    expect(footer.usePlasma).toBe(false);
    expect(footer.setUsePlasma(false)).toBe(footer);

    const next = footer.setUsePlasma(true);
    expect(next.usePlasma).toBe(true);
    expect(next.setUsePlasma(true)).toBe(next);

    expect(footer.usePlasma).toBe(false);
  });

  it("useZonker", () => {
    const footer = createLevelFooter(LEVEL_WIDTH);

    expect(footer.useZonker).toBe(false);
    expect(footer.setUseZonker(false)).toBe(footer);

    const next = footer.setUseZonker(true);
    expect(next.useZonker).toBe(true);
    expect(next.setUseZonker(true)).toBe(next);

    expect(footer.useZonker).toBe(false);
  });
});
