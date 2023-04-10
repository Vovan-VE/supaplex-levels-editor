import { IBounds, Point2D, Rect } from "utils/rect";
import {
  IsPlayableResult,
  ITilesRegion,
  ITilesStreamItem,
  IWithDemo,
} from "../types";

export interface ISupaplexBox extends IBounds {
  readonly length: number;
  coordsToOffset(x: number, y: number): number;
  validateCoords?(x: number, y: number): void;
}

export interface ILevelBody extends IBounds {
  readonly length: number;
  readonly raw: Uint8Array;
  getTile(x: number, y: number): number;
  setTile(x: number, y: number, value: number): ILevelBody;
  batch(update: (b: ILevelBody) => ILevelBody): ILevelBody;
  isPlayable(): IsPlayableResult;
  tilesRenderStream(
    x: number,
    y: number,
    w: number,
    h: number,
  ): Iterable<ITilesStreamItem>;
  copyRegion(r: Rect): readonly [x: number, y: number, region: ITilesRegion];
  findPlayer(): [x: number, y: number] | null;
}

export interface ISupaplexSpecPortProps {
  setsGravity: boolean;
  setsFreezeZonks: boolean;
  setsFreezeEnemies: boolean;
}

export interface ISupaplexSpecPort extends ISupaplexSpecPortProps, Point2D {}

export interface ILevelFooter extends IWithDemo {
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
  readonly specPortsCount: number;
  getSpecPorts(): Iterable<ISupaplexSpecPort>;
  copySpecPortsInRegion(r: Rect): readonly ISupaplexSpecPort[];
  clearSpecPorts(): this;
  findSpecPort(x: number, y: number): ISupaplexSpecPortProps | undefined;
  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps): this;
  deleteSpecPort(x: number, y: number): this;
  readonly usePlasma: boolean;
  readonly usePlasmaLimit: number | undefined;
  readonly usePlasmaTime: number | undefined;
  readonly useZonker: boolean;
  readonly useSerialPorts: boolean;
  setUsePlasma(on: boolean): this;
  setUsePlasmaLimit(n: number | undefined): this;
  setUsePlasmaTime(n: number | undefined): this;
  setUseZonker(on: boolean): this;
  setUseSerialPorts(on: boolean): this;
}

export const SPEC_PORT_MAX_COUNT = 10;

export const enum LocalOpt {
  UsePlasma = "usePlasma",
  UsePlasmaLimit = "usePlasmaLimit",
  UsePlasmaTime = "usePlasmaTime",
  UseZonker = "useZonker",
  UseSerialPorts = "useSerialPorts",
}
