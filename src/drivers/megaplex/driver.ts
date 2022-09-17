import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../supaplex/box";
import { fillLevelBorder } from "../supaplex/fillLevelBorder";
import { Tile } from "../supaplex/Tile";
import { tiles } from "../supaplex/tiles";
import { IMegaplexDriver } from "./types";
import { reader, writer } from "./io";
import { MegaplexLevel } from "./level";
import { MegaplexLevelset } from "./levelset";

export const MegaplexDriver: IMegaplexDriver = {
  title: "Supaplex",
  tiles,
  TileRender: Tile,
  reader,
  writer,
  createLevelset: (levels) => new MegaplexLevelset(levels),
  createLevel: () =>
    fillLevelBorder(new MegaplexLevel(LEVEL_WIDTH, LEVEL_HEIGHT)),
};
