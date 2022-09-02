import { ISupaplexDriver } from "./types";
import { tiles } from "./tiles";
import { svg } from "./tiles-svg";
import { reader, writer } from "./io";
import { SupaplexLevelset } from "./levelset";

export const SupaplexDriver: ISupaplexDriver = {
  title: "Supaplex",
  tiles,
  unknownTile: svg.unknown,
  reader,
  writer,
  createLevelset: (levels) => new SupaplexLevelset(levels),
};
