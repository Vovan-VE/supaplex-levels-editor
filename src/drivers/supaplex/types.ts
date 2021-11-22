import {
  IBaseDriver,
  IBaseLevel,
  IBaseLevelset,
  IBaseReader,
  IBaseTile,
  IBaseWriter,
} from "../types";

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

export interface ISupaplexTile extends IBaseTile<ISupaplexLevel> {}

export interface ISupaplexLevelset extends IBaseLevelset<ISupaplexLevel> {}
export interface ISupaplexReader extends IBaseReader<ISupaplexLevelset> {}
export interface ISupaplexWriter extends IBaseWriter<ISupaplexLevelset> {}

export interface ISupaplexDriver
  extends IBaseDriver<ISupaplexLevel, ISupaplexLevelset> {}
