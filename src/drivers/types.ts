import { FC } from "react";

export interface IBaseTile {
  title: string;
  Component: FC;
}

export interface IBaseLevel {
  width: number;
  height: number;
  getCell(x: number, y: number): number;
  setCell(x: number, y: number, value: number): void;
  readonly isResizable: boolean;
  title: string;
  readonly maxTitleLength: number;
}

export interface IBaseLevelset<L extends IBaseLevel> {
  readonly levelsCount: number;
  readonly minLevelsCount: number;
  readonly maxLevelsCount: number | null;
  getLevels(): Iterable<L>;
  getLevel(index: number): L;
  /**
   * @deprecated Potential reference problems. Probably, this should be deleted.
   */
  setLevel(index: number, level: L): void;
  appendLevel(level: L): void;
  insertLevel(index: number, level: L): void;
  removeLevel(index: number): void;
}

export interface IBaseReader<S extends IBaseLevelset<any>> {
  readLevelset(file: Blob): Promise<S>;
}

export interface IBaseWriter<S extends IBaseLevelset<any>> {
  writeLevelset(levelset: S): Promise<Blob>;
}

export interface IBaseDriver<S extends IBaseLevelset<any>> {
  tiles: readonly IBaseTile[];
  reader?: IBaseReader<S>;
  writer?: IBaseWriter<S>;
}
