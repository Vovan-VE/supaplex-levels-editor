import { DAT, MPX, SP } from "./formats";
import { LevelConfigurator } from "./LevelConfigurator";
import { applyLocalOptions, LevelLocalOptions } from "./LevelLocalOptions";
import { ISupaplexDriver } from "./types";
import { Tile } from "./Tile";
import { tiles } from "./tiles";

export const SupaplexDriver: ISupaplexDriver = {
  title: "Supaplex",
  tiles,
  TileRender: Tile,
  LevelConfigurator,
  LevelLocalOptions,
  applyLocalOptions,
  formats: {
    // "detect" order:
    // MPX first since it has "MPX " header
    mpx: MPX,
    // DAT second because I check its length to be a module of 1536
    dat: DAT,
    // SP has only min size limit
    sp: SP,
  },
  defaultFormat: "dat",
};
