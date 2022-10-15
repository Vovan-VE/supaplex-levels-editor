import { ISupaplexDriver } from "./types";
import { Tile } from "./Tile";
import { tiles } from "./tiles";
import { reader, writer } from "./io";
import { SupaplexLevel } from "./level";
import { SupaplexLevelset } from "./levelset";
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
  createLevelset: (levels) => new SupaplexLevelset(levels),
  createLevel: ({ borderTile } = {}) =>
    fillLevelBorder(new SupaplexLevel(), borderTile),
  LevelConfigurator,
};
