import { MegaplexLevel } from "./level";
import { MegaplexLevelset } from "./levelset";
import { dumpLevelset } from "./helpers.dev";

describe("levelset", () => {
  describe("constructor", () => {
    it("none", () => {
      const levelset = new MegaplexLevelset();
      expect(dumpLevelset(levelset)).toMatchSnapshot();
    });

    it("number", () => {
      const levelset = new MegaplexLevelset(2);
      expect(dumpLevelset(levelset)).toMatchSnapshot();
    });

    it("levels", () => {
      const levelset = new MegaplexLevelset([
        new MegaplexLevel(5, 3),
        new MegaplexLevel(7, 9),
      ]);
      expect(dumpLevelset(levelset)).toMatchSnapshot();
    });
  });
});
