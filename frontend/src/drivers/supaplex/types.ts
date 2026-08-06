import { Rect } from "utils/rect";
import {
  IBaseDriver,
  IBaseFormat,
  IBaseLevel,
  IBaseLevelset,
  IBaseTile,
  ILevelRegion,
  IResizeLevelOptions,
  ITilesRegion,
  IWithDemo,
  IWithSignature,
  LocalOptions,
} from "../types";
import { ILevelBody, ISupaplexSpecPortDatabase } from "./internal";

export interface ISupaplexTilesRegion extends ITilesRegion {
  readonly specports: ISupaplexSpecPortDatabase;
}
export interface ISupaplexLevelRegion extends ILevelRegion {
  readonly tiles: ISupaplexTilesRegion;
}
export interface ISupaplexLevel extends IBaseLevel, IWithDemo, IWithSignature {
  copyRegion(rect: Rect): ISupaplexLevelRegion;
  readonly length: number;
  readonly raw: Uint8Array<ArrayBuffer>;
  readonly body: ILevelBody;
  resize(options: IResizeLevelOptions): this;
  readonly initialGravity: boolean;
  setInitialGravity(on: boolean): this;
  readonly initialFreezeZonks: boolean;
  setInitialFreezeZonks(on: boolean): this;
  readonly infotronsNeed: number;
  setInfotronsNeed(value: number): this;
  readonly specports: ISupaplexSpecPortDatabase;
  setSpecports(spdb: ISupaplexSpecPortDatabase): this;
  updateSpecports(
    update: (spdb: ISupaplexSpecPortDatabase) => ISupaplexSpecPortDatabase,
  ): this;
  setLocalOptions(opt: LocalOptions | undefined): this;
  readonly usePlasma: boolean;
  readonly usePlasmaLimit: number | undefined;
  readonly usePlasmaTime: number | undefined;
  readonly useZonker: boolean;
  readonly useSerialPorts: boolean;
  readonly useInfotronsNeeded: number | undefined;
  readonly initialFreezeEnemies: boolean;
  readonly useGreenDisk: boolean;
  readonly useScrew: boolean;
  setUsePlasma(on: boolean): this;
  setUsePlasmaLimit(n: number | undefined): this;
  setUsePlasmaTime(n: number | undefined): this;
  setUseZonker(on: boolean): this;
  setUseSerialPorts(on: boolean): this;
  // REFACT: merge into common
  setUseInfotronsNeeded(n: number | undefined): this;
  setInitialFreezeEnemies(on: boolean): this;
  setUseGreenDisk(on: boolean): this;
  setUseScrew(on: boolean): this;
}

export type ISupaplexTile = IBaseTile<ISupaplexLevel>;
export type ISupaplexLevelset = IBaseLevelset<ISupaplexLevel>;
export type ISupaplexFormat = IBaseFormat<ISupaplexLevel, ISupaplexLevelset>;
export type ISupaplexDriver = IBaseDriver<ISupaplexLevel, ISupaplexLevelset>;
