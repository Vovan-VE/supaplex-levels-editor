import { combine, createEvent, createStore, forward, sample } from "effector";
import * as RoMap from "@cubux/readonly-map";
import { svgs } from "ui/icon";
import {
  $currentLevel,
  $currentLevelIsSelected,
  $currentLevelSize,
  IBounds,
  updateCurrentLevel,
} from "../../levelsets";
import { $tileIndex } from "../current";
import {
  CellEventSnapshot,
  cellKey,
  DrawLayerType,
  GridContextEventHandler,
  GridEventsProps,
  TilesPath,
  Tool,
  ToolUI,
  ToolVariantUI,
} from "./interface";

const enum PenShape {
  DOT,
  _3x3,
}
interface Variant extends ToolVariantUI {
  shape: PenShape;
}
const VARIANTS: readonly Variant[] = [
  { shape: PenShape.DOT, title: "Pencil", Icon: svgs.Pencil },
  { shape: PenShape._3x3, title: "Pencil 3x3", Icon: svgs.Grid3x3 },
];
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

const init = createEvent<any>();
const free = createEvent<any>();
const rollback = createEvent<any>();
forward({ from: free, to: rollback });
const commit = createEvent<any>();
const didCommit = createEvent<any>();

const setVariant = createEvent<number>();
const $variant = createStore<number>(0).on(setVariant, (_, n) => {
  if (n >= 0 && n < VARIANTS.length) {
    return n;
  }
});

interface IStart {
  event: CellEventSnapshot;
  tile: number;
  shape: PenShape;
}
interface IDrawInBounds extends IStart {
  bounds: IBounds;
}
const doStart = createEvent<IStart>();
const doDraw = createEvent<IStart>();
const doDrawInBounds = sample({
  clock: doDraw,
  source: $currentLevelSize,
  filter: Boolean,
  fn: (bounds, draw): IDrawInBounds => ({ ...draw, bounds }),
});

const $isDrawing = createStore(false)
  .reset(rollback, didCommit)
  .on(doStart, () => true);
const $path = createStore<TilesPath>(new Map())
  .reset(rollback, didCommit)
  .on(
    doDrawInBounds,
    (path, { event, tile, shape, bounds: { width, height } }) =>
      SHAPES[shape].reduce((path, [dx, dy]) => {
        const x = event.x + dx;
        const y = event.y + dy;
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const key = cellKey({ x, y });
          if (path.get(key)?.tile !== tile) {
            return RoMap.set(path, key, { x, y, tile });
          }
        }
        return path;
      }, path),
  );

const tryDrawStart = createEvent<CellEventSnapshot>();
const tryDrawMove = createEvent<CellEventSnapshot>();
const tryDrawEnd = createEvent<CellEventSnapshot>();

// -----
// start
// -----

sample({
  clock: tryDrawStart,
  source: {
    inWork: $isDrawing,
    isLevelSelected: $currentLevelIsSelected,
    tile: $tileIndex,
    variant: $variant,
  },
  filter: ({ inWork, isLevelSelected }) => !inWork && isLevelSelected,
  fn: ({ tile, variant }, event): IStart => ({
    event,
    tile,
    shape: VARIANTS[variant].shape,
  }),
  target: doStart,
});

// ---------
// draw move
// ---------

sample({
  clock: tryDrawMove,
  source: {
    inWork: $isDrawing,
    isLevelSelected: $currentLevelIsSelected,
    tile: $tileIndex,
    variant: $variant,
  },
  filter: ({ inWork, isLevelSelected }) => inWork && isLevelSelected,
  fn: ({ tile, variant }, event): IStart => ({
    event,
    tile,
    shape: VARIANTS[variant].shape,
  }),
  target: doDraw,
});

// -----------
// end, commit
// -----------

forward({ from: tryDrawEnd, to: commit });
const doCommit = sample({
  clock: commit,
  source: {
    inWork: $isDrawing,
    level: $currentLevel,
    path: $path,
  },
  filter: ({ inWork, level }) => inWork && level !== null,
  fn: ({ level, path }) => ({ path, level: level!.level.undoQueue.current }),
});
forward({ from: doCommit, to: didCommit });
sample({
  source: doCommit,
  fn: ({ level, path }) =>
    RoMap.reduce(
      path,
      (level, { x, y, tile }) => level.setTile(x, y, tile),
      level,
    ),
  target: updateCurrentLevel,
});

const onContextMenu: GridContextEventHandler = () => {
  // TODO: driver context actions
};
const eventsIdle: GridEventsProps = {
  onPointerDown: (e, cell) => {
    if (e.button === 0 && e.buttons === 1 && cell.inBounds) {
      tryDrawStart(cell);
      // not sure if it can be covered in `CoverGrid` touch hacks
      if (e.pointerType === "mouse") {
        tryDrawMove(cell);
      }
    }
  },
  onContextMenu: onContextMenu,
};

const eventsWork: GridEventsProps = {
  onPointerMove: (e, cell) => {
    if (e.buttons === 1 && cell.inBounds) {
      tryDrawMove(cell);
    }
  },
  onPointerDown: (e, cell) => {
    tryDrawEnd(cell);
  },
  onPointerUp: (e, cell) => {
    tryDrawMove(cell);
    tryDrawEnd(cell);
  },
  onPointerCancel: rollback,
  onContextMenu: onContextMenu,
};

export const PEN: Tool = {
  init,
  free,
  variants: VARIANTS,
  setVariant,
  $variant,
  $ui: combine(
    $isDrawing,
    $path,
    (inWork, tiles): ToolUI => ({
      rollback,
      commit,
      inWork,
      drawLayers: [{ x: 0, y: 0, type: DrawLayerType.TILES, tiles }],
      events: inWork ? eventsWork : eventsIdle,
    }),
  ),
};
