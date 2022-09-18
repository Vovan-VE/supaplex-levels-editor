import {
  IBaseDriver,
  IBaseLevel,
  IBaseLevelset,
  IBaseReader,
  IBaseTile,
  IBaseWriter,
} from "../types";
import { ILevelBody } from "./internal";

export interface ISupaplexSpecPortProps {
  setsGravity: boolean;
  setsFreezeZonks: boolean;
  setsFreezeEnemies: boolean;
}

export interface ISupaplexSpecPort extends ISupaplexSpecPortProps {
  x: number;
  y: number;
}

export interface ISupaplexLevel extends IBaseLevel {
  readonly raw: Uint8Array;
  readonly body: ILevelBody;
  readonly initialGravity: boolean;
  setInitialGravity(on: boolean): this;
  readonly initialFreezeZonks: boolean;
  setInitialFreezeZonks(on: boolean): this;
  readonly infotronsNeed: number;
  setInfotronsNeed(value: number): this;
  readonly specPortsCount: number;
  getSpecPorts(): Iterable<ISupaplexSpecPort>;
  /** @deprecated Useless outside */
  clearSpecPorts(): this;
  findSpecPort(x: number, y: number): ISupaplexSpecPortProps | undefined;
  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps): this;
  /** @deprecated Useless outside */
  deleteSpecPort(x: number, y: number): this;
}

export interface ISupaplexTile extends IBaseTile<ISupaplexLevel> {}

export interface ISupaplexLevelset extends IBaseLevelset<ISupaplexLevel> {}
export interface ISupaplexReader extends IBaseReader<ISupaplexLevelset> {}
export interface ISupaplexWriter extends IBaseWriter<ISupaplexLevelset> {}

export interface ISupaplexDriver
  extends IBaseDriver<ISupaplexLevel, ISupaplexLevelset> {}
