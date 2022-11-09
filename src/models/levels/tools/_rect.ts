import { combine } from "effector";
import * as RoMap from "@cubux/readonly-map";
import { svgs } from "ui/icon";
import { clipRect, fromDrag, IBounds } from "utils/rect";
import { $currentLevelSize } from "../../levelsets";
import { cellKey, DrawLayerType, TilesPath, Tool, ToolUI } from "./interface";
import { createDragTool } from "./_drag-tool";

export const enum RectType {
  FRAME,
  FILL,
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
  rect: readonly [x: number, y: number, w: number, h: number],
  limit: IBounds,
  draw: (x: number, y: number) => void,
) => void;

const drawers: Record<RectType, DrawRectFn> = {
  [RectType.FRAME]: ([x, y, w, h], { width, height }, draw) => {
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
  [RectType.FILL]: ([x, y, w, h], { width, height }, draw) => {
    let endX = x + w;
    let endY = y + h;
    if (x < 0) {
      x = 0;
    } else if (endX > width) {
      endX = width;
    }
    if (y < 0) {
      y = 0;
    } else if (endY > height) {
      endY = height;
    }
    for (let j = y; j < endY; j++) {
      for (let i = x; i < endX; i++) {
        draw(i, j);
      }
    }
  },
};

const drawRect = <T>(
  v: T,
  b: IBounds,
  { rectType, tile, startX, startY, endX, endY }: DrawState,
  draw: (v: T, x: number, y: number, tile: number) => T,
): T => {
  drawers[rectType](fromDrag(startX, startY, endX, endY), b, (x, y) => {
    v = draw(v, x, y, tile);
  });
  return v;
};

const getFillRect = ({ startX, startY, endX, endY }: DrawState, b: IBounds) => {
  const [x, y, width, height] = clipRect(
    fromDrag(startX, startY, endX, endY),
    b,
  );
  return { x, y, width, height };
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
        level.setTile(x, y, tile),
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
              drawState.rectType === RectType.FRAME
                ? {
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
                  }
                : {
                    type: DrawLayerType.TILE_FILL,
                    tile: drawState.tile,
                    ...getFillRect(drawState, size),
                  },
            ]
          : undefined,
      events: isDragging ? eventsDragging : eventsIdle,
    }),
  ),
};
