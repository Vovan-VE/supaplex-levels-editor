import { newSpecPortsDatabaseFromBytes } from "./specPortsDb";
import { LEVEL_WIDTH } from "./formats/std";
import {
  dumpSpecport,
  dumpSpecports,
  dumpSpecportsArray,
} from "./helpers.dev/dumpSpecports";
import {
  FreezeEnemiesStatic,
  FreezeZonksStatic,
  GravityStatic,
} from "./internal";
import { newSpecPortRecord } from "./specPortsRecord";

describe("basic", () => {
  const testDbCount = 1;
  const testDbData = Uint8Array.of(
    ..."\x05\xB8\x01\x02\x01\x00"
      .padEnd(10 * 6, "\x00")
      .split("")
      .map((c) => c.charCodeAt(0)),
  );
  const db = newSpecPortsDatabaseFromBytes(
    testDbData,
    testDbCount,
    LEVEL_WIDTH,
  );
  const textPort1 = newSpecPortRecord(12, 12)
    .setGravity(GravityStatic.ON)
    .setFreezeZonks(FreezeZonksStatic.ON)
    .setFreezeEnemies(FreezeEnemiesStatic.ON);

  afterEach(() => {
    expect(db.count).toBe(testDbCount);
    expect(dumpSpecports(db)).toEqual(dumpSpecportsArray([textPort1]));
  });

  it("io", () => {
    expect(db.toString()).toBe("x12y12g1z2e1");
    expect(db.toRaw(LEVEL_WIDTH)).toEqual(testDbData);
  });

  it("copySpecPortsInRegion", () => {
    expect(
      db.copySpecPortsInRegion({ x: 0, y: 0, width: 60, height: 12 }),
    ).toEqual([]);
    expect(
      db.copySpecPortsInRegion({ x: 0, y: 0, width: 12, height: 24 }),
    ).toEqual([]);
    expect(
      dumpSpecportsArray(
        db.copySpecPortsInRegion({ x: 11, y: 11, width: 3, height: 3 }),
      ),
    ).toEqual(
      dumpSpecportsArray([
        newSpecPortRecord(1, 1)
          .setGravity(GravityStatic.ON)
          .setFreezeZonks(FreezeZonksStatic.ON)
          .setFreezeEnemies(FreezeEnemiesStatic.ON),
      ]),
    );
  });

  it("clear", () => {
    const next = db.clear();
    expect(next.count).toBe(0);
    expect(next.clear()).toBe(next);
    expect(db.count).toBe(1);
  });

  it("find", () => {
    expect(dumpSpecport(db.find(12, 12))).toEqual(dumpSpecport(textPort1));
    expect(db.find(13, 12)).toBeNull();
  });

  describe("set/update", () => {
    it("no op", () => {
      expect(db.set(textPort1)).toBe(db);
      expect(db.update(12, 12, (p) => p)).toBe(db);
    });

    it("update", () => {
      const copy = db.update(12, 12, (p) =>
        p
          .setGravity(GravityStatic.OFF)
          .setFreezeEnemies(FreezeEnemiesStatic.OFF),
      );

      expect(db.count).toBe(1);
      expect(copy.count).toBe(1);
      expect(dumpSpecports(db)).toEqual(dumpSpecportsArray([textPort1]));
      expect(dumpSpecports(copy)).toEqual(
        dumpSpecportsArray([
          newSpecPortRecord(12, 12)
            .setGravity(GravityStatic.OFF)
            .setFreezeZonks(FreezeZonksStatic.ON)
            .setFreezeEnemies(FreezeEnemiesStatic.OFF),
        ]),
      );
    });
  });

  describe("delete", () => {
    it("no op", () => {
      expect(db.delete(10, 1)).toBe(db);
    });

    it("mid", () => {
      const p2 = newSpecPortRecord(10, 1)
        .setGravity(GravityStatic.ON)
        .setFreezeEnemies(FreezeEnemiesStatic.ON);

      const copy = db.set(p2).delete(12, 12);

      expect(copy.count).toBe(1);
      expect(dumpSpecports(copy)).toEqual(dumpSpecportsArray([p2]));
    });
  });
});
