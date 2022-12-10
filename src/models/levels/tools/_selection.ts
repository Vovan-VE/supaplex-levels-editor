import {
  combine,
  createEffect,
  createEvent,
  createStore,
  Event,
  forward,
  sample,
} from "effector";
import { IBaseLevel, ILevelRegion } from "drivers";
import { svgs } from "ui/icon";
import { isNotNull } from "utils/fn";
import { minmax } from "utils/number";
import {
  a2o,
  clipRect,
  fromDrag,
  IBounds,
  inRect,
  o2a,
  RectA,
} from "utils/rect";
import {
  $currentKey,
  $currentLevelIndex,
  $currentLevelSize,
  $currentLevelUndoQueue,
  updateCurrentLevel,
  updateLevel,
} from "../../levelsets";
import { $tileIndex, BodyVisibleRectGate } from "../current";
import { createDragTool } from "./_drag-tool";
import {
  DrawLayer,
  DrawLayerSelectRange,
  DrawLayerType,
  Tool,
  ToolUI,
} from "./interface";
import { $feedbackCell } from "./feedback";

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
  // if "dragging" being grabbed in this relative point
  dragPoint?: P;
  // content cut from level
  content?: ILevelRegion;
}
type DrawState = DefineRect | StableRect;

const fillRegionInLevel = (level: IBaseLevel, r: RectA, tile: number) =>
  level.batch((level) => {
    let [x0, y0, w, h] = clipRect(r, level);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        level = level.setTile(x0 + i, y0 + j, tile);
      }
    }
    return level;
  });

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
  drawStartReducer: ({ drawState, level }, { event: { x, y }, tile }) => {
    // already have previous selection
    if (drawState?.op === Op.STABLE) {
      let { x: cx, y: cy } = drawState;
      const r = o2a(drawState);
      // starting with pointer inside previous selection
      if (inRect(x, y, r)) {
        // it means "drag" selected region
        drawState = {
          ...drawState,
          dragPoint: {
            x: x - cx,
            y: y - cy,
          },
        };
        // if didn't cut content yet (didn't drag yet)
        if (!drawState.content) {
          // copy region from level
          // `drawState` is already copied above, so just setting prop
          drawState.content = level.copyRegion(...r);
          // then fill region in level
          level = fillRegionInLevel(level, r, tile);
        }
      } else {
        // starting outside previous selection
        // means to put previous selection and forgot about that
        if (drawState.content) {
          // if it has cut region (if was dragged), put it to level
          level = level.pasteRegion(cx, cy, drawState.content);
        }
        drawState = null;
      }
    }

    if (!drawState) {
      // start to define new selection
      drawState = {
        op: Op.DEFINE,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      };
    }

    return { drawState, level };
  },
  drawReducer: (prev, { event: { x, y, width, height } }) => {
    if (prev?.op === Op.STABLE) {
      if (prev.dragPoint) {
        // drag selection
        return {
          ...prev,
          // fix offsets to not let it go out of level
          x: minmax(x - prev.dragPoint.x, 1 - prev.w, width - 1),
          y: minmax(y - prev.dragPoint.y, 1 - prev.h, height - 1),
        };
      }

      // impossible case due to `start` reducer logic
      return prev;
    }

    if (!prev) {
      // impossible case due to `start` reducer logic
      return prev;
    }

    return {
      ...prev,
      endX: x,
      endY: y,
    };
  },
  drawEndReducer: ({ drawState, level }) => {
    if (drawState) {
      if (drawState.op === Op.DEFINE) {
        // end of "define" phase lead to "stable" phase
        const r = fromDrag(
          drawState.startX,
          drawState.startY,
          drawState.endX,
          drawState.endY,
        );
        drawState = {
          op: Op.STABLE,
          ...a2o(r),
        };
      } else if (drawState.dragPoint) {
        // end of "dragging"
        drawState = {
          ...drawState,
          dragPoint: undefined,
        };
      }
    }
    return {
      do: "continue",
      level,
      drawState,
    };
  },
});

const dragContent = (d: DrawState): DrawLayer | null => {
  if (d.op === Op.STABLE && d.content) {
    return {
      type: DrawLayerType.TILES_REGION,
      x: d.x,
      y: d.y,
      tiles: d.content.tiles,
    };
  }
  return null;
};

const selectFrame = (d: DrawState, level: IBounds): DrawLayerSelectRange => {
  const fullRect =
    d.op === Op.STABLE ? o2a(d) : fromDrag(d.startX, d.startY, d.endX, d.endY);

  const borders = new Set<"T" | "R" | "B" | "L">();
  const [fX, fY, fW, fH] = fullRect;
  if (fX + fW <= level.width) {
    borders.add("R");
  }
  if (fY + fH <= level.height) {
    borders.add("B");
  }
  if (fX >= 0) {
    borders.add("L");
  }
  if (fY >= 0) {
    borders.add("T");
  }

  const [x, y, width, height] = clipRect(fullRect, level);
  return {
    type: DrawLayerType.SELECT_RANGE,
    x,
    y,
    width,
    height,
    borders,
  };
};

