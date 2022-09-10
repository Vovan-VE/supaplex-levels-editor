import { IMegaplexLevelset } from "../types";
import { dumpLevel } from "./dumpLevel";

export const dumpLevelset = (levelset: IMegaplexLevelset) => ({
  levels: levelset.getLevels().map(dumpLevel),
  levelsCount: levelset.levelsCount,
  minLevelsCount: levelset.minLevelsCount,
  maxLevelsCount: levelset.maxLevelsCount,
});
