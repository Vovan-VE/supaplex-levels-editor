import {
  IBaseDriver,
  IBaseLevel,
  IBaseLevelset,
  IBaseReader,
  IBaseTile,
  IBaseWriter,
  ILevelRegion,
} from "../types";
import {
  ILevelBody,
  ISupaplexSpecPort,
  ISupaplexSpecPortProps,
} from "./internal";

export interface ISupaplexLevelRegion extends ILevelRegion {
  readonly specPorts: readonly ISupaplexSpecPort[];
}
export interface ISupaplexLevel extends IBaseLevel {
  copyRegion(x: number, y: number, w: number, h: number): ISupaplexLevelRegion;
  pasteRegion(x: number, y: number, region: ISupaplexLevelRegion): this;
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
