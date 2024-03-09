import { IBounds, Point2D } from "../utils/rect";
import { PointerEvent } from "react";

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

export type GridPickTileEventHandler = (at: Point2D) => void;

export interface GridEventsProps {
  onPointerDown?: GridPointerEventHandler | undefined;
  onPointerMove?: GridPointerEventHandler | undefined;
  onPointerUp?: GridPointerEventHandler | undefined;
  onPointerCancel?: GridPointerCancelEventHandler | undefined;
  onPointerEnter?: GridPointerEventHandler | undefined;
  onPointerLeave?: GridPointerEventHandler | undefined;
  onClick?: GridPointerEventHandler | undefined;
  onContextMenu?: GridContextEventHandler | undefined;
  onPickTile?: GridPickTileEventHandler | undefined;
}
