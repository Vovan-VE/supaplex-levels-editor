import { SupaplexLevelset } from "./levelset";
import { dumpLevel } from "./helpers.dev";
import { SupaplexLevel } from "./level";

describe("levelset", () => {
  describe("constructor", () => {
    it("number", () => {
      const levelset = new SupaplexLevelset(3);

      expect(levelset.levelsCount).toBe(3);

      const empty = dumpLevel(new SupaplexLevel());
      for (const level of levelset.getLevels()) {
        expect(dumpLevel(level)).toEqual(empty);
      }
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

    const a = levelset.getLevel(0);
    const b = levelset.getLevel(1);
    a.title = "1st";
    b.title = "2nd";

    levelset.setLevel(0, b);
    levelset.setLevel(1, a);

    expect(levelset.getLevel(0).title).toMatch(/^2nd /);
    expect(levelset.getLevel(1).title).toMatch(/^1st /);
  });
});
