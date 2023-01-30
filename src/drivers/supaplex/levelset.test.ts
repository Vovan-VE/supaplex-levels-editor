import { createLevel, createNewLevel } from "./level";
import { createLevelset } from "./levelset";
import { dumpLevel, dumpLevelset } from "./helpers.dev";
import { LocalOpt } from "./internal";
import { LocalOptionsList } from "../types";

describe("levelset", () => {
  describe("constructor", () => {
    it("none", () => {
      const levelset = createLevelset(1);
      expect(dumpLevelset(levelset)).toMatchSnapshot();
    });

    it("number", () => {
      const levelset = createLevelset(3);

      expect(levelset.levelsCount).toBe(3);

      const empty = dumpLevel(createNewLevel());
      for (const level of levelset.getLevels()) {
        expect(dumpLevel(level)).toEqual(empty);
      }

      expect(createLevelset(7).levelsCount).toBe(7);
    });

    it("levels", () => {
      const levelset = createLevelset([createLevel(5, 3), createLevel(7, 9)]);
      expect(dumpLevelset(levelset)).toMatchSnapshot();
    });

    it("throw", () => {
      expect(() => createLevelset(0)).toThrow(
        new RangeError("Invalid levels count"),
      );
    });
  });

  it("getLevel", () => {
    const levelset = createLevelset(3);

    let e = /^Invalid level index -?\d+$/;
    expect(() => levelset.getLevel(-2)).toThrow(e);
    expect(() => levelset.getLevel(-1)).toThrow(e);
    expect(() => levelset.getLevel(3)).toThrow(e);
    expect(() => levelset.getLevel(4)).toThrow(e);
  });

  it("setLevel", () => {
    const levelset = createLevelset(3);

    const a = levelset.getLevel(0).setTitle("1st");
    const b = levelset.getLevel(1).setTitle("2nd");

    const copy = levelset.setLevel(0, b).setLevel(1, a);

    expect(copy.getLevel(0).title).toMatch(/^2nd /);
    expect(copy.getLevel(1).title).toMatch(/^1st /);
  });

  it("appendLevel", () => {
    const levelset = createLevelset(2);

    const a = levelset.getLevel(0);
    const b = levelset.getLevel(1);

    const c = createLevel(5, 3).setTitle("3rd");
    const copy = levelset.appendLevel(c);

    expect(copy.levelsCount).toBe(3);
    expect(copy.getLevels()).toEqual([a, b, c]);
  });

  it("insertLevel", () => {
    const levelset = createLevelset(2);

    const a = levelset.getLevel(0);
    const c = levelset.getLevel(1);

    const b = createLevel(5, 3).setTitle("2nd");

    expect(() => levelset.insertLevel(-1, b)).toThrow(
      new RangeError(`Invalid level index -1`),
    );
    expect(() => levelset.insertLevel(2, b)).toThrow(
      new RangeError(`Invalid level index 2`),
    );
    expect(() => levelset.insertLevel(3, b)).toThrow(
      new RangeError(`Invalid level index 3`),
    );
    const copy = levelset.insertLevel(1, b);

    expect(copy.levelsCount).toBe(3);
    expect(copy.getLevels()).toEqual([a, b, c]);
  });

  it("removeLevel", () => {
    const levelset = createLevelset(3);

    const a = levelset.getLevel(0);
    const c = levelset.getLevel(2);

    let copy = levelset.removeLevel(1);

    expect(copy.levelsCount).toBe(2);
    expect(copy.getLevels()).toEqual([a, c]);

    copy = copy.removeLevel(0);

    expect(copy.levelsCount).toBe(1);
    expect(copy.getLevels()).toEqual([c]);

    expect(() => copy.removeLevel(0)).toThrow(
      new RangeError(`Cannot remove the last one level`),
    );
    expect(() => copy.removeLevel(1)).toThrow(
      new RangeError(`Invalid level index 1`),
    );
    expect(() => copy.removeLevel(-1)).toThrow(
      new RangeError(`Invalid level index -1`),
    );
  });

  it("localOptions", () => {
    const levelset = createLevelset(3);
    const optList: LocalOptionsList = [null, { [LocalOpt.UsePlasma]: 1 }];

    expect(levelset.localOptions).toBe(undefined);
    expect(levelset.setLocalOptions(undefined)).toBe(levelset);
    expect(levelset.setLocalOptions([])).toBe(levelset);
    expect(levelset.setLocalOptions([undefined, {}, undefined])).toBe(levelset);

    const next1 = levelset.setLevel(1, levelset.getLevel(1).setUsePlasma(true));
    expect(next1.localOptions).toEqual(optList);

    const next2 = levelset.setLocalOptions(optList);
    expect(next2.getLevel(0)).toBe(levelset.getLevel(0));
    expect(next2.getLevel(2)).toBe(levelset.getLevel(2));
    const next2_level1 = next2.getLevel(1);
    expect(next2_level1.usePlasma).toBe(true);
    expect(next2_level1.useZonker).toBe(false);
  });
});
