import { CSSProperties, FC, ReactNode } from "react";
import { CellContextEventSnapshot } from "models/levels/tools";

export interface ISizeLimit {
  readonly minWidth?: number;
  readonly minHeight?: number;
  readonly maxWidth?: number;
  readonly maxHeight?: number;
}

export type IsPlayableResult =
  | readonly [valid: true, nothing?: undefined]
  | readonly [valid: false, errors: readonly ReactNode[]];

export interface DemoSeed {
  lo: number;
  hi: number;
}

export interface IWithDemo {
  readonly demo: Uint8Array | null;
  setDemo(demo: Uint8Array | null): this;
  readonly demoSeed: DemoSeed;
  setDemoSeed(seed: DemoSeed): this;
}

export const levelSupportsDemo = (level: any): level is IWithDemo =>
  typeof level === "object" &&
  level !== null &&
  typeof level.setDemo === "function" &&
  typeof level.setDemoSeed === "function";

export type ITilesStreamItem = readonly [
  x: number,
  y: number,
  width: number,
  tile: number,
];

export interface IBaseLevel {
  readonly raw: Uint8Array;
  readonly width: number;
  readonly height: number;
  getTile(x: number, y: number): number;
  setTile(x: number, y: number, value: number): this;
  tilesRenderStream(
    x: number,
    y: number,
    w: number,
    h: number,
  ): Iterable<ITilesStreamItem>;
  readonly resizable?: ISizeLimit;
  // TODO: probably add optional argument to set border with the given tile
  resize?(width: number, height: number): this;
  readonly title: string;
  setTitle(title: string): this;
  readonly maxTitleLength: number;
  // REFACT: add api for batch changes without intermediate `copy()` calls

  isPlayable(): IsPlayableResult;
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

export const enum InteractionType {
  DIALOG,
}
export interface InteractionDialogProps<L extends IBaseLevel> {
  cell: CellContextEventSnapshot;
  level: L;
  submit: (next: L) => void;
  cancel: () => void;
}
interface InteractionBase {
  type: InteractionType;
  cell?: CellContextEventSnapshot;
}
export interface InteractionDialog<L extends IBaseLevel>
  extends InteractionBase {
  type: InteractionType.DIALOG;
  cell: CellContextEventSnapshot;
  Component: FC<InteractionDialogProps<L>>;
}
export type Interaction<L extends IBaseLevel> = InteractionDialog<L>;

export interface IBaseTileInteraction<L extends IBaseLevel> {
  onContextMenu?: <T extends L>(
    cell: CellContextEventSnapshot,
    level: T,
  ) => Interaction<T> | undefined;
}

export interface IBaseTile<L extends IBaseLevel> {
  value?: number;
  title: string;
  interaction?: IBaseTileInteraction<L>;
  // TODO: limits like spec ports counts and coords<=>offset, Murphy presence
  //   and like notices for infotrons % 256 in case of 'all'
}

export interface INewLevelOptions {
  width?: number;
  height?: number;
  borderTile?: number;
}

export interface TileRenderProps {
  tile?: number;
  style?: CSSProperties;
}

export interface LevelConfiguratorProps<L extends IBaseLevel> {
  level: L;
  onChange: (level: L) => void;
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
  fileExtensions?: RegExp;
  fileExtensionDefault: string;
  createLevelset: (levels?: readonly L[] | Iterable<L>) => S;
  createLevel: (options?: INewLevelOptions) => L;
  newLevelResizable?: ISizeLimit;
  demoSupport?: boolean;
  LevelConfigurator?: FC<LevelConfiguratorProps<L>>;
  // TODO: create levelset config
}
