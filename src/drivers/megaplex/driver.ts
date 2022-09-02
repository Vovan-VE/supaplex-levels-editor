import { tiles } from "../supaplex/tiles";
import { svg } from "../supaplex/tiles-svg";
import { IMegaplexDriver } from "./types";
import { reader, writer } from "./io";
import { MegaplexLevelset } from "./levelset";

export const MegaplexDriver: IMegaplexDriver = {
  title: "Supaplex",
  tiles,
  unknownTile: svg.unknown,
  reader,
  writer,
  createLevelset: (levels) => new MegaplexLevelset(levels),
};
