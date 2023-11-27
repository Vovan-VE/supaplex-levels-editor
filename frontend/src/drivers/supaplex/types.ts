import { Rect } from "utils/rect";
import {
  IBaseDriver,
  IBaseFormat,
  IBaseLevel,
  IBaseLevelset,
  IBaseTile,
  ILevelRegion,
  IResizeLevelOptions,
  IWithDemo,
  IWithSignature,
  LocalOptions,
} from "../types";
import {
  ILevelBody,
  ISupaplexSpecPortDatabase,
  ISupaplexSpecPortRecord,
} from "./internal";

export interface ISupaplexLevelRegion extends ILevelRegion {
  readonly specPorts: readonly ISupaplexSpecPortRecord[];
}
export interface ISupaplexLevel extends IBaseLevel, IWithDemo, IWithSignature {
  copyRegion(r: Rect): ISupaplexLevelRegion;
  pasteRegion(x: number, y: number, region: ISupaplexLevelRegion): this;
  readonly length: number;
  readonly raw: Uint8Array;
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
  setUsePlasma(on: boolean): this;
  setUsePlasmaLimit(n: number | undefined): this;
  setUsePlasmaTime(n: number | undefined): this;
  setUseZonker(on: boolean): this;
  setUseSerialPorts(on: boolean): this;
  setUseInfotronsNeeded(n: number | undefined): this;
}

export interface ISupaplexTile extends IBaseTile<ISupaplexLevel> {}

export interface ISupaplexLevelset extends IBaseLevelset<ISupaplexLevel> {}

export interface ISupaplexFormat
  extends IBaseFormat<ISupaplexLevel, ISupaplexLevelset> {}

export interface ISupaplexDriver
  extends IBaseDriver<ISupaplexLevel, ISupaplexLevelset> {}
