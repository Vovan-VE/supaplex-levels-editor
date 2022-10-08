import {
  FC,
  MutableRefObject,
  PointerEvent,
  TouchEventHandler,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import equal from "fast-deep-equal";
import {
  CellEventSnapshot,
  GridEventsProps,
  GridPointerEvent,
  GridPointerEventHandler,
} from "models/levels/tools";
import { ContainerProps } from "ui/types";
import cl from "./CoverGrid.module.scss";
import cn from "classnames";

const snapshotEvent = (
  {
    pageX,
    pageY,
    target,
    type,
    button,
    buttons,
    altKey,
    ctrlKey,
    metaKey,
    shiftKey,
  }: PointerEvent,
  cols: number,
  rows: number,
): CellEventSnapshot => {
  const div = target as Element;
  const { left, top } = div.getBoundingClientRect();
  const x = Math.floor(((pageX - left) / div.clientWidth) * cols);
  const y = Math.floor(((pageY - top) / div.clientHeight) * rows);

  return {
    x,
    y,
    width: cols,
    height: rows,
    inBounds: x >= 0 && x < cols && y >= 0 && y < rows,
    type,
    button,
    buttons,
    altKey,
    ctrlKey,
    metaKey,
    shiftKey,
  };
};

const useGridPointerEventHandler = (
  handler: GridPointerEventHandler | undefined,
  calcSnapshot: (event: PointerEvent) => CellEventSnapshot,
  prevSnapshot: MutableRefObject<CellEventSnapshot | undefined>,
) =>
  useMemo(
    () =>
      handler &&
      ((e: GridPointerEvent) => {
        if (e.isPrimary) {
          const snapshot = calcSnapshot(e);
          if (!equal(prevSnapshot.current, snapshot)) {
            prevSnapshot.current = snapshot;
            handler(e, snapshot);
          }
        }
      }),
    [handler, calcSnapshot, prevSnapshot],
  );

interface Props extends ContainerProps, GridEventsProps {
  cols: number;
  rows: number;
}

const enum TouchPhase {
  NO,
  ONE,
  DRAW,
  SCROLL,
}
const TOUCH_CLASSES: Partial<Record<TouchPhase, string>> = {
  [TouchPhase.ONE]: cl._one,
  [TouchPhase.DRAW]: cl._drawing,
  [TouchPhase.SCROLL]: cl._scrolling,
};

export const CoverGrid: FC<Props> = ({
  cols,
  rows,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerEnter,
  onPointerLeave,
  className,
  ...rest
}) => {
  const calc = useCallback(
    (e: PointerEvent) => snapshotEvent(e, cols, rows),
    [cols, rows],
  );

  const prev = useRef<CellEventSnapshot>();

  const [touchPhase, setTouchPhase] = useState(TouchPhase.NO);

  const handleDown = useGridPointerEventHandler(onPointerDown, calc, prev);
  const handleMove = useGridPointerEventHandler(
    touchPhase === TouchPhase.SCROLL ? undefined : onPointerMove,
    calc,
    prev,
  );
  const handleUp = useGridPointerEventHandler(onPointerUp, calc, prev);
  const handleCancel = useGridPointerEventHandler(onPointerCancel, calc, prev);
  const handleEnter = useGridPointerEventHandler(onPointerEnter, calc, prev);
  const handleLeave = useGridPointerEventHandler(onPointerLeave, calc, prev);

  const handleTouchStart = useCallback<TouchEventHandler>((e) => {
    if (e.changedTouches.length === 1 && e.targetTouches.length === 1) {
      // e.preventDefault();
      setTouchPhase((prev) => (prev === TouchPhase.NO ? TouchPhase.ONE : prev));
      return;
    }

    if (e.targetTouches.length >= 2) {
      // e.preventDefault();
      setTouchPhase((prev) =>
        [TouchPhase.NO, TouchPhase.ONE].includes(prev)
          ? TouchPhase.SCROLL
          : prev,
      );
    }
  }, []);
  const handleTouchCancel = useCallback<TouchEventHandler>((e) => {
    if (!e.targetTouches.length) {
      setTouchPhase(TouchPhase.NO);
    }
  }, []);
  const handleTouchEnd = useCallback<TouchEventHandler>((e) => {
    if (!e.targetTouches.length) {
      setTouchPhase(TouchPhase.NO);
    }
  }, []);

  const handleTouchMove = useCallback<TouchEventHandler>((e) => {
    if (e.changedTouches.length === 1 && e.targetTouches.length === 1) {
      // e.preventDefault();
      setTouchPhase((prev) =>
        prev === TouchPhase.ONE ? TouchPhase.DRAW : prev,
      );
    }
  }, []);

  return (
    <div
      {...rest}
      className={cn(cl.root, TOUCH_CLASSES[touchPhase], className)}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleCancel}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    />
  );
};