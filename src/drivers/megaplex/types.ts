import { IBaseDriver, IBaseLevelset, IBaseReader, IBaseWriter } from "../types";
import { ISupaplexLevel } from "../supaplex/types";
import { IWithDemo } from "./internal";

export interface IMegaplexLevel extends ISupaplexLevel, IWithDemo {
  readonly length: number;
  copy(): IMegaplexLevel;
}
export interface IMegaplexLevelset extends IBaseLevelset<IMegaplexLevel> {}

export interface IMegaplexReader extends IBaseReader<IMegaplexLevelset> {}
export interface IMegaplexWriter extends IBaseWriter<IMegaplexLevelset> {}

export interface IMegaplexDriver
  extends IBaseDriver<IMegaplexLevel, IMegaplexLevelset> {}
