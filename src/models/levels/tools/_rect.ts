import { combine, sample } from "effector";
import * as RoMap from "@cubux/readonly-map";
import { svgs } from "ui/icon";
import { $currentLevelSize, updateCurrentLevel } from "../../levelsets";
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
  limit: readonly [w: number, h: number],
  draw: (x: number, y: number) => void,
) => void;

const drawers: Record<RectType, DrawRectFn> = {
  [RectType.FRAME]: ([x, y, w, h], [maxW, maxH], draw) => {
    const preH = h - 1;
    const endX = x + w - 1;
    const endY = y + preH;
    const L = Math.max(w, h);
    for (let i = 0; i < L; i++) {
      if (i < w) {
        const cx = x + i;
        if (cx >= 0 && cx < maxW) {
          if (y >= 0 && y < maxH) {
            draw(cx, y);
          }
          if (endY >= 0 && endY < maxH) {
            draw(cx, endY);
          }
        }
      }
      if (i > 0 && i < preH) {
        const cy = y + i;
        if (cy >= 0 && cy < maxH) {
          if (x >= 0 && x < maxW) {
            draw(x, cy);
          }
          if (endX >= 0 && endX < maxW) {
            draw(endX, cy);
          }
        }
      }
    }
  },
  [RectType.FILL]: ([x, y, w, h], [maxW, maxH], draw) => {
    let endX = x + w;
    let endY = y + h;
    if (x < 0) {
      x = 0;
    } else if (endX > maxW) {
      endX = maxW;
    }
    if (y < 0) {
      y = 0;
    } else if (endY > maxH) {
      endY = maxH;
    }
    for (let j = y; j < endY; j++) {
      for (let i = x; i < endX; i++) {
        draw(i, j);
      }
    }
  },
};

const getRange = (a: number, b: number): [start: number, length: number] => {
  if (a > b) {
    [a, b] = [b, a];
  }
  // `a` can be <0 and/or `b` can be >=max
  return [a, b - a + 1];
};

const drawRect = <T>(
  v: T,
  width: number,
  height: number,
  { rectType, tile, startX, startY, endX, endY }: DrawState,
  draw: (v: T, x: number, y: number, tile: number) => T,
): T => {
  const [x, w] = getRange(startX, endX);
  const [y, h] = getRange(startY, endY);
  drawers[rectType]([x, y, w, h], [width, height], (x, y) => {
    v = draw(v, x, y, tile);
  });
  return v;
};

const getFillRect = (
  { startX, startY, endX, endY }: DrawState,
  width: number,
  height: number,
) => {
  let [x1, x2] = startX <= endX ? [startX, endX] : [endX, startX];
  let [y1, y2] = startY <= endY ? [startY, endY] : [endY, startY];
  if (x1 < 0) {
    x1 = 0;
  }
  if (y1 < 0) {
    y1 = 0;
  }
  if (x2 >= width) {
    x2 = width - 1;
  }
  if (y2 >= height) {
    y2 = height - 1;
  }
  return {
    x: x1,
    y: y1,
    width: x2 - x1 + 1,
    height: y2 - y1 + 1,
  };
};

const {
  free,
  variants,
  setVariant,
  $variant,

  $isDrawing,
  $drawState,
  rollback,
  commit,
  doCommit,
  eventsIdle,
  eventsWork,
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
});

sample({
  source: doCommit,
  filter: ({ drawState }) => Boolean(drawState),
  fn: ({ level, drawState }) =>
    level.batch((level) =>
      drawRect(
        level,
        level.width,
        level.height,
        drawState!,
        (level, x, y, tile) => level.setTile(x, y, tile),
      ),
    ),
  target: updateCurrentLevel,
});

export const RECT: Tool = {
  internalName: "rect",
  free,
  variants,
  setVariant,
  $variant,
  $ui: combine(
    $isDrawing,
    $drawState,
    $currentLevelSize,
    (inWork, drawState, size): ToolUI => ({
      rollback,
      commit,
      inWork,
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
                      size.width,
                      size.height,
                      drawState,
                      (m, x, y, tile) =>
                        RoMap.set(m, cellKey({ x, y }), { x, y, tile }),
                    ),
                  }
                : {
                    type: DrawLayerType.TILE_FILL,
                    tile: drawState.tile,
                    ...getFillRect(drawState, size.width, size.height),
                  },
            ]
          : [],
      events: inWork ? eventsWork : eventsIdle,
    }),
  ),
};