const commitOnEnd = (target: Event<any>) => {
  const willEndWork = createEvent<any>();
  const doEndWork = sample({
    clock: willEndWork,
    source: {
      s: $drawState,
      q: $currentLevelUndoQueue,
      key: $currentKey,
      index: $currentLevelIndex,
    },
    fn: ({ s, q, key, index }) =>
      q && s?.op === Op.STABLE && s.content && key !== null && index !== null
        ? { key, index, level: q.current.pasteRegion(s.x, s.y, s.content) }
        : null,
  });
  sample({
    source: doEndWork,
    filter: Boolean,
    target: updateLevel,
  });
  forward({
    from: doEndWork,
    to: target,
  });
  return willEndWork;
};

const externalFree = createEvent<any>();
const externalRollback = createEvent<any>();
forward({ from: externalFree, to: commitOnEnd(free) });
forward({ from: externalRollback, to: commitOnEnd(rollback) });

export const SELECTION: Tool = {
  internalName: "selection",
  free: externalFree,
  variants,
  setVariant,
  $variant,
  $ui: combine(
    $isDragging,
    $drawState,
    $currentLevelSize,
    (isDragging, drawState, size): ToolUI => {
      const sel = drawState && size ? selectFrame(drawState, size) : null;

      return {
        rollback: externalRollback,
        drawLayers:
          drawState && size
            ? [
                // content when dragged
                dragContent(drawState),
                // selection frame
                sel,
              ].filter(isNotNull)
            : undefined,
        drawCursor: sel
          ? [
              {
                cursor: drawState?.op === Op.STABLE ? "move" : "cell",
                rect: [
                  {
                    x: sel.x,
                    y: sel.y,
                    w: sel.width,
                    h: sel.height,
                  },
                ],
              },
            ]
          : undefined,
        events: isDragging ? eventsDragging : eventsIdle,
      };
    },
  ),
};

// $isDragging.watch((v) => console.log("isDragging", v));
// $drawState.watch((v) => console.log("state", v));
// SELECTION.$ui.watch((d) => console.log("ui", d.drawLayers, d.drawCursor));

const _setState = createEvent<DrawState>();
forward({ from: _setState, to: $drawState });
$isDragging.reset(_setState);

export const $hasSelection = $drawState.map((d) => d?.op === Op.STABLE);

export const deleteSelectionFx = createEffect(async () => {
  const drawState = $drawState.getState();
  const q = $currentLevelUndoQueue.getState();
  if (q && drawState?.op === Op.STABLE && !drawState.content) {
    const tile = $tileIndex.getState();
    updateCurrentLevel(fillRegionInLevel(q.current, o2a(drawState), tile));
  }
  rollback();
});

export const copySelection = createEvent<any>();
// TODO: driver compatibility?
export const $clipboardRegion = createStore<ILevelRegion | null>(null).on(
  sample({
    clock: sample({
      clock: copySelection,
      source: $drawState,
      filter: (d): d is StableRect => d?.op === Op.STABLE,
    }),
    source: $currentLevelUndoQueue,
    filter: Boolean,
    fn: (q, s) => s.content ?? q.current.copyRegion(s.x, s.y, s.w, s.h),
  }),
  (_, next) => next,
);
export const $clipboardRegionSizeStr = $clipboardRegion.map((r) =>
  r ? `${r.tiles.width}x${r.tiles.height}` : null,
);

export const cutSelectionFx = createEffect(() => {
  copySelection();
  return deleteSelectionFx();
});

// only run after activating selection tool
export const pasteSelectionFx = createEffect(async (visibleRect?: RectA) => {
  externalRollback();
  const region = $clipboardRegion.getState();
  if (region) {
    let x = 0;
    let y = 0;
    if (visibleRect) {
      [x, y] = visibleRect;
    } else {
      const hoverCell = $feedbackCell.getState();
      if (hoverCell) {
        x = hoverCell.x - Math.floor(region.tiles.width / 2);
        y = hoverCell.y - Math.floor(region.tiles.height / 2);
      } else {
        const bodyRect = BodyVisibleRectGate.state.getState().rect;
        if (bodyRect) {
          [x, y] = bodyRect;
        }
      }
    }

    _setState({
      op: Op.STABLE,
      x,
      y,
      w: region.tiles.width,
      h: region.tiles.height,
      content: region,
    });
  }
});
