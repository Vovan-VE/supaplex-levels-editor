import { cmpLevels } from "./cmpLevels";
import { demoFromText, demoToText } from "./demoText";
import { DemoToTextConfig } from "./DemoToTextConfig";
import { DemoToTextHelp } from "./DemoToTextHelp";
import { detectExportFormat } from "./detectExportFormat";
import { defaultFormat, formats } from "./formats";
import { MPX } from "./formats/mpx";
import { LevelConfigurator } from "./LevelConfigurator";
import { LevelLocalOptions } from "./LevelLocalOptions";
import { applyLocalOptions, parseLocalOptions } from "./localOptions";
import { ISupaplexDriver } from "./types";
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
  parseLocalOptions,
  formats,
  detectExportFormat,
  defaultFormat,
  tempLevel: ({ width, height }) =>
    MPX.createLevel({ width, height, fillTile: 0, borderTile: 0 }),
  tempLevelFromRegion: (r) => MPX.createLevel(r.tiles).pasteRegion(0, 0, r),
  cmpLevels,
  DemoToTextConfig: DemoToTextConfig,
  DemoToTextHelp,
  demoToText,
  demoFromText,
};
