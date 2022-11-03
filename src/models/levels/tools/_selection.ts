import { combine } from "effector";
import { svgs } from "ui/icon";
import { a2o, fromDrag, inRect, o2a } from "utils/rect";
import { $currentLevelSize, IBounds } from "../../levelsets";
import { createDragTool } from "./_drag-tool";
import { DrawLayer, DrawLayerType, Tool, ToolUI } from "./interface";

interface P {
  x: number;
  y: number;
}
const enum Op {
  DEFINE = "d",
  STABLE = "s",
}
interface DefineRect {
  op: Op.DEFINE;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
interface StableRect extends P {
  op: Op.STABLE;
  w: number;
  h: number;
  dragPoint?: P;
  // TODO: content, fillOverlay
}
type DrawState = DefineRect | StableRect;

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
} = createDragTool<undefined, DrawState | null>({
  VARIANTS: [
    {
      internalName: "d",
      title: "Selection",
      Icon: svgs.Selection,
      drawProps: undefined,
    },
  ],
  idleState: null,
  drawReducer: (prev, { event: { x, y }, didDrag }) => {
    if (prev?.op === Op.STABLE) {
      // already has dragPoint set - that is continuous move selection
      if (prev.dragPoint) {
        // move selection
        return {
          ...prev,
          x: x - prev.dragPoint.x,
          y: y - prev.dragPoint.y,
          // TODO: ...(!prev.content && (x!==prev.x || y!==prev.y)) && {content, fillOverlay},
        };
      }

      // is it first "pointerdown" inside selection?
      if (!didDrag && inRect(x, y, o2a(prev))) {
        // starting drag inside selection
        return {
          ...prev,
          dragPoint: {
            x: x - prev.x,
            y: y - prev.y,
          },
        };
      }
    }

    if (!prev || prev.op !== Op.DEFINE) {
      return {
        op: Op.DEFINE,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      };
    }

    return {
      ...prev,
      endX: x,
      endY: y,
    };
  },
  drawEndReducer: ({ drawState, level }) => ({
    do: "continue",
    level: level,
    drawState:
      drawState?.op === Op.DEFINE
        ? {
            op: Op.STABLE,
            ...a2o(
              fromDrag(
                drawState.startX,
                drawState.startY,
                drawState.endX,
                drawState.endY,
              ),
            ),
          }
        : drawState?.dragPoint
        ? {
            ...drawState,
            dragPoint: undefined,
            // TODO: ...content ? paste to level AND {-content, -fillOverlay} : null
          }
        : drawState,
  }),
});

const selectFrame = (d: DrawState, level: IBounds): DrawLayer => {
  let x: number;
  let y: number;
  let width: number;
  let height: number;
  if (d.op === Op.STABLE) {
    ({ x, y, w: width, h: height } = d);
  } else {
    [x, y, width, height] = fromDrag(d.startX, d.startY, d.endX, d.endY);
  }
  const borders = new Set<"T" | "R" | "B" | "L">();
  if (x + width > level.width) {
    width = level.width - x;
  } else {
    borders.add("R");
  }
  if (y + height > level.height) {
    height = level.height - y;
  } else {
    borders.add("B");
  }
  if (x < 0) {
    width += x;
    x = 0;
  } else {
    borders.add("L");
  }
  if (y < 0) {
    height += y;
    y = 0;
  } else {
    borders.add("T");
  }

  return {
    type: DrawLayerType.SELECT_RANGE,
    x,
    y,
    width,
    height,
    borders,
  };
};

export const SELECTION: Tool = {
  internalName: "selection",
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
              // fill overlay when dragged
              // content when dragged
              // selection frame
              selectFrame(drawState, size),
            ]
          : undefined,
      events: isDragging ? eventsDragging : eventsIdle,
    }),
  ),
};

// $drawState.watch(console.log);
// SELECTION.$ui.watch((d) => console.log(d.drawLayers));
