import { IBaseDriver, IBaseFormat, IBaseLevelset, IWithDemo } from "../types";
import { ISupaplexLevel } from "../supaplex/types";

export interface IMegaplexLevel extends ISupaplexLevel, IWithDemo {
  readonly length: number;
  resize(width: number, height: number): this;
}
export interface IMegaplexLevelset extends IBaseLevelset<IMegaplexLevel> {}

export interface IMegaplexFormat
  extends IBaseFormat<IMegaplexLevel, IMegaplexLevelset> {}

export interface IMegaplexDriver
  extends IBaseDriver<IMegaplexLevel, IMegaplexLevelset> {}
