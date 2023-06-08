import { combine } from "effector";
import * as RoMap from "@cubux/readonly-map";
import { svgs } from "ui/icon";
import {
  clipRect,
  fromDrag,
  IBounds,
  inBounds,
  lineInterpolation,
} from "utils/rect";
import { $currentLevelSize } from "../../levelsets";
import { cellKey, DrawLayerType, TilesPath, Tool, ToolUI } from "./interface";
import { createDragTool } from "./_drag-tool";

export const enum RectType {
  FRAME,
  FILL,
  LINE,
}
interface DrawProps {
  rectType: RectType;
}
interface DrawState extends DrawProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  tile: number;
}

type DrawRectFn = (
  state: DrawState,
  limit: IBounds,
  draw: (x: number, y: number) => void,
) => void;

const drawers: Record<RectType, DrawRectFn> = {
  [RectType.FRAME]: (s, { width, height }, draw) => {
    const {
      x,
      y,
      width: w,
      height: h,
    } = fromDrag(s.startX, s.startY, s.endX, s.endY);
    const preH = h - 1;
    const endX = x + w - 1;
    const endY = y + preH;
    const L = Math.max(w, h);
    for (let i = 0; i < L; i++) {
      if (i < w) {
        const cx = x + i;
        if (cx >= 0 && cx < width) {
          if (y >= 0 && y < height) {
            draw(cx, y);
          }
          if (endY >= 0 && endY < height) {
            draw(cx, endY);
          }
        }
      }
      if (i > 0 && i < preH) {
        const cy = y + i;
        if (cy >= 0 && cy < height) {
          if (x >= 0 && x < width) {
            draw(x, cy);
          }
          if (endX >= 0 && endX < width) {
            draw(endX, cy);
          }
        }
      }
    }
  },
  [RectType.FILL]: (s, limit, draw) => {
    const { x, y, width, height } = clipRect(
      fromDrag(s.startX, s.startY, s.endX, s.endY),
      limit,
    );
    for (let j = height; j-- > 0; ) {
      const cy = y + j;
      for (let i = width; i-- > 0; ) {
        draw(x + i, cy);
      }
    }
  },
  [RectType.LINE]: (s, limit, draw) => {
    for (const { x, y } of lineInterpolation(
      { x: s.startX, y: s.startY },
      { x: s.endX, y: s.endY },
    )) {
      if (inBounds(x, y, limit)) {
        draw(x, y);
      }
    }
  },
};

const drawRect = <T>(
  v: T,
  b: IBounds,
  state: DrawState,
  draw: (v: T, x: number, y: number, tile: number) => T,
): T => {
  const { rectType, tile } = state;
  drawers[rectType](state, b, (x, y) => {
    v = draw(v, x, y, tile);
  });
  return v;
};

const {
  free,
  variants,
  setVariant,
  $variant,

  $isDragging,
  $drawState,
  rollback,
  eventsIdle,
  eventsDragging,
} = createDragTool<DrawProps, DrawState | null>({
  VARIANTS: [
    {
      internalName: "line",
      title: "Straight line",
      Icon: svgs.Line,
      drawProps: {
        rectType: RectType.LINE,
      },
    },
    {
      internalName: "frame",
      title: "Frame",
      Icon: svgs.RectFrame,
      drawProps: {
        rectType: RectType.FRAME,
      },
    },
    {
      internalName: "fill",
      title: "Filled Rect",
      Icon: svgs.RectFill,
      drawProps: {
        rectType: RectType.FILL,
      },
    },
  ],
  idleState: null,
  drawReducer: (prev, { event: { x, y }, tile, drawProps: { rectType } }) =>
    prev
      ? {
          ...prev,
          endX: x,
          endY: y,
        }
      : {
          startX: x,
          startY: y,
          endX: x,
          endY: y,
          tile,
          rectType,
        },
  drawEndReducer: ({ level, drawState }) => ({
    do: "commit",
    level: level.batch((level) =>
      drawRect(level, level, drawState!, (level, x, y, tile) =>
        level.setTile(x, y, tile, true),
      ),
    ),
  }),
});

export const RECT: Tool = {
  internalName: "rect",
  free,
  variants,
  setVariant,
  $variant,
  $ui: combine(
    $isDragging,
    $drawState,
    $currentLevelSize,
    (isDragging, drawState, size): ToolUI => ({
      rollback,
      drawLayers:
        drawState && size
          ? [
              drawState.rectType === RectType.FILL
                ? {
                    type: DrawLayerType.TILE_FILL,
                    tile: drawState.tile,
                    ...clipRect(
                      fromDrag(
                        drawState.startX,
                        drawState.startY,
                        drawState.endX,
                        drawState.endY,
                      ),
                      size,
                    ),
                  }
                : {
                    x: 0,
                    y: 0,
                    type: DrawLayerType.TILES,
                    tiles: drawRect<TilesPath>(
                      new Map(),
                      size,
                      drawState,
                      (m, x, y, tile) =>
                        RoMap.set(m, cellKey({ x, y }), { x, y, tile }),
                    ),
                  },
            ]
          : undefined,
      events: isDragging ? eventsDragging : eventsIdle,
    }),
  ),
};
