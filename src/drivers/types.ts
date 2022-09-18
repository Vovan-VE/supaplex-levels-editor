import { FC } from "react";

interface ISizeLimit {
  readonly minWidth?: number;
  readonly minHeight?: number;
  readonly maxWidth?: number;
  readonly maxHeight?: number;
}

export interface IBaseLevel {
  readonly width: number;
  readonly height: number;
  getTile(x: number, y: number): number;
  setTile(x: number, y: number, value: number): this;
  readonly resizable?: ISizeLimit;
  resize?(width: number, height: number): this;
  readonly title: string;
  setTitle(title: string): this;
  readonly maxTitleLength: number;
}

export interface IBaseLevelset<L extends IBaseLevel> {
  readonly levelsCount: number;
  readonly minLevelsCount: number;
  readonly maxLevelsCount: number | null;
  getLevels(): readonly L[];
  getLevel(index: number): L;
  setLevel(index: number, level: L): this;
  appendLevel(level: L): this;
  insertLevel(index: number, level: L): this;
  removeLevel(index: number): this;
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
  interaction?: IBaseTileInteraction<L>;
  // TODO: limits like spec ports counts and coords<=>offset, Murphy presence
  //   and like notices for infotrons % 256 in case of 'all'
}

export interface TileRenderProps {
  tile?: number;
}

export interface IBaseDriver<
  L extends IBaseLevel = IBaseLevel,
  S extends IBaseLevelset<L> = IBaseLevelset<L>,
> {
  title: string;
  tiles: readonly IBaseTile<L>[];
  TileRender: FC<TileRenderProps>;
  reader?: IBaseReader<S>;
  writer?: IBaseWriter<S>;
  createLevelset: (levels?: readonly L[] | Iterable<L>) => S;
  createLevel: () => L;
  // TODO: level config component
  // TODO: create levelset config
}
