import { ISupaplexLevelset } from "../types";
import { dumpLevel } from "./dumpLevel";

export const dumpLevelset = (levelset: ISupaplexLevelset) => ({
  levels: levelset.getLevels().map(dumpLevel),
  levelsCount: levelset.levelsCount,
  minLevelsCount: levelset.minLevelsCount,
  maxLevelsCount: levelset.maxLevelsCount,
});
