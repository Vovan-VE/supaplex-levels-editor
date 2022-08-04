import { tiles } from "../supaplex/tiles";
import { svg } from "../supaplex/tiles-svg";
import { IMegaplexDriver } from "./types";
import { reader, writer } from "./io";

export const MegaplexDriver: IMegaplexDriver = {
  title: "Supaplex",
  tiles,
  unknownTile: svg.unknown,
  reader,
  writer,
};
