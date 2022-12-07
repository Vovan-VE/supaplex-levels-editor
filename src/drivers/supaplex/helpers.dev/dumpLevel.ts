import { toChar } from "../tiles-id";
import { ISupaplexLevel } from "../types";

export const dumpLevel = (level: ISupaplexLevel) => ({
  width: level.width,
  height: level.height,
  cells: Array.from({ length: level.height }).map((_, y) =>
    Array.from({ length: level.width })
      .map((_, x) => toChar(level.getTile(x, y)))
      .join(""),
  ),
  infotronsNeed: level.infotronsNeed,
  initialGravity: level.initialGravity,
  initialFreezeZonks: level.initialFreezeZonks,
  maxTitleLength: level.maxTitleLength,
  title: level.title,
  specialPorts: [...level.getSpecPorts()],
});
