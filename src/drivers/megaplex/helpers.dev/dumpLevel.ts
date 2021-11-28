import { IMegaplexLevel } from "../types";
import { dumpLevel as dumpLevel_sp } from "../../supaplex/helpers.dev";

export const dumpLevel = (level: IMegaplexLevel) => ({
  ...dumpLevel_sp(level),
  demo: level.demo,
});
