import {
  createLevelFooter,
  FOOTER_BYTE_LENGTH,
  specPortCoordsToOffset,
  specPortOffsetToCoords,
  TITLE_LENGTH,
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
      const footer = createLevelFooter(testFooterData);
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
      expect(() => createLevelFooter(Uint8Array.of(0, 1, 6, 5))).toThrow(
        new Error(
          `Invalid buffer length 4, expected exactly ${FOOTER_BYTE_LENGTH}`,
        ),
      );
    });
    it("buffer", () => {
      const footer = createLevelFooter(testFooterData);

      const copy = footer.setTitle("");
      // and origin was not changed
      expect(testFooterData[6]).toBe("-".charCodeAt(0));
      expect(copy.title).toBe("".padEnd(TITLE_LENGTH));
    });
  });

  it("initialGravity", () => {
    const footer = createLevelFooter(testFooterData);

    expect(footer.initialGravity).toBe(true);

    expect(footer.setInitialGravity(true)).toBe(footer);

    const next = footer.setInitialGravity(false);
    expect(next.initialGravity).toBe(false);
    expect(next.setInitialGravity(false)).toBe(next);
    expect(next.setInitialGravity(true).initialGravity).toBe(true);

    expect(footer.initialGravity).toBe(true);
  });

  it("title", () => {
    const footer = createLevelFooter(testFooterData);

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
    const footer = createLevelFooter(testFooterData);

    expect(footer.initialFreezeZonks).toBe(true);

    expect(footer.setInitialFreezeZonks(true)).toBe(footer);
    const next = footer.setInitialFreezeZonks(false);

    expect(next.initialFreezeZonks).toBe(false);
    expect(next.setInitialFreezeZonks(false)).toBe(next);
    expect(next.setInitialFreezeZonks(true).initialFreezeZonks).toBe(true);

    expect(footer.initialFreezeZonks).toBe(true);
  });

  it("infotronsNeed", () => {
    const footer = createLevelFooter(testFooterData);
    expect(footer.infotronsNeed).toBe(42);

    expect(footer.setInfotronsNeed(42)).toBe(footer);
    expect(footer.setInfotronsNeed(37).infotronsNeed).toBe(37);
    expect(footer.setInfotronsNeed(0).infotronsNeed).toBe(0);

    expect(() => footer.setInfotronsNeed(256)).toThrow(/^Invalid byte -?\d+$/);
    expect(() => footer.setInfotronsNeed(-2)).toThrow(/^Invalid byte -?\d+$/);
  });

  it("clearSpecPorts", () => {
    const footer = createLevelFooter(testFooterData);

    const next = footer.clearSpecPorts();
    expect(next.specPortsCount).toBe(0);
    expect(next.clearSpecPorts()).toBe(next);
    expect(footer.specPortsCount).toBe(1);
  });

  it("findSpecPort", () => {
    const footer = createLevelFooter(testFooterData);

    expect(footer.findSpecPort(12, 12)).toEqual<ISupaplexSpecPortProps>({
      setsGravity: true,
      setsFreezeZonks: true,
      setsFreezeEnemies: true,
    });
    expect(footer.findSpecPort(13, 12)).toBeUndefined();
  });

  describe("setSpecPort", () => {
    it("overflow", () => {
      const footer = createLevelFooter(testFooterData);

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
      const footer = createLevelFooter(testFooterData);

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
      const footer = createLevelFooter(testFooterData);

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
      const footer = createLevelFooter(testFooterData);

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
      const footer = createLevelFooter(testFooterData);

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
    const footer = createLevelFooter(testFooterData);

    const seed1 = { lo: 0x34, hi: 0x12 };
    const seed2 = { lo: 0xdd, hi: 0xcc };

    expect(footer.demoSeed).toEqual(seed1);
    expect(footer.setDemoSeed(seed1)).toBe(footer);

    const next = footer.setDemoSeed(seed2);
    expect(next.demoSeed).toEqual(seed2);
    expect(next).not.toBe(footer);
    expect(footer.demoSeed).toEqual(seed1);
  });
});
