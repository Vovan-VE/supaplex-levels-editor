import { Event, Store } from "effector";
import { CSSProperties, FC, PointerEvent } from "react";
import { ITilesRegion } from "drivers";
import { IBounds, Point2D, Rect } from "utils/rect";

export interface CellEventProps extends IBounds {
  inBounds: boolean;
}

type ModifiersEventProps = Pick<
  PointerEvent<any>,
  "altKey" | "ctrlKey" | "metaKey" | "shiftKey"
>;
type ButtonsEventProps = Pick<PointerEvent<any>, "type" | "button" | "buttons">;

interface CellBaseEventProps
  extends Point2D,
    CellEventProps,
    ModifiersEventProps {}

export interface CellEventSnapshot
  extends CellBaseEventProps,
    ButtonsEventProps {}

export type GridPointerEvent = PointerEvent<HTMLDivElement>;
export type GridPointerEventHandler = (
  event: GridPointerEvent,
  cell: CellEventSnapshot,
) => void;
export type GridPointerCancelEventHandler = (
  event?: GridPointerEvent,
  cell?: CellEventSnapshot,
) => void;

export interface CellContextEventSnapshot extends CellBaseEventProps {}
export type GridContextEventHandler = (cell: CellContextEventSnapshot) => void;

export interface GridEventsProps {
  onPointerDown?: GridPointerEventHandler | undefined;
  onPointerMove?: GridPointerEventHandler | undefined;
  onPointerUp?: GridPointerEventHandler | undefined;
  onPointerCancel?: GridPointerCancelEventHandler | undefined;
  onPointerEnter?: GridPointerEventHandler | undefined;
  onPointerLeave?: GridPointerEventHandler | undefined;
  onClick?: GridPointerEventHandler | undefined;
  onContextMenu?: GridContextEventHandler | undefined;
}

//-------------------------------

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
  title: string;
  internalName: string;
  Icon: FC;
}

export interface Tool {
  internalName: string;
  init?: Event<any>;
  free?: Event<any>;
  variants: readonly ToolVariantUI[];
  setVariant?: Event<number>;
  $variant?: Store<number>;
  $ui: Store<ToolUI>;
}
