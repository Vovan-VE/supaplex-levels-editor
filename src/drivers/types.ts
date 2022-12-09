import { CSSProperties, FC, ReactNode } from "react";
import { CellContextEventSnapshot } from "models/levels/tools/interface";

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

export interface IWithDemoSeed {
  readonly demoSeed: DemoSeed;
  setDemoSeed(seed: DemoSeed): this;
}

export interface IWithDemo extends IWithDemoSeed {
  readonly demo: Uint8Array | null;
  setDemo(demo: Uint8Array | null): this;
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

export interface ITilesRegion {
  readonly width: number;
  readonly height: number;
  getTile(x: number, y: number): number;
  tilesRenderStream(
    x: number,
    y: number,
    w: number,
    h: number,
  ): Iterable<ITilesStreamItem>;
}

export interface ILevelRegion {
  readonly tiles: ITilesRegion;
}

export interface IBaseLevel extends ITilesRegion {
  readonly raw: Uint8Array;
  setTile(x: number, y: number, value: number): this;
  batch(update: (b: this) => this): this;
  // TODO: probably add optional argument to set border or fill new space with the given tile(s)
  resize?(width: number, height: number): this;
  readonly title: string;
  setTitle(title: string): this;
  // REFACT: move to format?
  readonly maxTitleLength: number;

  isPlayable(): IsPlayableResult;
  copyRegion(x: number, y: number, w: number, h: number): ILevelRegion;
  pasteRegion(x: number, y: number, region: ILevelRegion): this;
  findPlayer(): [x: number, y: number] | null;
}

export interface IBaseLevelset<L extends IBaseLevel> {
  readonly levelsCount: number;
  getLevels(): readonly L[];
  getLevel(index: number): L;
  setLevel(index: number, level: L): this;
  appendLevel(level: L): this;
  insertLevel(index: number, level: L): this;
  removeLevel(index: number): this;
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

export const enum SupportReportType {
  ERR = 0,
  WARN = 1,
}

export interface ISupportReportMessage {
  type: SupportReportType;
  message: ReactNode;
  levelIndex?: number | null;
}

export interface IBaseFormat<L extends IBaseLevel, S extends IBaseLevelset<L>> {
  readonly title: string;
  readonly fileExtensions?: RegExp;
  readonly fileExtensionDefault: string;
  readonly resizable: ISizeLimit;
  readonly minLevelsCount: number;
  readonly maxLevelsCount: number | null;
  readonly demoSupport?: boolean;
  supportReport(levelset: S): Iterable<ISupportReportMessage>;
  readLevelset(file: ArrayBuffer): S;
  writeLevelset(levelset: S): ArrayBuffer;
  createLevelset(levels?: readonly L[] | Iterable<L>): S;
  createLevel(options?: INewLevelOptions): L;
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
  LevelConfigurator?: FC<LevelConfiguratorProps<L>>;
  /**
   * Available formats in "detect" order.
   * Display order now is just sorted titles.
   */
  formats: Record<string, IBaseFormat<L, S>>;
  defaultFormat?: string;
  // TODO: optional separate display order
  // TODO: create levelset config
}
