import { Tile } from "../supaplex/Tile";
import { tiles } from "../supaplex/tiles";
import { LevelConfigurator } from "../supaplex/LevelConfigurator";
import { IMegaplexDriver } from "./types";
import { MPX } from "./formats";

export const MegaplexDriver: IMegaplexDriver = {
  title: "Megaplex",
  tiles,
  TileRender: Tile,
  LevelConfigurator,
  formats: {
    mpx: MPX,
  },
};
