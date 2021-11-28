import {
  FOOTER_BYTE_LENGTH,
  LevelFooter,
  specPortCoordsToOffset,
  specPortOffsetToCoords,
} from "./footer";
import { LEVEL_WIDTH } from "./box";
import { ISupaplexSpecPort, ISupaplexSpecPortProps } from "./types";

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
    ...[0, 0, 0, 0],
  );
  expect(testFooterData.length).toBe(96);

  describe("constructor", () => {
    it("no params", () => {
      const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);
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
      expect(
        () => new LevelFooter(LEVEL_WIDTH, Uint8Array.of(0, 1, 6, 5)),
      ).toThrow(
        new Error(
          `Invalid buffer length 4, expected at least ${FOOTER_BYTE_LENGTH}`,
        ),
      );
    });
    it("buffer", () => {
      const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

      // it operates on copy
      footer.title = "";
      // and origin was not changed
      expect(testFooterData[6]).toBe("-".charCodeAt(0));
    });
  });

  it("initialGravity", () => {
    const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

    expect(footer.initialGravity).toBe(true);

    footer.initialGravity = false;
    expect(footer.initialGravity).toBe(false);

    footer.initialGravity = true;
    expect(footer.initialGravity).toBe(true);
  });

  it("title", () => {
    const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

    expect(footer.title).toBe("-- Lorem ipsum --      ");

    footer.title = "==== Foo bar ====";
    expect(footer.title).toBe("==== Foo bar ====      ");

    footer.title = "Lorem ipsum dolor sit a";
    expect(footer.title).toBe("Lorem ipsum dolor sit a");

    footer.title = "";
    expect(footer.title).toBe("                       ");

    expect(() => {
      footer.title = "123456789012345678901234";
    }).toThrow(new RangeError("Title length exceeds limit"));

    expect(() => {
      footer.title = "-- foo \n bar --";
    }).toThrow(new Error("Unsupported characters found"));
    expect(() => {
      footer.title = "-- foo \x80 bar --";
    }).toThrow(new Error("Unsupported characters found"));
    expect(() => {
      footer.title = "-- foo \xFF bar --";
    }).toThrow(new Error("Unsupported characters found"));
    expect(() => {
      footer.title = "-- foo \u00A0 bar --";
    }).toThrow(new Error("Unsupported characters found"));
  });

  it("initialFreezeZonks", () => {
    const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

    expect(footer.initialFreezeZonks).toBe(true);

    footer.initialFreezeZonks = false;
    expect(footer.initialFreezeZonks).toBe(false);

    footer.initialFreezeZonks = true;
    expect(footer.initialFreezeZonks).toBe(true);
  });

  it("infotronsNeed", () => {
    const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);
    expect(footer.infotronsNeed).toBe(42);

    footer.infotronsNeed = 37;
    expect(footer.infotronsNeed).toBe(37);

    footer.infotronsNeed = "all";
    expect(footer.infotronsNeed).toBe("all");

    expect(() => {
      footer.infotronsNeed = 0;
    }).toThrow(
      new RangeError("Value cannot be 0 since it has special meaning"),
    );
    expect(() => {
      footer.infotronsNeed = 256;
    }).toThrow(/^Invalid byte -?\d+$/);
    expect(() => {
      footer.infotronsNeed = 257;
    }).toThrow(/^Invalid byte -?\d+$/);
  });

  it("clearSpecPorts", () => {
    const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

    footer.clearSpecPorts();
    expect(footer.specPortsCount).toBe(0);
  });

  it("findSpecPort", () => {
    const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

    expect(footer.findSpecPort(12, 12)).toEqual<ISupaplexSpecPortProps>({
      setsGravity: true,
      setsFreezeZonks: true,
      setsFreezeEnemies: true,
    });
    expect(footer.findSpecPort(13, 12)).toBeUndefined();
  });

  describe("setSpecPort", () => {
    it("overflow", () => {
      const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

      footer.setSpecPort(2, 1);
      footer.setSpecPort(3, 1);
      footer.setSpecPort(4, 1);
      footer.setSpecPort(5, 1);
      footer.setSpecPort(6, 1);
      footer.setSpecPort(7, 1);
      footer.setSpecPort(8, 1);
      footer.setSpecPort(9, 1);
      footer.setSpecPort(10, 1);
      expect(footer.specPortsCount).toBe(10);
      expect(() => footer.setSpecPort(11, 1)).toThrow(
        new RangeError("Cannot add more spec ports"),
      );
    });

    it("no op", () => {
      const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

      footer.setSpecPort(12, 12);

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

    it("update", () => {
      const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

      footer.setSpecPort(12, 12, {
        setsGravity: false,
        setsFreezeZonks: true,
        setsFreezeEnemies: false,
      });

      expect(footer.specPortsCount).toBe(1);
      expect([...footer.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
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
      const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

      footer.deleteSpecPort(10, 1);

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
      const footer = new LevelFooter(LEVEL_WIDTH, testFooterData);

      footer.setSpecPort(10, 1, {
        setsGravity: true,
        setsFreezeZonks: false,
        setsFreezeEnemies: true,
      });
      footer.deleteSpecPort(12, 12);

      expect(footer.specPortsCount).toBe(1);
      expect([...footer.getSpecPorts()]).toEqual<ISupaplexSpecPort[]>([
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
