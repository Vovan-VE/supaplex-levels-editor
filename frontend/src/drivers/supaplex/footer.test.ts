import { FOOTER_BYTE_LENGTH, LEVEL_WIDTH, TITLE_LENGTH } from "./formats/std";
import { createLevelFooter } from "./footer";

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

  describe("demo", () => {
    const srcMain = new Uint8Array(FOOTER_BYTE_LENGTH);
    srcMain.set(
      ""
        .padEnd(23)
        .split("")
        .map((ch) => ch.charCodeAt(0)),
      6,
    );

    const demoA = Uint8Array.of(10, 20, 30, 40, 50, 60, 42, 0, 23);
    const srcDemoOnly = Uint8Array.of(...srcMain, 0, ...demoA, 0xff);

    const signatureA = Uint8Array.of(
      ...Array.from("Lorem ipsum dolor\nsit amet.", (s) => s.charCodeAt(0)),
    );
    const srcDemoSignature = Uint8Array.of(...srcDemoOnly, ...signatureA, 0xff);

    const demo1 = Uint8Array.of(2, 4, 8);
    const demo2 = Uint8Array.of(11, 13, 17, 19, 23);
    const signature1 = Uint8Array.of(
      ...Array.from("Foo bar", (s) => s.charCodeAt(0)),
    );

    const srcSignatureOnly = Uint8Array.of(
      ...srcMain,
      0,
      0xff,
      ...signatureA,
      0xff,
    );

    it("demo only", () => {
      let footer = createLevelFooter(1, srcDemoOnly);
      expect(footer.demo).toEqual(demoA);
      expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + demoA.length + 2);

      footer = footer.setDemo(demo1);
      expect(footer.demo).toEqual(demo1);
      expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + demo1.length + 2);
      expect(footer.getRaw()).toEqual(
        Uint8Array.of(...srcMain, 0, ...demo1, 0xff),
      );

      footer = footer.setDemo(demo2);
      expect(footer.demo).toEqual(demo2);
      expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + demo2.length + 2);
      expect(footer.getRaw()).toEqual(
        Uint8Array.of(...srcMain, 0, ...demo2, 0xff),
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

    it("demo with signature", () => {
      let footer = createLevelFooter(1, srcDemoSignature);
      expect(footer.demo).toEqual(demoA);
      expect(footer.signature).toEqual(signatureA);
      expect(footer.length).toEqual(
        FOOTER_BYTE_LENGTH + demoA.length + signatureA.length + 3,
      );
      expect(footer.getRaw()).toEqual(
        Uint8Array.of(...srcMain, 0, ...demoA, 0xff, ...signatureA, 0xff),
      );

      footer = footer.setDemo(demo1);
      expect(footer.demo).toEqual(demo1);
      expect(footer.signature).toEqual(signatureA);
      expect(footer.length).toEqual(
        FOOTER_BYTE_LENGTH + demo1.length + signatureA.length + 3,
      );
      expect(footer.getRaw()).toEqual(
        Uint8Array.of(...srcMain, 0, ...demo1, 0xff, ...signatureA, 0xff),
      );

      footer = footer.setSignature(signature1);
      expect(footer.demo).toEqual(demo1);
      expect(footer.signature).toEqual(signature1);
      expect(footer.length).toEqual(
        FOOTER_BYTE_LENGTH + demo1.length + signature1.length + 3,
      );
      expect(footer.getRaw()).toEqual(
        Uint8Array.of(...srcMain, 0, ...demo1, 0xff, ...signature1, 0xff),
      );

      footer = footer.setDemo(null);
      expect(footer.demo).toBe(null);
      expect(footer.signature).toEqual(signature1);
      expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + signature1.length + 3);
      expect(footer.getRaw()).toEqual(
        Uint8Array.of(...srcMain, 0, 0xff, ...signature1, 0xff),
      );

      footer = footer.setSignature(null);
      expect(footer.demo).toBe(null);
      expect(footer.signature).toBe(null);
      expect(footer.length).toEqual(FOOTER_BYTE_LENGTH);
      expect(footer.getRaw()).toEqual(srcMain);
    });

    it("signature only", () => {
      let footer = createLevelFooter(1, srcSignatureOnly);
      expect(footer.demo).toBe(null);
      expect(footer.signature).toEqual(signatureA);
      expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + signatureA.length + 3);
      expect(footer.getRaw()).toEqual(
        Uint8Array.of(...srcMain, 0, 0xff, ...signatureA, 0xff),
      );

      footer = footer.setDemo(demo1);
      expect(footer.demo).toEqual(demo1);
      expect(footer.signature).toEqual(signatureA);
      expect(footer.length).toEqual(
        FOOTER_BYTE_LENGTH + demo1.length + signatureA.length + 3,
      );
      expect(footer.getRaw()).toEqual(
        Uint8Array.of(...srcMain, 0, ...demo1, 0xff, ...signatureA, 0xff),
      );

      footer = footer.setSignature(null);
      expect(footer.demo).toEqual(demo1);
      expect(footer.signature).toBe(null);
      expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + demo1.length + 2);
      expect(footer.getRaw()).toEqual(
        Uint8Array.of(...srcMain, 0, ...demo1, 0xff),
      );
    });
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

  it("usePlasmaLimit", () => {
    const footer = createLevelFooter(LEVEL_WIDTH);

    expect(footer.usePlasmaLimit).toBe(undefined);
    expect(footer.setUsePlasmaLimit(undefined)).toBe(footer);

    const next = footer.setUsePlasmaLimit(42);
    expect(next.usePlasmaLimit).toBe(42);
    expect(next.setUsePlasmaLimit(42)).toBe(next);

    expect(footer.usePlasmaLimit).toBe(undefined);
  });

  it("usePlasmaTime", () => {
    const footer = createLevelFooter(LEVEL_WIDTH);

    expect(footer.usePlasmaTime).toBe(undefined);
    expect(footer.setUsePlasmaTime(undefined)).toBe(footer);

    const next = footer.setUsePlasmaTime(42);
    expect(next.usePlasmaTime).toBe(42);
    expect(next.setUsePlasmaTime(42)).toBe(next);

    expect(footer.usePlasmaTime).toBe(undefined);
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

  it("useSerialPorts", () => {
    const footer = createLevelFooter(LEVEL_WIDTH);

    expect(footer.useSerialPorts).toBe(false);
    expect(footer.setUseSerialPorts(false)).toBe(footer);

    const next = footer.setUseSerialPorts(true);
    expect(next.useSerialPorts).toBe(true);
    expect(next.setUseSerialPorts(true)).toBe(next);

    expect(footer.useSerialPorts).toBe(false);
  });

  it("useInfotronsNeeded", () => {
    const footer = createLevelFooter(LEVEL_WIDTH);

    expect(footer.useInfotronsNeeded).toBe(undefined);
    expect(footer.setUseInfotronsNeeded(undefined)).toBe(footer);

    const next = footer.setUseInfotronsNeeded(42);
    expect(next.useInfotronsNeeded).toBe(42);
    expect(next.setUseInfotronsNeeded(42)).toBe(next);

    expect(footer.useInfotronsNeeded).toBe(undefined);
  });
});
