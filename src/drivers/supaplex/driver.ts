import { ISupaplexDriver } from "./types";
import { Tile } from "./Tile";
import { tiles } from "./tiles";
import { LevelConfigurator } from "./LevelConfigurator";
import { DAT } from "./formats";

export const SupaplexDriver: ISupaplexDriver = {
  title: "Supaplex",
  tiles,
  TileRender: Tile,
  LevelConfigurator,
  formats: {
    dat: DAT,
  },
};
