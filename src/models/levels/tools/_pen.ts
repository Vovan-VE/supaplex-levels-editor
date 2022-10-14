import { combine, sample } from "effector";
import * as RoMap from "@cubux/readonly-map";
import { svgs } from "ui/icon";
import { updateCurrentLevel } from "../../levelsets";
import { cellKey, DrawLayerType, TilesPath, Tool, ToolUI } from "./interface";
import { createDragTool } from "./_drag-tool";

const enum PenShape {
  DOT,
  _3x3,
  // TODO: 2x1 & 1x2 with driver specific hacks (sp double chips)
}
const SHAPES: Record<PenShape, readonly [x: number, y: number][]> = {
  [PenShape.DOT]: [[0, 0]],
  [PenShape._3x3]: [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [0, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ],
};

interface DrawProps {
  shape: PenShape;
}

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
} = createDragTool<DrawProps, TilesPath>({
  VARIANTS: [
    {
      internalName: "x1",
      title: "Pencil",
      Icon: svgs.Pencil,
      drawProps: {
        shape: PenShape.DOT,
      },
    },
    {
      internalName: "x3",
      title: "Pencil 3x3",
      Icon: svgs.Grid3x3,
      drawProps: {
        shape: PenShape._3x3,
      },
    },
  ],
  idleState: new Map(),
  drawReducer: (
    path,
    { event: { x: ex, y: ey, width, height }, tile, drawProps: { shape } },
  ) =>
    SHAPES[shape].reduce((path, [dx, dy]) => {
      const x = ex + dx;
      const y = ey + dy;
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const key = cellKey({ x, y });
        if (path.get(key)?.tile !== tile) {
          return RoMap.set(path, key, { x, y, tile });
        }
      }
      return path;
    }, path),
});

sample({
  source: doCommit,
  fn: ({ level, drawState }) =>
    RoMap.reduce(
      drawState,
      (level, { x, y, tile }) => level.setTile(x, y, tile),
      level,
    ),
  target: updateCurrentLevel,
});

export const PEN: Tool = {
  internalName: "pen",
  free,
  variants,
  setVariant,
  $variant,
  $ui: combine(
    $isDrawing,
    $drawState,
    (inWork, tiles): ToolUI => ({
      rollback,
      commit,
      inWork,
      drawLayers: [{ x: 0, y: 0, type: DrawLayerType.TILES, tiles }],
      events: inWork ? eventsWork : eventsIdle,
    }),
  ),
};
