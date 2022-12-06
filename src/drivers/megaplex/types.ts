import {
  IBaseDriver,
  IBaseFormat,
  IBaseLevelset,
  IBaseReader,
  IBaseWriter,
  ISizeLimit,
  IWithDemo,
} from "../types";
import { ISupaplexLevel } from "../supaplex/types";

export interface IMegaplexLevel extends ISupaplexLevel, IWithDemo {
  readonly length: number;
  readonly resizable: ISizeLimit;
  resize(width: number, height: number): this;
}
export interface IMegaplexLevelset extends IBaseLevelset<IMegaplexLevel> {}

export interface IMegaplexReader extends IBaseReader<IMegaplexLevelset> {}
export interface IMegaplexWriter extends IBaseWriter<IMegaplexLevelset> {}

export interface IMegaplexFormat
  extends IBaseFormat<IMegaplexLevel, IMegaplexLevelset> {}

export interface IMegaplexDriver
  extends IBaseDriver<IMegaplexLevel, IMegaplexLevelset> {}
