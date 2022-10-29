import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../supaplex/box";
import { fillLevelBorder } from "../supaplex/fillLevelBorder";
import { Tile } from "../supaplex/Tile";
import { tiles } from "../supaplex/tiles";
import { LevelConfigurator } from "../supaplex/LevelConfigurator";
import { IMegaplexDriver } from "./types";
import { reader, writer } from "./io";
import { createLevel } from "./level";
import { createLevelset } from "./levelset";
import { resizable } from "./resizable";

export const MegaplexDriver: IMegaplexDriver = {
  title: "Megaplex",
  tiles,
  TileRender: Tile,
  reader,
  writer,
  fileExtensionDefault: "mpx",
  createLevelset,
  createLevel: ({
    width = LEVEL_WIDTH,
    height = LEVEL_HEIGHT,
    borderTile,
  } = {}) => fillLevelBorder(createLevel(width, height), borderTile),
  newLevelResizable: resizable,
  demoSupport: true,
  LevelConfigurator,
};
