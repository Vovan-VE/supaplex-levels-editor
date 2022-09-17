import { ISupaplexDriver } from "./types";
import { Tile } from "./Tile";
import { tiles } from "./tiles";
import { reader, writer } from "./io";
import { SupaplexLevel } from "./level";
import { SupaplexLevelset } from "./levelset";
import { fillLevelBorder } from "./fillLevelBorder";

export const SupaplexDriver: ISupaplexDriver = {
  title: "Supaplex",
  tiles,
  TileRender: Tile,
  reader,
  writer,
  createLevelset: (levels) => new SupaplexLevelset(levels),
  createLevel: () => fillLevelBorder(new SupaplexLevel()),
};
