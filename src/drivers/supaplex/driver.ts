import { ISupaplexDriver } from "./types";
import { Tile } from "./Tile";
import { tiles } from "./tiles";
import { reader, writer } from "./io";
import { createLevel } from "./level";
import { createLevelset } from "./levelset";
import { LevelConfigurator } from "./LevelConfigurator";
import { fillLevelBorder } from "./fillLevelBorder";

export const SupaplexDriver: ISupaplexDriver = {
  title: "Supaplex",
  tiles,
  TileRender: Tile,
  reader,
  writer,
  fileExtensions: /(dat|d\d{2})/i,
  fileExtensionDefault: "dat",
  createLevelset,
  createLevel: ({ borderTile } = {}) =>
    fillLevelBorder(createLevel(), borderTile),
  LevelConfigurator,
};
