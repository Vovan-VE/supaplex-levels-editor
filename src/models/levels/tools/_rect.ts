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
  x: number,
  y: number,
  w: number,
  h: number,
  draw: (x: number, y: number) => void,
) => void;

const drawers: Record<RectType, DrawRectFn> = {
  [RectType.FRAME]: (x, y, w, h, draw) => {
    const preH = h - 1;
    const endX = x + w - 1;
    const endY = y + preH;
    const L = Math.max(w, h);
    for (let i = 0; i < L; i++) {
      if (i < w) {
        const cx = x + i;
        draw(cx, y);
        draw(cx, endY);
      }
      if (i > 0 && i < preH) {
        const cy = y + i;
        draw(x, cy);
        draw(endX, cy);
      }
    }
  },
  [RectType.FILL]: (x, y, w, h, draw) => {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        draw(x + i, y + j);
      }
    }
  },
};

const getRange = (
  a: number,
  b: number,
  max: number,
): [start: number, length: number] => {
  if (a > b) {
    [a, b] = [b, a];
  }
  if (a < 0) {
    a = 0;
  }
  if (b >= max) {
    b = max - 1;
  }
  return [a, b - a + 1];
};

const drawRect = <T>(
  v: T,
  width: number,
  height: number,
  { rectType, tile, startX, startY, endX, endY }: DrawState,
  draw: (v: T, x: number, y: number, tile: number) => T,
): T => {
  const [x, w] = getRange(startX, endX, width);
  const [y, h] = getRange(startY, endY, height);
  drawers[rectType](x, y, w, h, (x, y) => {
    v = draw(v, x, y, tile);
  });
  return v;
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
    drawRect(
      level,
      level.width,
      level.height,
      drawState!,
      (level, x, y, tile) => level.setTile(x, y, tile),
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
              {
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
              },
            ]
          : [],
      events: inWork ? eventsWork : eventsIdle,
    }),
  ),
};
