import cn from "classnames";
import { useStore } from "effector-react";
import equal from "fast-deep-equal";
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
import {
  $cursor,
  CellEventSnapshot,
  DrawCursor,
  GridEventsProps,
  GridPointerEvent,
  GridPointerEventHandler,
  removeFeedbackCell,
  setFeedbackCell,
} from "models/levels/tools";
import { ContainerProps } from "ui/types";
import { inRect } from "utils/rect";
import cl from "./CoverGrid.module.scss";

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
  width: number,
  height: number,
): CellEventSnapshot => {
  const div = target as Element;
  const { left, top } = div.getBoundingClientRect();
  const x = Math.floor(((pageX - left) / div.clientWidth) * width);
  const y = Math.floor(((pageY - top) / div.clientHeight) * height);

  return {
    x,
    y,
    width,
    height,
    inBounds: inRect(x, y, { x: 0, y: 0, width, height }),
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
  drawCursor?: readonly DrawCursor[];
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
  drawCursor,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onContextMenu,
  className,
  ...rest
}) => {
  const calc = useCallback(
    (e: PointerEvent) => snapshotEvent(e, cols, rows),
    [cols, rows],
  );
  const prev = useRef<CellEventSnapshot>();
  const [touchPhase, setTouchPhase] = useState(TouchPhase.NO);

  const cursor = useStore($cursor);

  const handleDown = useGridPointerEventHandler(
    useCallback<GridPointerEventHandler>(
      (e, cell) => {
        if (e.isPrimary) {
          try {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          } catch {}
        }
        onPointerDown?.(e, cell);
      },
      [onPointerDown],
    ),
    calc,
    prev,
  );
  const _onMove = touchPhase === TouchPhase.SCROLL ? undefined : onPointerMove;
  const handleMove = useGridPointerEventHandler(
    useCallback<GridPointerEventHandler>(
      (e, cell) => {
        setFeedbackCell(cell);
        _onMove?.(e, cell);
      },
      [_onMove],
    ),
    calc,
    prev,
  );
  const handleUp = useGridPointerEventHandler(
    useCallback<GridPointerEventHandler>(
      (e, cell) => {
        if (e.isPrimary) {
          try {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
          } catch {}
        }
        onPointerUp?.(e, cell);
      },
      [onPointerUp],
    ),
    calc,
    prev,
  );
  const handleCancel = useGridPointerEventHandler(
    useCallback<GridPointerEventHandler>(
      (e, cell) => {
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
        onPointerCancel?.(e, cell);
      },
      [onPointerCancel],
    ),
    calc,
    prev,
  );
  const handleEnter = useGridPointerEventHandler(
    useCallback<GridPointerEventHandler>(
      (e, cell) => {
        setFeedbackCell(cell);
        onPointerEnter?.(e, cell);
      },
      [onPointerEnter],
    ),
    calc,
    prev,
  );
  const handleLeave = useGridPointerEventHandler(
    useCallback<GridPointerEventHandler>(
      (e, cell) => {
        removeFeedbackCell();
        onPointerLeave?.(e, cell);
      },
      [onPointerLeave],
    ),
    calc,
    prev,
  );
  const handleClick = useMemo(
    () => onClick && ((e: GridPointerEvent) => onClick(e, calc(e))),
    [onClick, calc],
  );

  const handleContextMenu = useCallback(
    (e: GridPointerEvent) => {
      e.preventDefault();
      const cell = calc(e);
      onContextMenu?.(cell);
      onPointerCancel?.(e, cell);
    },
    [onPointerCancel, onContextMenu, calc],
  );

  const handleTouchStart = useCallback<TouchEventHandler>((e) => {
    if (e.changedTouches.length === 1 && e.targetTouches.length === 1) {
      setTouchPhase((prev) => (prev === TouchPhase.NO ? TouchPhase.ONE : prev));
      return;
    }

    if (e.targetTouches.length >= 2) {
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
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={cursor ? { cursor } : undefined}
    />
  );
};
