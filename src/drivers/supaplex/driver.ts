import { ISupaplexDriver } from "./types";
import { tiles } from "./tiles";
import { TUnknown } from "./tiles-svg";
import { reader, writer } from "./io";

export const SupaplexDriver: ISupaplexDriver = {
  title: "Supaplex",
  tiles,
  unknownTile: TUnknown,
  reader,
  writer,
};
