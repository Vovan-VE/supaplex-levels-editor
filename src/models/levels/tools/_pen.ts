import { combine, createEvent, createStore, forward, sample } from "effector";
import * as RoMap from "@cubux/readonly-map";
import { $currentLevel, updateCurrentLevel } from "../../levelsets";
import { $tileIndex } from "../current";
import {
  CellEventSnapshot,
  cellKey,
  GridEventsProps,
  GridPointerEventHandler,
  TilesPath,
  Tool,
  ToolUI,
} from "./interface";

const init = createEvent<any>();
const free = createEvent<any>();
const rollback = createEvent<any>();
forward({ from: free, to: rollback });
const commit = createEvent<any>();
const didCommit = createEvent<any>();

interface IStart {
  event: CellEventSnapshot;
  tile: number;
}
const doStart = createEvent<IStart>();
const doDraw = createEvent<IStart>();
// forward({ from: doStart, to: doDraw });

const $isDrawing = createStore(false)
  .reset(rollback, didCommit)
  .on(doStart, () => true);
const $path = createStore<TilesPath>(new Map())
  .reset(rollback, didCommit)
  .on(doDraw, (path, { event, tile }) =>
    RoMap.set(path, cellKey(event), { x: event.x, y: event.y, tile }),
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
    level: $currentLevel,
    tile: $tileIndex,
  },
  filter: ({ inWork, level }) => !inWork && level !== null,
  fn: ({ tile }, event) => ({ event, tile }),
  target: doStart,
});

// ---------
// draw move
// ---------

sample({
  clock: tryDrawMove,
  source: {
    inWork: $isDrawing,
    level: $currentLevel,
    tile: $tileIndex,
  },
  filter: ({ inWork, level }) => inWork && level !== null,
  fn: ({ tile }, event) => ({ event, tile }),
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
};

const onPointerEnd: GridPointerEventHandler = (e, cell) => {
  tryDrawEnd(cell);
};
const eventsWork: GridEventsProps = {
  onPointerMove: (e, cell) => {
    if (e.buttons === 1 && cell.inBounds) {
      tryDrawMove(cell);
    }
  },
  onPointerDown: onPointerEnd,
  onPointerUp: (e, cell) => {
    tryDrawMove(cell);
    tryDrawEnd(cell);
  },
  onPointerCancel: onPointerEnd,
};

export const PEN: Tool = {
  init,
  free,
  $ui: combine(
    $isDrawing,
    $path,
    (inWork, tiles): ToolUI => ({
      rollback,
      commit,
      inWork,
      drawLayers: [{ x: 0, y: 0, type: "tiles" as const, tiles }],
      events: inWork ? eventsWork : eventsIdle,
    }),
  ),
};
