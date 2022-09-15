import { ISupaplexDriver } from "./types";
import { Tile } from "./Tile";
import { tiles } from "./tiles";
import { reader, writer } from "./io";
import { SupaplexLevel } from "./level";
import { SupaplexLevelset } from "./levelset";

export const SupaplexDriver: ISupaplexDriver = {
  title: "Supaplex",
  tiles,
  TileRender: Tile,
  reader,
  writer,
  createLevelset: (levels) => new SupaplexLevelset(levels),
  createLevel: () => new SupaplexLevel(),
};
