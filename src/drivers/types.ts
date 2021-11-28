import { FC } from "react";

export interface IBaseLevel {
  width: number;
  height: number;
  getCell(x: number, y: number): number;
  setCell(x: number, y: number, value: number): void;
  // REFACT: size limits
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
  readLevelset(file: ArrayBuffer): S;
}

export interface IBaseWriter<S extends IBaseLevelset<any>> {
  writeLevelset(levelset: S): ArrayBuffer;
}

export interface IBaseTileInteraction<L extends IBaseLevel> {
  // TODO: return actions[]?
  onContextMenu?: (x: number, y: number, level: L) => void;
}

export interface IBaseTile<L extends IBaseLevel> {
  value?: number;
  title: string;
  Component?: FC;
  interaction?: IBaseTileInteraction<L>;
  // TODO: limits like spec ports counts and coords<=>offset, Murphy presence
  //   and like notices for infotrons % 256 in case of 'all'
}

export interface IBaseDriver<L extends IBaseLevel, S extends IBaseLevelset<L>> {
  title: string;
  tiles: readonly IBaseTile<L>[];
  unknownTile?: FC;
  reader?: IBaseReader<S>;
  writer?: IBaseWriter<S>;
}
