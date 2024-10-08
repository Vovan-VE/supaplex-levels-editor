import { CSSProperties, FC, ReactElement, ReactNode } from "react";
import { TranslationGetter } from "i18n/types";
import { PenShapeStructures } from "ui/drawing";
import { CellContextEventSnapshot } from "ui/grid-events";
import { isNotNull } from "utils/fn";
import { IBounds, Point2D, Rect } from "utils/rect";

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
  variant?: number,
];

export interface IWithSignature {
  readonly signature: Uint8Array | null;
  readonly signatureString: string;
  setSignature(signature: Uint8Array | string | null): this;
}

export const levelSupportSignature = (level: any): level is IWithSignature =>
  typeof level === "object" &&
  level !== null &&
  typeof level.setSignature === "function";

export interface ITilesGrid extends IBounds {
  getTile(x: number, y: number): number;
}
export interface ITilesRegion extends ITilesGrid {
  // TODO: getTileVariant(x: number, y: number): number | undefined;
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

export interface INewLevelOptions {
  width?: number;
  height?: number;
  borderTile?: number;
  fillTile?: number;
}

export interface IResizeLevelOptions extends INewLevelOptions {
  x?: number;
  y?: number;
}

export const enum FlipDirection {
  H = "H",
  V = "V",
}
export const enum TranspositionDirection {
  NW = "\\",
}
export type SwapTransform = FlipDirection | TranspositionDirection;

export type LocalOptions = Record<string, unknown>;
export type LocalOptionsList = readonly (LocalOptions | null | undefined)[];
export type LocalOptionsTable = Record<`${number}`, LocalOptions>;

export const serializeLocalOptionsList = (
  l: LocalOptionsList,
): LocalOptionsTable =>
  Object.fromEntries(
    l.map((o, i) => (o ? ([i + 1, o] as const) : undefined)).filter(isNotNull),
  );

// And what then should I do with Undo history? Every level has its own undo,
// but not entire levelset.
// export const unserializeLocalOptionsList = (
//   lt: LocalOptionsTable,
// ): LocalOptionsList => {
//   const a: (LocalOptions | undefined)[] = [];
//   for (const [k, o] of Object.entries(lt)) {
//     const n = parseInt(k);
//     if (Number.isInteger(n) && n > 0 && String(n) === k) {
//       a[n - 1] = o;
//     }
//   }
//   return a;
// };

export interface IBaseLevel extends ITilesRegion {
  readonly raw: Uint8Array;
  setTile(x: number, y: number, value: number, keepSameVariant?: boolean): this;
  swapTiles(a: Point2D, b: Point2D, transform?: SwapTransform): this;
  batch(update: (b: this) => this): this;
  resize?(options: IResizeLevelOptions): this;
  readonly title: string;
  setTitle(title: string): this;
  // REFACT: move to format?
  readonly maxTitleLength: number;
  readonly localOptions: LocalOptions | undefined;
  setLocalOptions(opt: LocalOptions | undefined): this;

