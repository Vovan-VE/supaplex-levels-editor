import { combine } from "effector";
import * as RoMap from "@cubux/readonly-map";
import {
  HK_TOOL_PEN,
  HK_TOOL_PEN2,
  HK_TOOL_PEN3,
} from "models/ui/hotkeys-defined";
import { svgs } from "ui/icon";
import { inBounds } from "utils/rect";
import {
  cellKey,
  DrawLayerType,
  PEN_SHAPES,
  PenShape,
  TilesPath,
  Tool,
  ToolUI,
} from "./interface";
import { createDragTool } from "./_drag-tool";

interface DrawProps {
  shape: PenShape;
}

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
} = createDragTool<DrawProps, TilesPath>({
  VARIANTS: [
    {
      internalName: "x1",
      title: (t) => t("main:drawing.Pencil"),
      Icon: svgs.Pencil,
      hotkey: HK_TOOL_PEN,
      drawProps: {
        shape: PenShape.DOT,
      },
    },
    {
      internalName: "x1x2",
      title: (t) => t("main:drawing.Pencil1x2"),
      Icon: svgs.Grid1x2,
      hotkey: HK_TOOL_PEN2,
      drawProps: {
        shape: PenShape._1x2,
      },
    },
    {
      internalName: "x2x1",
      title: (t) => t("main:drawing.Pencil2x1"),
      Icon: svgs.Grid2x1,
      hotkey: HK_TOOL_PEN2,
      drawProps: {
        shape: PenShape._2x1,
      },
    },
    {
      internalName: "x3",
      title: (t) => t("main:drawing.Pencil3x3"),
      Icon: svgs.Grid3x3,
      hotkey: HK_TOOL_PEN3,
      drawProps: {
        shape: PenShape._3x3,
      },
    },
  ],
  idleState: new Map(),
  drawReducer: (
    path,
    {
      event,
      tile,
      drawProps: { shape },
      drvStructs: { [shape]: { setTiles = undefined } = {} } = {},
    },
  ) =>
    PEN_SHAPES[shape].reduce((path, [dx, dy], i) => {
      const x = event.x + dx;
      const y = event.y + dy;
      if (inBounds(x, y, event)) {
        const key = cellKey({ x, y });
        const newTile = setTiles?.[i] ?? tile;
        if (path.get(key)?.tile !== newTile) {
          return RoMap.set(path, key, { x, y, tile: newTile });
        }
      }
      return path;
    }, path),
  drawEndReducer: ({ level, drawState }) => ({
    do: "commit",
    level: level.batch((level) =>
      RoMap.reduce(
        drawState,
        (level, { x, y, tile }) => level.setTile(x, y, tile, true),
        level,
      ),
    ),
  }),
});

export const PEN: Tool = {
  internalName: "pen",
  free,
  variants,
  setVariant,
  $variant,
  $ui: combine(
    $isDragging,
    $drawState,
    (isDragging, tiles): ToolUI => ({
      rollback,
      drawLayers: [{ x: 0, y: 0, type: DrawLayerType.TILES, tiles }],
      events: isDragging ? eventsDragging : eventsIdle,
    }),
  ),
};
