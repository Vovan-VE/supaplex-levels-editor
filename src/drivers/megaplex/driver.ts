import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../supaplex/box";
import { fillLevelBorder } from "../supaplex/fillLevelBorder";
import { Tile } from "../supaplex/Tile";
import { tiles } from "../supaplex/tiles";
import { LevelConfigurator } from "../supaplex/LevelConfigurator";
import { IMegaplexDriver } from "./types";
import { reader, writer } from "./io";
import { MegaplexLevel } from "./level";
import { MegaplexLevelset } from "./levelset";

export const MegaplexDriver: IMegaplexDriver = {
  title: "Megaplex",
  tiles,
  TileRender: Tile,
  reader,
  writer,
  fileExtensionDefault: "mpx",
  createLevelset: (levels) => new MegaplexLevelset(levels),
  createLevel: () =>
    fillLevelBorder(new MegaplexLevel(LEVEL_WIDTH, LEVEL_HEIGHT)),
  LevelConfigurator,
};
