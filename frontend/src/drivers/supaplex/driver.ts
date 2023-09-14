import { cmpLevels } from "./cmpLevels";
import { detectExportFormat } from "./detectExportFormat";
import { defaultFormat, formats } from "./formats";
import { MPX } from "./formats/mpx";
import { LevelConfigurator } from "./LevelConfigurator";
import { applyLocalOptions, LevelLocalOptions } from "./LevelLocalOptions";
import { ISupaplexDriver, ISupaplexLevelRegion } from "./types";
import { Tile } from "./Tile";
import { borderTiles, fancyTiles, tiles } from "./tiles";

export const SupaplexDriver: ISupaplexDriver = {
  title: "Supaplex",
  tiles,
  borderTiles,
  fancyTiles,
  TileRender: Tile,
  LevelConfigurator,
  LevelLocalOptions,
  applyLocalOptions,
  formats,
  detectExportFormat,
  defaultFormat,
  tempLevelFromRegion: (r) =>
    MPX.createLevel(r.tiles).pasteRegion(0, 0, r as ISupaplexLevelRegion),
  cmpLevels,
};
