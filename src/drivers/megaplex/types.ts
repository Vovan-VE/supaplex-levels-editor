import {
  IBaseDriver,
  IBaseLevelset,
  IBaseReader,
  IBaseWriter,
  IWithDemo,
} from "../types";
import { ISupaplexLevel } from "../supaplex/types";

export interface IMegaplexLevel extends ISupaplexLevel, IWithDemo {
  readonly length: number;
}
export interface IMegaplexLevelset extends IBaseLevelset<IMegaplexLevel> {}

export interface IMegaplexReader extends IBaseReader<IMegaplexLevelset> {}
export interface IMegaplexWriter extends IBaseWriter<IMegaplexLevelset> {}

export interface IMegaplexDriver
  extends IBaseDriver<IMegaplexLevel, IMegaplexLevelset> {}
