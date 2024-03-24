import {
  newSpecPortRecord,
  newSpecPortRecordFromBytes,
  newSpecPortRecordFromString,
  specPortCoordsToOffset,
  specPortOffsetToCoords,
} from "./specPortsRecord";
import {
  FreezeEnemiesStatic,
  FreezeZonksStatic,
  GravityStatic,
  SpecPortAlterMod,
} from "./internal";
import { TILE_PORT_U, TILE_SP_PORT_U } from "./tiles-id";

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

describe("SpecPortRecord", () => {
  describe("read-write", () => {
    const zero = newSpecPortRecord(0, 0);

    afterAll(() => {
      expect(zero.x).toBe(0);
      expect(zero.y).toBe(0);
      expect(zero.gravity).toBe(GravityStatic.OFF);
      expect(zero.freezeZonks).toBe(FreezeZonksStatic.OFF);
      expect(zero.freezeEnemies).toBe(FreezeEnemiesStatic.OFF);
      expect(zero.unusedByte).toBe(0);
    });

    it("no-op", () => {
      expect(zero.setX(0)).toBe(zero);
      expect(zero.setY(0)).toBe(zero);
      expect(zero.setGravity(GravityStatic.OFF)).toBe(zero);
      expect(zero.setFreezeZonks(FreezeZonksStatic.OFF)).toBe(zero);
      expect(zero.setFreezeEnemies(FreezeEnemiesStatic.OFF)).toBe(zero);
      expect(zero.setUnusedByte(0)).toBe(zero);
    });

    it("set x", () => {
      const b = zero.setX(10);
      expect(b).not.toBe(zero);
      expect(b.x).toBe(10);
    });
    it("set y", () => {
      const b = zero.setY(20);
      expect(b).not.toBe(zero);
      expect(b.y).toBe(20);
    });
    it("set gravity", () => {
      const on = zero.setGravity(GravityStatic.ON);
      expect(on).not.toBe(zero);
      expect(on.gravity).toBe(GravityStatic.ON);

      const off = on.setGravity(GravityStatic.OFF);
      expect(off).not.toBe(on);
      expect(off.gravity).toBe(GravityStatic.OFF);

      const keep1 = zero.setGravity(SpecPortAlterMod.NOTHING);
      expect(keep1).not.toBe(zero);
      expect(keep1.gravity).toBe(SpecPortAlterMod.NOTHING);

      const keep2 = on.setGravity(SpecPortAlterMod.NOTHING);
      expect(keep2).not.toBe(on);
      expect(keep2.gravity).toBe(SpecPortAlterMod.NOTHING);

      const toggle1 = zero.setGravity(SpecPortAlterMod.TOGGLE);
      expect(toggle1).not.toBe(zero);
      expect(toggle1.gravity).toBe(SpecPortAlterMod.TOGGLE);

      const toggle2 = on.setGravity(SpecPortAlterMod.TOGGLE);
      expect(toggle2).not.toBe(on);
      expect(toggle2.gravity).toBe(SpecPortAlterMod.TOGGLE);
    });
    it("set freeze zonks", () => {
      const on = zero.setFreezeZonks(FreezeZonksStatic.ON);
      expect(on).not.toBe(zero);
      expect(on.freezeZonks).toBe(FreezeZonksStatic.ON);

      const off = on.setFreezeZonks(FreezeZonksStatic.OFF);
      expect(off).not.toBe(on);
      expect(off.freezeZonks).toBe(FreezeZonksStatic.OFF);

      const keep1 = zero.setFreezeZonks(SpecPortAlterMod.NOTHING);
      expect(keep1).not.toBe(zero);
      expect(keep1.freezeZonks).toBe(SpecPortAlterMod.NOTHING);

      const keep2 = on.setFreezeZonks(SpecPortAlterMod.NOTHING);
      expect(keep2).not.toBe(on);
      expect(keep2.freezeZonks).toBe(SpecPortAlterMod.NOTHING);

      const toggle1 = zero.setFreezeZonks(SpecPortAlterMod.TOGGLE);
      expect(toggle1).not.toBe(zero);
      expect(toggle1.freezeZonks).toBe(SpecPortAlterMod.TOGGLE);

      const toggle2 = on.setFreezeZonks(SpecPortAlterMod.TOGGLE);
      expect(toggle2).not.toBe(on);
      expect(toggle2.freezeZonks).toBe(SpecPortAlterMod.TOGGLE);
    });
    it("set freeze enemies", () => {
      const on = zero.setFreezeEnemies(FreezeEnemiesStatic.ON);
      expect(on).not.toBe(zero);
      expect(on.freezeEnemies).toBe(FreezeEnemiesStatic.ON);

      const off = on.setFreezeEnemies(FreezeEnemiesStatic.OFF);
      expect(off).not.toBe(on);
      expect(off.freezeEnemies).toBe(FreezeEnemiesStatic.OFF);

      const keep1 = zero.setFreezeEnemies(SpecPortAlterMod.NOTHING);
      expect(keep1).not.toBe(zero);
      expect(keep1.freezeEnemies).toBe(SpecPortAlterMod.NOTHING);

      const keep2 = on.setFreezeEnemies(SpecPortAlterMod.NOTHING);
      expect(keep2).not.toBe(on);
      expect(keep2.freezeEnemies).toBe(SpecPortAlterMod.NOTHING);

      const toggle1 = zero.setFreezeEnemies(SpecPortAlterMod.TOGGLE);
      expect(toggle1).not.toBe(zero);
      expect(toggle1.freezeEnemies).toBe(SpecPortAlterMod.TOGGLE);

      const toggle2 = on.setFreezeEnemies(SpecPortAlterMod.TOGGLE);
      expect(toggle2).not.toBe(on);
      expect(toggle2.freezeEnemies).toBe(SpecPortAlterMod.TOGGLE);
    });
    it("set unused byte", () => {
      const b = zero.setUnusedByte(60);
      expect(b).not.toBe(zero);
      expect(b.unusedByte).toBe(60);
    });
  });

  describe("io", () => {
    const WIDTH = 613;
    const ok = newSpecPortRecord(278, 53)
      .setGravity(GravityStatic.ON)
      .setFreezeZonks(FreezeZonksStatic.ON)
      .setFreezeEnemies(FreezeEnemiesStatic.ON)
      .setUnusedByte(42);

    it("ok", () => {
      expect(ok.isStdCompatible(WIDTH, TILE_SP_PORT_U)).toBe(true);
      // > ((53 * 613 + 278) * 2).toString(16)
      //   => 'fffe'
      expect(ok.toRaw(WIDTH)).toEqual(Uint8Array.of(0xff, 0xfe, 1, 2, 1, 42));
      expect(ok.toString()).toBe("x278y53g1z2e1u42");
    });
    it("zero", () => {
      const zero = newSpecPortRecord(0, 0);
      expect(zero.isStdCompatible(WIDTH, TILE_SP_PORT_U)).toBe(true);
      expect(zero.toRaw(WIDTH)).toEqual(Uint8Array.of(0, 0, 0, 0, 0, 0));
      expect(zero.toString()).toBe("x0y0");
    });

    it("x overflow", () => {
      const bad = ok.setX(279);

      expect(bad.isStdCompatible(WIDTH, TILE_SP_PORT_U)).toBe(false);
      // > ((53 * 613 + 279) * 2).toString(16)
      //   => '10000'
      expect(bad.toRaw(WIDTH)).toEqual(Uint8Array.of(0x0, 0x0, 1, 2, 1, 42));
      expect(bad.toString()).toBe("x279y53g1z2e1u42");
    });
    it("y overflow", () => {
      const bad = ok.setY(54);

      expect(bad.isStdCompatible(WIDTH, TILE_SP_PORT_U)).toBe(false);
      // > ((54 * 613 + 278) * 2).toString(16)
      //   => '104c8'
      expect(bad.toRaw(WIDTH)).toEqual(Uint8Array.of(0x04, 0xc8, 1, 2, 1, 42));
      expect(bad.toString()).toBe("x278y54g1z2e1u42");
    });
    it("gravity keep", () => {
      const bad = ok.setGravity(SpecPortAlterMod.NOTHING);

      expect(bad.isStdCompatible(WIDTH, TILE_SP_PORT_U)).toBe(false);
      expect(bad.toRaw(WIDTH)).toEqual(Uint8Array.of(0xff, 0xfe, 0, 2, 1, 42));
      expect(bad.toString()).toBe("x278y53g-1z2e1u42");
    });
    it("gravity toggle", () => {
      const bad = ok.setGravity(SpecPortAlterMod.TOGGLE);

      expect(bad.isStdCompatible(WIDTH, TILE_SP_PORT_U)).toBe(false);
      expect(bad.toRaw(WIDTH)).toEqual(Uint8Array.of(0xff, 0xfe, 0, 2, 1, 42));
      expect(bad.toString()).toBe("x278y53g-2z2e1u42");
    });
    it("freeze zonks keep", () => {
      const bad = ok.setFreezeZonks(SpecPortAlterMod.NOTHING);

      expect(bad.isStdCompatible(WIDTH, TILE_SP_PORT_U)).toBe(false);
      expect(bad.toRaw(WIDTH)).toEqual(Uint8Array.of(0xff, 0xfe, 1, 0, 1, 42));
      expect(bad.toString()).toBe("x278y53g1z-1e1u42");
    });
    it("freeze zonks toggle", () => {
      const bad = ok.setFreezeZonks(SpecPortAlterMod.TOGGLE);

      expect(bad.isStdCompatible(WIDTH, TILE_SP_PORT_U)).toBe(false);
      expect(bad.toRaw(WIDTH)).toEqual(Uint8Array.of(0xff, 0xfe, 1, 0, 1, 42));
      expect(bad.toString()).toBe("x278y53g1z-2e1u42");
    });
    it("freeze enemies keep", () => {
      const bad = ok.setFreezeEnemies(SpecPortAlterMod.NOTHING);

      expect(bad.isStdCompatible(WIDTH, TILE_SP_PORT_U)).toBe(false);
      expect(bad.toRaw(WIDTH)).toEqual(Uint8Array.of(0xff, 0xfe, 1, 2, 0, 42));
      expect(bad.toString()).toBe("x278y53g1z2e-1u42");
    });
    it("freeze enemies toggle", () => {
      const bad = ok.setFreezeEnemies(SpecPortAlterMod.TOGGLE);

      expect(bad.isStdCompatible(WIDTH, TILE_SP_PORT_U)).toBe(false);
      expect(bad.toRaw(WIDTH)).toEqual(Uint8Array.of(0xff, 0xfe, 1, 2, 0, 42));
      expect(bad.toString()).toBe("x278y53g1z2e-2u42");
    });
    it("not spe-port tile", () => {
      const zero = newSpecPortRecord(0, 0);
      expect(zero.isStdCompatible(WIDTH, TILE_PORT_U)).toBe(false);
    });
  });

  describe("from bytes", () => {
    it("zero", () => {
      const zero = newSpecPortRecordFromBytes(new Uint8Array(6), 60);
      expect(zero.x).toBe(0);
      expect(zero.y).toBe(0);
      expect(zero.gravity).toBe(GravityStatic.OFF);
      expect(zero.freezeZonks).toBe(FreezeZonksStatic.OFF);
      expect(zero.freezeEnemies).toBe(FreezeEnemiesStatic.OFF);
      expect(zero.unusedByte).toBe(0);
    });

    it("invalid buffer", () => {
      expect(() => newSpecPortRecordFromBytes(new Uint8Array(0), 60)).toThrow();
      expect(() => newSpecPortRecordFromBytes(new Uint8Array(5), 60)).toThrow();
      expect(() => newSpecPortRecordFromBytes(new Uint8Array(7), 60)).toThrow();
    });

    it("data", () => {
      const p = newSpecPortRecordFromBytes(
        Uint8Array.of(0xff, 0xfe, 1, 2, 1, 42),
        613,
      );
      expect(p.x).toBe(278);
      expect(p.y).toBe(53);
      expect(p.gravity).toBe(GravityStatic.ON);
      expect(p.freezeZonks).toBe(FreezeZonksStatic.ON);
      expect(p.freezeEnemies).toBe(FreezeEnemiesStatic.ON);
      expect(p.unusedByte).toBe(42);
    });

    it("is transparent", () => {
      expect(
        newSpecPortRecordFromBytes(
          Uint8Array.of(10, 20, 30, 40, 50, 60),
          42,
        ).toRaw(42),
      ).toEqual(Uint8Array.of(10, 20, 30, 40, 50, 60));
    });
  });

  describe("from string", () => {
    it("zero", () => {
      const zero = newSpecPortRecordFromString("");
      expect(zero.x).toBe(0);
      expect(zero.y).toBe(0);
      expect(zero.gravity).toBe(GravityStatic.OFF);
      expect(zero.freezeZonks).toBe(FreezeZonksStatic.OFF);
      expect(zero.freezeEnemies).toBe(FreezeEnemiesStatic.OFF);
      expect(zero.unusedByte).toBe(0);
    });
    it("x", () => {
      expect(newSpecPortRecordFromString("x10").x).toBe(10);
      expect(newSpecPortRecordFromString("x98765").x).toBe(98765);
    });
    it("y", () => {
      expect(newSpecPortRecordFromString("y20").y).toBe(20);
      expect(newSpecPortRecordFromString("y98765").y).toBe(98765);
    });
    it("gravity", () => {
      expect(newSpecPortRecordFromString("g0").gravity).toBe(GravityStatic.OFF);
      expect(newSpecPortRecordFromString("g1").gravity).toBe(GravityStatic.ON);
      expect(newSpecPortRecordFromString("g2").gravity).toBe(2);
      expect(newSpecPortRecordFromString("g42").gravity).toBe(42);
      expect(newSpecPortRecordFromString("g-1").gravity).toBe(
        SpecPortAlterMod.NOTHING,
      );
      expect(newSpecPortRecordFromString("g-2").gravity).toBe(
        SpecPortAlterMod.TOGGLE,
      );
      expect(newSpecPortRecordFromString("g-265").gravity).toBe(
        SpecPortAlterMod.NOTHING,
      );
    });
    it("freeze zonks", () => {
      expect(newSpecPortRecordFromString("z0").freezeZonks).toBe(
        FreezeZonksStatic.OFF,
      );
      expect(newSpecPortRecordFromString("z1").freezeZonks).toBe(1);
      expect(newSpecPortRecordFromString("z2").freezeZonks).toBe(
        FreezeZonksStatic.ON,
      );
      expect(newSpecPortRecordFromString("z42").freezeZonks).toBe(42);
      expect(newSpecPortRecordFromString("z-1").freezeZonks).toBe(
        SpecPortAlterMod.NOTHING,
      );
      expect(newSpecPortRecordFromString("z-2").freezeZonks).toBe(
        SpecPortAlterMod.TOGGLE,
      );
      expect(newSpecPortRecordFromString("z-265").freezeZonks).toBe(
        SpecPortAlterMod.NOTHING,
      );
    });
    it("freeze enemies", () => {
      expect(newSpecPortRecordFromString("e0").freezeEnemies).toBe(
        FreezeEnemiesStatic.OFF,
      );
      expect(newSpecPortRecordFromString("e1").freezeEnemies).toBe(
        FreezeEnemiesStatic.ON,
      );
      expect(newSpecPortRecordFromString("e2").freezeEnemies).toBe(2);
      expect(newSpecPortRecordFromString("e42").freezeEnemies).toBe(42);
      expect(newSpecPortRecordFromString("e-1").freezeEnemies).toBe(
        SpecPortAlterMod.NOTHING,
      );
      expect(newSpecPortRecordFromString("e-2").freezeEnemies).toBe(
        SpecPortAlterMod.TOGGLE,
      );
      expect(newSpecPortRecordFromString("e-265").freezeEnemies).toBe(
        SpecPortAlterMod.NOTHING,
      );
    });

    it("is transparent", () => {
      const s1 = "x10y20g30z40e50u60";
      const s2 = "x10y20g-1z-1e-1u60";
      const s3 = "x10y20g-2z-2e-2u60";
      expect(newSpecPortRecordFromString(s1).toString()).toBe(s1);
      expect(newSpecPortRecordFromString(s2).toString()).toBe(s2);
      expect(newSpecPortRecordFromString(s3).toString()).toBe(s3);
    });
  });
});
