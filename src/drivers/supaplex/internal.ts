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
  getCell(x: number, y: number): number;
  setCell(
    x: number,
    y: number,
    value: number,
    beforeUpdate?: (prev: number) => void,
  ): void;
}

export interface ILevelFooter {
  readonly length: number;
  getRaw(width: number): Uint8Array;
  title: string;
  initialGravity: boolean;
  initialFreezeZonks: boolean;
  infotronsNeed: number | "all";
  readonly specPortsCount: number;
  getSpecPorts(): Iterable<ISupaplexSpecPort>;
  clearSpecPorts(): void;
  findSpecPort(x: number, y: number): ISupaplexSpecPortProps | undefined;
  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps): void;
  deleteSpecPort(x: number, y: number): void;
}
