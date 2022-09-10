import { SupaplexLevelset } from "./levelset";
import { dumpLevel } from "./helpers.dev";
import { SupaplexLevel } from "./level";

describe("levelset", () => {
  describe("constructor", () => {
    it("throw", () => {
      expect(() => new SupaplexLevelset(-2)).toThrow(
        new RangeError("Invalid levels count -2"),
      );
    });

    it("number", () => {
      const levelset = new SupaplexLevelset(3);

      expect(levelset.levelsCount).toBe(3);

      const empty = dumpLevel(new SupaplexLevel());
      for (const level of levelset.getLevels()) {
        expect(dumpLevel(level)).toEqual(empty);
      }

      expect(new SupaplexLevelset().levelsCount).toBe(111);
    });
  });

  it("getLevel", () => {
    const levelset = new SupaplexLevelset(3);

    expect(levelset.getLevel(0)).toBeInstanceOf(SupaplexLevel);
    expect(levelset.getLevel(1)).toBeInstanceOf(SupaplexLevel);
    expect(levelset.getLevel(2)).toBeInstanceOf(SupaplexLevel);

    let e = /^Invalid level index -?\d+$/;
    expect(() => levelset.getLevel(-2)).toThrow(e);
    expect(() => levelset.getLevel(-1)).toThrow(e);
    expect(() => levelset.getLevel(3)).toThrow(e);
    expect(() => levelset.getLevel(4)).toThrow(e);
  });

  it("setLevel", () => {
    const levelset = new SupaplexLevelset(3);

    const a = levelset.getLevel(0).setTitle("1st");
    const b = levelset.getLevel(1).setTitle("2nd");

    const copy = levelset.setLevel(0, b).setLevel(1, a);

    expect(copy.getLevel(0).title).toMatch(/^2nd /);
    expect(copy.getLevel(1).title).toMatch(/^1st /);
  });

  it("appendLevel", () => {
    const levelset = new SupaplexLevelset(2);

    const a = levelset.getLevel(0);
    const b = levelset.getLevel(1);

    const c = new SupaplexLevel().setTitle("3rd");
    const copy = levelset.appendLevel(c);

    expect(copy.levelsCount).toBe(3);
    expect(copy.getLevels()).toEqual([a, b, c]);
  });

  it("insertLevel", () => {
    const levelset = new SupaplexLevelset(2);

    const a = levelset.getLevel(0);
    const c = levelset.getLevel(1);

    const b = new SupaplexLevel().setTitle("2nd");

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
    const levelset = new SupaplexLevelset(3);

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
});