  isPlayable(): IsPlayableResult;
  copyRegion(rect: Rect): ILevelRegion;
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
  readonly hasLocalOptions: boolean;
  readonly localOptions: LocalOptionsList | undefined;
  setLocalOptions(opt: LocalOptionsList | undefined): this;
}

export const enum InteractionType {
  DIALOG,
}
export interface InteractionDialogProps<L extends IBaseLevel> {
  cell: CellContextEventSnapshot;
  level: L;
  submit?: (next: L) => void;
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

export interface IBaseMetaTile {
  title: TranslationGetter;
  icon: ReactElement;
  primaryValue: number;
}
export interface IBaseTile<L extends IBaseLevel> {
  value: number;
  title: TranslationGetter;
  src?: string;
  srcVariant?: ReadonlyMap<number, string>;
  metaTile?: IBaseMetaTile;
  toolbarOrder?: number;
  interaction?: IBaseTileInteraction<L>;
  drawStruct?: PenShapeStructures;
  // TODO: limits like spec ports counts and coords<=>offset, Murphy presence
  //   and like notices for infotrons % 256 in case of 'all'
}
export type BorderTiles = ReadonlySet<number>;
// fancy => canonical
export type FancyTiles = ReadonlyMap<number, number>;

export const enum SupportReportType {
  ERR = 0,
  WARN = 1,
}

export interface ISupportReportMessage {
  type: SupportReportType;
  message: ReactNode;
  levelIndex?: number | null;
}
export interface ISupportReport {
  type: SupportReportType;
  messages: readonly ISupportReportMessage[];
}

export interface IBaseFormat<L extends IBaseLevel, S extends IBaseLevelset<L>> {
  readonly title: string;
  readonly description?: ReactNode;
  readonly fileExtensions?: RegExp;
  readonly fileExtensionDefault: string;
  readonly resizable: ISizeLimit;
  readonly minLevelsCount: number;
  readonly maxLevelsCount: number | null;
  readonly demoSupport?: boolean;
  readonly signatureMaxLength?: number;
  supportReport(levelset: S): Iterable<ISupportReportMessage>;
  readLevelset(file: ArrayBufferLike): S;
  writeLevelset(levelset: S): ArrayBuffer;
  createLevelset(levels?: readonly L[] | Iterable<L>): S;
  createLevel(options?: INewLevelOptions): L;
  // TODO: createLevelset config
}

export interface TileRenderProps {
  tile: number;
  variant?: number;
  className?: string;
  style?: CSSProperties;
}

export interface LevelEditProps<L extends IBaseLevel> {
  level: L;
  onChange?: (level: L) => void;
}
export interface LevelConfiguratorEnvProps {
  compact?: boolean;
}
export interface LevelConfiguratorProps<L extends IBaseLevel>
  extends LevelEditProps<L>,
    LevelConfiguratorEnvProps {}
export interface LevelLocalOptionsProps<L extends IBaseLevel>
  extends LevelEditProps<L> {}

export type DiffItemValue = null | boolean | number | string | ReactElement;
export interface DiffItem {
  label: ReactNode;
  a?: DiffItemValue;
  b?: DiffItemValue;
}

export interface DemoToTextConfigProps<P extends object = object> {
  options: P;
  onChange: (options: P) => void;
}
export interface DemoToTextResult {
  text: string;
  duration: number;
}
export interface DemoFromTextResult {
  demo: Uint8Array | null;
  duration: number;
}

export interface IBaseDriver<
  L extends IBaseLevel = IBaseLevel,
  S extends IBaseLevelset<L> = IBaseLevelset<L>,
> {
  title: string;
  tiles: readonly IBaseTile<L>[];
  fancyTiles?: FancyTiles;
  borderTiles?: BorderTiles;
  TileRender: FC<TileRenderProps>;
  LevelConfigurator?: FC<LevelConfiguratorProps<L>>;
  LevelLocalOptions?: FC<LevelLocalOptionsProps<L>>;
  applyLocalOptions?: (level: L, url: URL) => void;
  parseLocalOptions?: (url: URL, level: L) => L;
  /**
   * Available formats in "detect" order.
   * Display order now is just sorted titles.
   */
  formats: Record<string, IBaseFormat<L, S>>;
  // TODO: formats: optional separate display order
  defaultFormat?: string;
  detectExportFormat: (level: L) => string;
  tempLevel: (size: IBounds) => L;
  tempLevelFromRegion: (region: ILevelRegion) => L;
  cmpLevels?: (a: L, b: L) => DiffItem[];
  DemoToTextConfig?: FC<DemoToTextConfigProps>;
  DemoToTextHelp?: FC;
  demoToText?: (demo: Uint8Array | null, options?: object) => DemoToTextResult;
  demoFromText?: (text: string) => DemoFromTextResult;
}
