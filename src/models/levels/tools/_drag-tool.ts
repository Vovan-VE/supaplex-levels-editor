import { createEvent, createStore, forward, sample } from "effector";
import { $currentLevel, $currentLevelIsSelected } from "../../levelsets";
import { $tileIndex } from "../current";
import { CellEventSnapshot, GridEventsProps, ToolVariantUI } from "./interface";

interface Variant<T> extends ToolVariantUI {
  drawProps: T;
}
interface IStart_<T> {
  event: CellEventSnapshot;
  tile: number;
  drawProps: T;
}

export const createDragTool = <DrawProps, DrawState>({
  VARIANTS,
  idleState,
  drawReducer,
}: {
  VARIANTS: readonly Variant<DrawProps>[];
  idleState: DrawState;
  drawReducer: (prev: DrawState, draw: IStart_<DrawProps>) => DrawState;
}) => {
  type IStart = IStart_<DrawProps>;

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

  const doStart = createEvent<IStart>();
  const doDraw = createEvent<IStart>();

  const $isDrawing = createStore(false)
    .reset(rollback, didCommit)
    .on(doStart, () => true);
  const $drawState = createStore(idleState)
    .reset(rollback, didCommit)
    .on(doDraw, drawReducer);

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
      drawProps: VARIANTS[variant].drawProps,
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
      drawProps: VARIANTS[variant].drawProps,
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
      drawState: $drawState,
    },
    filter: ({ inWork, level }) => inWork && level !== null,
    fn: ({ level, drawState }) => ({
      drawState,
      level: level!.level.undoQueue.current,
    }),
  });
  forward({ from: doCommit, to: didCommit });

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
  };

  return {
    free,
    variants: VARIANTS,
    setVariant,
    $variant,

    $isDrawing,
    $drawState,
    rollback,
    commit,
    doCommit,
    eventsIdle,
    eventsWork,
  };
};
