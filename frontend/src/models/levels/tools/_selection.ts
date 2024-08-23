import {
  combine,
  createEffect,
  createEvent,
  createStore,
  EventCallable,
  sample,
} from "effector";
import { IBaseLevel, ILevelRegion } from "drivers";
import { HK_TOOL_SELECTION } from "models/ui/hotkeys-defined";
import { svgs } from "ui/icon";
import { isNotNull } from "utils/fn";
import { minmax } from "utils/number";
import { clipRect, fromDrag, IBounds, inRect, Point2D, Rect } from "utils/rect";
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
interface StableRect extends Rect {
  op: Op.STABLE;
  // if "dragging" being grabbed in this relative point
  dragPoint?: Point2D;
  // content cut from level
  content?: ILevelRegion;
}
type DrawState = DefineRect | StableRect;

const fillRegionInLevel = (level: IBaseLevel, r: Rect, tile: number) =>
  level.batch((level) => {
    const { x, y, width, height } = clipRect(r, level);
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        level = level.setTile(x + i, y + j, tile, true);
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
  canRo: true,
  VARIANTS: [
    {
      internalName: "d",
      title: (t) => t("main:drawing.Selection"),
      Icon: svgs.Selection,
      hotkey: HK_TOOL_SELECTION,
      drawProps: undefined,
    },
  ],
  idleState: null,
  drawStartReducer: (prev, { event: { x, y }, tile, isRo }) => {
    let { drawState, level } = prev;
    // already have previous selection
    if (drawState?.op === Op.STABLE) {
      const { x: cx, y: cy } = drawState;
      // starting with pointer inside previous selection
      if (inRect(x, y, drawState)) {
        // it means "drag" selected region
        if (isRo) {
          return prev;
        }
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
          drawState.content = level.copyRegion(drawState);
          // then fill region in level
          level = fillRegionInLevel(level, drawState, tile);
        }
      } else {
        // starting outside previous selection
        // means to put previous selection and forgot about that
        if (drawState.content && !isRo) {
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
  drawReducer: (prev, { event: { x, y, width, height }, isRo }) => {
    if (prev?.op === Op.STABLE) {
      if (isRo) {
        return prev;
      }
      if (prev.dragPoint) {
        // drag selection
        return {
          ...prev,
          // fix offsets to not let it go out of level
          x: minmax(x - prev.dragPoint.x, 1 - prev.width, width - 1),
          y: minmax(y - prev.dragPoint.y, 1 - prev.height, height - 1),
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
        drawState = {
          op: Op.STABLE,
          ...fromDrag(
            drawState.startX,
            drawState.startY,
            drawState.endX,
            drawState.endY,
          ),
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
  const fullRect: Rect =
    d.op === Op.STABLE ? d : fromDrag(d.startX, d.startY, d.endX, d.endY);

  const borders = new Set<"T" | "R" | "B" | "L">();
  if (fullRect.x + fullRect.width <= level.width) {
    borders.add("R");
  }
  if (fullRect.y + fullRect.height <= level.height) {
    borders.add("B");
  }
  if (fullRect.x >= 0) {
    borders.add("L");
  }
  if (fullRect.y >= 0) {
    borders.add("T");
  }

  return {
    type: DrawLayerType.SELECT_RANGE,
    ...clipRect(fullRect, level),
    borders,
  };
};

const commitOnEnd = (target: EventCallable<unknown>) => {
  const willEndWork = createEvent<unknown>();
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
  sample({ source: doEndWork, target });
  return willEndWork;
};

const externalFree = createEvent<unknown>();
const externalRollback = createEvent<unknown>();
sample({ source: externalFree, target: commitOnEnd(free) });
sample({ source: externalRollback, target: commitOnEnd(rollback) });

export const SELECTION: Tool = {
  internalName: "selection",
  free: externalFree,
  canRo: true,
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
                    width: sel.width,
                    height: sel.height,
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

const _setState = createEvent<DrawState>();
sample({ source: _setState, target: $drawState });
$isDragging.reset(_setState);

export const $hasSelection = $drawState.map((d) => d?.op === Op.STABLE);
export const $selectionSize = $drawState.map<IBounds | null>((d) => {
  if (d?.op !== Op.STABLE) {
    return null;
  }
  return { width: d.width, height: d.height };
});
const $selectionSizeHash = $selectionSize.map(
  (s) => s && (`${s.width}x${s.height}` as const),
);

interface RectWithContent extends Rect {
  content?: ILevelRegion;
}
export const $selectionRect = $drawState.map<RectWithContent | null>((d) => {
  if (!d || d.op !== Op.STABLE) {
    return null;
  }
  const { x, y, width, height, content } = d;
  return { x, y, width, height, content };
});
export const $selectionFeedback = $drawState.map<Rect | null>((d) => {
  if (!d) {
    return null;
  }
  switch (d.op) {
    case Op.DEFINE:
      return fromDrag(d.startX, d.startY, d.endX, d.endY);
    case Op.STABLE: {
      const { x, y, width, height } = d;
      return { x, y, width, height };
    }
    default:
      return null;
  }
});

export const deleteSelectionFx = createEffect(async () => {
  if ($openedSelectionEdit.getState()) {
    return;
  }
  const drawState = $drawState.getState();
  const q = $currentLevelUndoQueue.getState();
  if (q && drawState?.op === Op.STABLE && !drawState.content) {
    const tile = $tileIndex.getState();
    updateCurrentLevel(fillRegionInLevel(q.current, drawState, tile));
  }
  rollback();
});

export const copySelection = createEvent<unknown>();
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
    fn: (q, s) => s.content ?? q.current.copyRegion(s),
  }),
  (_, next) => next,
);
export const $clipboardRegionSizeStr = $clipboardRegion.map((r) =>
  r ? `${r.tiles.width}x${r.tiles.height}` : null,
);

export const cutSelectionFx = createEffect(() => {
  if ($openedSelectionEdit.getState()) {
    return;
  }
  copySelection();
  return deleteSelectionFx();
});

// only run after activating selection tool
export const pasteSelectionFx = createEffect(async (visibleRect?: Rect) => {
  if ($openedSelectionEdit.getState()) {
    return;
  }
  externalRollback();
  const region = $clipboardRegion.getState();
  if (region) {
    let x = 0;
    let y = 0;
    if (visibleRect) {
      ({ x, y } = visibleRect);
    } else {
      const hoverCell = $feedbackCell.getState();
      if (hoverCell) {
        x = hoverCell.x - Math.floor(region.tiles.width / 2);
        y = hoverCell.y - Math.floor(region.tiles.height / 2);
      } else {
        const bodyRect = BodyVisibleRectGate.state.getState().rect;
        if (bodyRect) {
          ({ x, y } = bodyRect);
        }
      }
    }

    _setState({
      op: Op.STABLE,
      x,
      y,
      width: region.tiles.width,
      height: region.tiles.height,
      content: region,
    });
  }
});

export const selectAllFx = createEffect(
  async ({ almost = false }: { almost?: boolean } = {}) => {
    const q = $currentLevelUndoQueue.getState();
    if (!q) return;
    if ($openedSelectionEdit.getState()) return;
    externalRollback();
    let { width, height } = q.current;
    let x = 0;
    let y = 0;
    if (almost) {
      x++;
      y++;
      width -= 2;
      height -= 2;
      if (width <= 0 || height <= 0) return;
    }
    _setState({
      op: Op.STABLE,
      x,
      y,
      width,
      height,
    });
  },
);

export const getSelectionContentFx = createEffect(() => {
  const d = $drawState.getState();
  if (d?.op === Op.STABLE) {
    if (d.content) {
      return d.content;
    }
    const q = $currentLevelUndoQueue.getState();
    if (q) {
      return q.current.copyRegion(d);
    }
  }
  return null;
});
export const openSelectionEdit = createEvent<string>();
export const cancelSelectionEdit = createEvent<unknown>();
export const submitSelectionEdit = createEvent<ILevelRegion>();
export const $openedSelectionEdit = createStore<string | null>(null)
  .reset(cancelSelectionEdit, $selectionSizeHash.updates)
  .on(
    sample({
      source: openSelectionEdit,
      filter: $hasSelection,
    }),
    (_, p) => p,
  );

// REFACT: flush old content (if any) to level? then put new content to level?
$drawState.on(submitSelectionEdit, (s, r) => {
  if (s?.op === Op.STABLE) {
    return {
      ...s,
      width: r.tiles.width,
      height: r.tiles.height,
      content: r,
    };
  }
});
