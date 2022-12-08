import { DAT, MPX, SP } from "./formats";
import { LevelConfigurator } from "./LevelConfigurator";
import { ISupaplexDriver } from "./types";
import { Tile } from "./Tile";
import { tiles } from "./tiles";

export const SupaplexDriver: ISupaplexDriver = {
  title: "Supaplex",
  tiles,
  TileRender: Tile,
  LevelConfigurator,
  formats: {
    mpx: MPX,
    dat: DAT,
    sp: SP,
  },
  defaultFormat: "dat",
};
