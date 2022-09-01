import { ISupaplexSpecPort, ISupaplexSpecPortProps } from "./types";

export interface IBox {
  // readonly width: number;
  // readonly height: number;
  readonly length: number;
  coordsToOffset(x: number, y: number): number;
  validateCoords?(x: number, y: number): void;
}

export interface ILevelBody {
  readonly length: number;
  readonly raw: Uint8Array;
  getTile(x: number, y: number): number;
  setTile(x: number, y: number, value: number): this;
}

export interface ILevelFooter {
  readonly length: number;
  getRaw(width: number): Uint8Array;
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
  clearSpecPorts(): this;
  findSpecPort(x: number, y: number): ISupaplexSpecPortProps | undefined;
  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps): this;
  deleteSpecPort(x: number, y: number): this;
}
