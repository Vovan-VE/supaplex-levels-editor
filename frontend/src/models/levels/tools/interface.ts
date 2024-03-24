import { Event, EventCallable, Store } from "effector";
import { CSSProperties, FC } from "react";
import { ITilesRegion } from "drivers";
import { TranslationGetter } from "i18n/types";
import { HotKeyShortcuts } from "models/ui/hotkeys";
import { PenShape } from "ui/drawing";
import { GridEventsProps } from "ui/grid-events";
import { IBounds, Point2D, Rect } from "utils/rect";

export type CellKey = `${number}:${number}`;
export const cellKey = ({ x, y }: Point2D): CellKey => `${x}:${y}`;

export const enum DrawLayerType {
  TILES = "t",
  TILE_FILL = "tf",
  SELECT_RANGE = "sel",
  TILES_REGION = "tr",
  CUSTOM = "c",
}
interface BaseDrawLayer extends Point2D {
  type: DrawLayerType;
}

export interface TileCell extends Point2D {
  tile: number;
}
export type TilesPath = ReadonlyMap<CellKey, TileCell>;
export interface DrawLayerTiles extends BaseDrawLayer {
  type: DrawLayerType.TILES;
  tiles: TilesPath;
}
export interface DrawLayerTileFill extends BaseDrawLayer, IBounds {
  type: DrawLayerType.TILE_FILL;
  tile: number;
}
export interface DrawLayerSelectRange extends BaseDrawLayer, IBounds {
  type: DrawLayerType.SELECT_RANGE;
  borders: ReadonlySet<"T" | "R" | "B" | "L">;
}
export interface DrawLayerTilesRegion extends BaseDrawLayer {
  type: DrawLayerType.TILES_REGION;
  tiles: ITilesRegion;
}
export interface DrawLayerCustom extends BaseDrawLayer {
  type: DrawLayerType.CUSTOM;
  Component: FC<Point2D>;
}

export type DrawLayer =
  | DrawLayerTiles
  | DrawLayerTileFill
  | DrawLayerSelectRange
  | DrawLayerTilesRegion
  | DrawLayerCustom;

export type DrawLayerProps<T extends DrawLayerType> = Omit<
  DrawLayer & { type: T },
  "type"
>;

export type TCursor = Exclude<CSSProperties["cursor"], undefined>;
export interface DrawCursor {
  rect: readonly Rect[];
  cursor: TCursor;
}

//-------------------------------

export type PenShapePoint = readonly (readonly [x: number, y: number])[];
export const PEN_SHAPES: Record<PenShape, PenShapePoint> = {
  [PenShape.DOT]: [[0, 0]],
  [PenShape._1x2]: [
    [0, 0],
    [0, 1],
  ],
  [PenShape._2x1]: [
    [0, 0],
    [1, 0],
  ],
  [PenShape._3x3]: [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [0, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ],
  // Double chips: a "structured/connected"
};

export interface ToolUI {
  rollback?: Event<any>;
  // TODO: add optional "Undo" ability to apply `rollback` in "working" state
  //   but will it require "Redo" to work as expected?
  drawLayers?: readonly DrawLayer[];
  drawCursor?: readonly DrawCursor[];
  events?: GridEventsProps;
  Dialogs?: FC;
}

export interface ToolVariantUI {
  title: TranslationGetter;
  internalName: string;
  Icon: FC;
  hotkey?: HotKeyShortcuts;
}

export interface Tool {
  internalName: string;
  init?: EventCallable<any>;
  free?: EventCallable<any>;
  canRo?: boolean;
  variants: readonly ToolVariantUI[];
  setVariant?: EventCallable<number>;
  $variant?: Store<number>;
  $ui: Store<ToolUI>;
}
