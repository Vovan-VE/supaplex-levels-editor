import { createLevel } from "./level";
import { createLevelset } from "./levelset";
import { dumpLevelset } from "./helpers.dev";

describe("levelset", () => {
  describe("constructor", () => {
    it("none", () => {
      const levelset = createLevelset();
      expect(dumpLevelset(levelset)).toMatchSnapshot();
    });

    it("number", () => {
      const levelset = createLevelset(2);
      expect(dumpLevelset(levelset)).toMatchSnapshot();
    });

    it("levels", () => {
      const levelset = createLevelset([createLevel(5, 3), createLevel(7, 9)]);
      expect(dumpLevelset(levelset)).toMatchSnapshot();
    });
  });
});
