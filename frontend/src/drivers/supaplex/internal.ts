import { IBounds, Rect } from "utils/rect";
import {
  IsPlayableResult,
  ITilesRegion,
  IWithDemo,
  IWithSignature,
} from "../types";

export interface ISupaplexBox extends IBounds {
  readonly length: number;
  coordsToOffset(x: number, y: number): number;
  validateCoords?(x: number, y: number): void;
}

export interface ILevelBody extends ITilesRegion {
  readonly length: number;
  readonly raw: Uint8Array;
  setTile(x: number, y: number, value: number): ILevelBody;
  batch(update: (b: ILevelBody) => ILevelBody): ILevelBody;
  isPlayable(): IsPlayableResult;
  copyRegion(r: Rect): readonly [x: number, y: number, region: ILevelBody];
  findPlayer(): [x: number, y: number] | null;
}

export const enum GravityStatic {
  OFF = 0,
  ON = 1,
}
export const enum FreezeZonksStatic {
  OFF = 0,
  ON = 2,
}
export const enum FreezeEnemiesStatic {
  OFF = 0,
  ON = 1,
}
export const enum SpecPortAlterMod {
  NOTHING = -1,
  TOGGLE = -2,
}
export type SpecPortAlterRaw = number & {};
export type SpecPortAlter = SpecPortAlterMod | SpecPortAlterRaw;
export type SpecPortGravity = GravityStatic | SpecPortAlter;
export type SpecPortFreezeZonks = FreezeZonksStatic | SpecPortAlter;
export type SpecPortFreezeEnemies = FreezeEnemiesStatic | SpecPortAlter;

export interface ISupaplexSpecPortStringOptions {
  withZeros?: boolean;
}
export interface ISupaplexSpecPortsIO {
  isStdCompatible(width: number): boolean;
  toString(o?: ISupaplexSpecPortStringOptions): string;
  toRaw(width: number): Uint8Array;
}
export interface ISupaplexSpecPortRecordReadonly {
  readonly x: number;
  readonly y: number;
  //TODO: ? readonly ex: number;
  //TODO: ? readonly ey: number;
  readonly gravity: SpecPortGravity;
  readonly freezeZonks: SpecPortFreezeZonks;
  readonly freezeEnemies: SpecPortFreezeEnemies;
  readonly unusedByte: number;
}
export interface ISupaplexSpecPortRecord
  extends ISupaplexSpecPortRecordReadonly,
    ISupaplexSpecPortsIO {
  setX(x: number): ISupaplexSpecPortRecord;
  setY(y: number): ISupaplexSpecPortRecord;
  setGravity(v: SpecPortGravity): ISupaplexSpecPortRecord;
  setFreezeZonks(v: SpecPortFreezeZonks): ISupaplexSpecPortRecord;
  setFreezeEnemies(v: SpecPortFreezeEnemies): ISupaplexSpecPortRecord;
  setUnusedByte(u: number): ISupaplexSpecPortRecord;
}
export interface ISupaplexSpecPortDatabase extends ISupaplexSpecPortsIO {
  readonly count: number;
  readonly countStdCompatible: number;
  getAll(): Iterable<ISupaplexSpecPortRecord>;
  copySpecPortsInRegion(r: Rect): ISupaplexSpecPortDatabase;
  clear(): ISupaplexSpecPortDatabase;
  find(x: number, y: number): ISupaplexSpecPortRecord | null;
  add(x: number, y: number): ISupaplexSpecPortDatabase;
  set(p: ISupaplexSpecPortRecord): ISupaplexSpecPortDatabase;
  update(
    x: number,
    y: number,
    update: (prev: ISupaplexSpecPortRecord) => ISupaplexSpecPortRecord,
  ): ISupaplexSpecPortDatabase;
  delete(x: number, y: number): ISupaplexSpecPortDatabase;
}

export interface ILevelFooter extends IWithDemo, IWithSignature {
  readonly length: number;
  getRaw(): Uint8Array;
  readonly title: string;
  setTitle(title: string): this;
  readonly initialGravity: boolean;
  setInitialGravity(on: boolean): this;
  readonly initialFreezeZonks: boolean;
  setInitialFreezeZonks(on: boolean): this;
  readonly infotronsNeed: number;
  setInfotronsNeed(value: number): this;
  readonly usePlasma: boolean;
  readonly usePlasmaLimit: number | undefined;
  readonly usePlasmaTime: number | undefined;
  readonly useZonker: boolean;
  readonly useSerialPorts: boolean;
  readonly useInfotronsNeeded: number | undefined;
  readonly initialFreezeEnemies: boolean;
  setUsePlasma(on: boolean): this;
  setUsePlasmaLimit(n: number | undefined): this;
  setUsePlasmaTime(n: number | undefined): this;
  setUseZonker(on: boolean): this;
  setUseSerialPorts(on: boolean): this;
  setUseInfotronsNeeded(n: number | undefined): this;
  setInitialFreezeEnemies(on: boolean): this;
}

export const enum LocalOpt {
  UsePlasma = "usePlasma",
  UsePlasmaLimit = "usePlasmaLimit",
  UsePlasmaTime = "usePlasmaTime",
  UseZonker = "useZonker",
  UseSerialPorts = "useSerialPorts",
  UseInfotronsNeeded = "useInfotronsNeeded",
  PortsDatabase = "portsDB",
  InitialFreezeEnemies = "initialFreezeEnemies",
}
