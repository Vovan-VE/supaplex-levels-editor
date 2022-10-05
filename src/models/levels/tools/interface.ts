import { Event, Store } from "effector";
import { FC, PointerEvent } from "react";

export interface CellCoords {
  x: number;
  y: number;
}

type CopyEventProps = Pick<
  PointerEvent<any>,
  "type" | "button" | "buttons" | "altKey" | "ctrlKey" | "metaKey" | "shiftKey"
>;

export interface CellEventSnapshot extends CellCoords, CopyEventProps {
  width: number;
  height: number;
  inBounds: boolean;
}

export type GridPointerEvent = PointerEvent<HTMLDivElement>;
export type GridPointerEventHandler = (
  event: GridPointerEvent,
  cell: CellEventSnapshot,
) => void;

export interface GridEventsProps {
  onPointerDown?: GridPointerEventHandler | undefined;
  onPointerMove?: GridPointerEventHandler | undefined;
  onPointerUp?: GridPointerEventHandler | undefined;
  onPointerCancel?: GridPointerEventHandler | undefined;
  onPointerEnter?: GridPointerEventHandler | undefined;
  onPointerLeave?: GridPointerEventHandler | undefined;
}

//-------------------------------

export type CellKey = `${number}:${number}`;
export const cellKey = ({ x, y }: CellCoords): CellKey => `${x}:${y}`;

interface BaseDrawLayer extends CellCoords {
  type: string;
}

export interface TileCell extends CellCoords {
  tile: number;
}
export type TilesPath = ReadonlyMap<CellKey, TileCell>;
interface DrawLayerTiles extends BaseDrawLayer {
  type: "tiles";
  tiles: TilesPath;
}

interface DrawLayerCustom extends BaseDrawLayer {
  type: "custom";
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

export interface Tool {
  init: Event<any>;
  free: Event<any>;
  $ui: Store<ToolUI>;
}
