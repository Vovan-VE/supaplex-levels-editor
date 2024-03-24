import { IBaseLevel } from "drivers";
import { LevelBuffer } from "models/levelsets";

export interface Options {
  levels: readonly LevelBuffer<IBaseLevel>[];
}
