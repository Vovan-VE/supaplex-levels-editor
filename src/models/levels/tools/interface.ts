import { Event, Store } from "effector";
import { FC, PointerEvent } from "react";

export interface CellCoords {
  x: number;
  y: number;
}
export interface CellEventProps {
  width: number;
  height: number;
  inBounds: boolean;
}

type ModifiersEventProps = Pick<
  PointerEvent<any>,
  "altKey" | "ctrlKey" | "metaKey" | "shiftKey"
>;
type ButtonsEventProps = Pick<PointerEvent<any>, "type" | "button" | "buttons">;

interface CellBaseEventProps
  extends CellCoords,
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
  onContextMenu?: GridContextEventHandler | undefined;
}

//-------------------------------

export type CellKey = `${number}:${number}`;
export const cellKey = ({ x, y }: CellCoords): CellKey => `${x}:${y}`;

export const enum DrawLayerType {
  TILES = "t",
  CUSTOM = "c",
}
interface BaseDrawLayer extends CellCoords {
  type: DrawLayerType;
}

export interface TileCell extends CellCoords {
  tile: number;
}
export type TilesPath = ReadonlyMap<CellKey, TileCell>;
interface DrawLayerTiles extends BaseDrawLayer {
  type: DrawLayerType.TILES;
  tiles: TilesPath;
}

interface DrawLayerCustom extends BaseDrawLayer {
  type: DrawLayerType.CUSTOM;
  Component: FC<CellCoords>;
}

export type DrawLayer = DrawLayerTiles | DrawLayerCustom;

//-------------------------------

export interface ToolUI {
  rollback: Event<any>;
  commit: Event<any>;
  inWork: boolean;
  drawLayers: readonly DrawLayer[];
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
  init: Event<any>;
  free: Event<any>;
  variants: readonly ToolVariantUI[];
  setVariant: Event<number>;
  $variant: Store<number>;
  $ui: Store<ToolUI>;
}
