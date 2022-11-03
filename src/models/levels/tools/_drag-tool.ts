import {
  createEvent,
  createStore,
  Event,
  forward,
  merge,
  sample,
  split,
} from "effector";
import { IBaseLevel } from "drivers";
import {
  $currentLevelIsSelected,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "../../levelsets";
import { $tileIndex } from "../current";
import { CellEventSnapshot, GridEventsProps, ToolVariantUI } from "./interface";

interface Variant<T> extends ToolVariantUI {
  drawProps: T;
}
interface IDrawStart<T> {
  // extends DrawEndParams<T>
  event: CellEventSnapshot;
  tile: number;
  drawProps: T;
}
interface IDrawData<T> extends IDrawStart<T> {
  didDrag: boolean;
}

interface DrawEndParams<T> {
  drawState: T;
  level: IBaseLevel;
}

interface DrawEndCommit {
  do: "commit";
  level: IBaseLevel;
}
interface DrawEndContinue<T> {
  do: "continue";
  drawState: T;
  level: IBaseLevel;
}
type DrawEndResult<T> = DrawEndCommit | DrawEndContinue<T>;

export const createDragTool = <DrawProps, DrawState>({
  VARIANTS,
  idleState,
  drawReducer,
  drawEndReducer,
}: {
  VARIANTS: readonly Variant<DrawProps>[];
  idleState: DrawState;
  drawReducer: (prev: DrawState, draw: IDrawData<DrawProps>) => DrawState;
  drawEndReducer: (
    params: DrawEndParams<DrawState>,
  ) => DrawEndResult<DrawState>;
}) => {
  type IStart = IDrawStart<DrawProps>;
  type IContinue = IDrawData<DrawProps>;

  const free = createEvent<any>();
  const rollback = createEvent<any>();
  forward({ from: free, to: rollback });
  const doCommit = createEvent<DrawEndCommit>();
  const didCommit = createEvent<any>();
  const doContinue = createEvent<DrawEndContinue<DrawState>>();

  const setVariant = createEvent<number>();
  const $variant = createStore<number>(0).on(setVariant, (_, n) => {
    if (n >= 0 && n < VARIANTS.length) {
      return n;
    }
  });

  const doStart = createEvent<IStart>();
  const doDraw = createEvent<IContinue>();

  const tryDrawStart = createEvent<CellEventSnapshot>();
  const tryDrawMove = createEvent<CellEventSnapshot>();
  const tryDrawEnd = createEvent<CellEventSnapshot>();
  const didDragEnd: Event<DrawEndResult<DrawState>> = merge([
    doCommit,
    doContinue,
  ]);

  const $drawState = createStore(idleState)
    .reset(rollback, didCommit)
    .on(doDraw, drawReducer)
    .on(doContinue, (_, { drawState }) => drawState);
  const $isDragging = createStore(false)
    .reset(rollback, didDragEnd)
    .on(doStart, () => true);
  const $didDrag = createStore(false)
    .reset($isDragging.updates.filter({ fn: (b) => !b }))
    .on(doDraw, () => true);

  // -----
  // start
  // -----

  sample({
    clock: tryDrawStart,
    source: {
      isDragging: $isDragging,
      isLevelSelected: $currentLevelIsSelected,
      tile: $tileIndex,
      variant: $variant,
    },
    filter: ({ isDragging, isLevelSelected }) => !isDragging && isLevelSelected,
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
      isDragging: $isDragging,
      didDrag: $didDrag,
      isLevelSelected: $currentLevelIsSelected,
      tile: $tileIndex,
      variant: $variant,
    },
    filter: ({ isDragging, isLevelSelected }) => isDragging && isLevelSelected,
    fn: ({ didDrag, tile, variant }, event): IContinue => ({
      event,
      tile,
      drawProps: VARIANTS[variant].drawProps,
      didDrag,
    }),
    target: doDraw,
  });

  // ---------------------
  // end, commit, continue
  // ---------------------

  split({
    source: sample({
      clock: tryDrawEnd,
      source: {
        isDragging: $isDragging,
        level: $currentLevelUndoQueue,
        drawState: $drawState,
      },
      filter: ({ isDragging, level }) => isDragging && level !== null,
      fn: ({ drawState, level }) =>
        drawEndReducer({
          drawState,
          level: level!.current,
        }),
    }),
    match: {
      commit: (r) => r.do === "commit",
      continue: (r) => r.do === "continue",
    },
    cases: {
      commit: doCommit,
      continue: doContinue,
    },
  });

  sample({
    source: didDragEnd,
    fn: (r) => r.level,
    target: updateCurrentLevel,
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

  const eventsDragging: GridEventsProps = {
    onPointerMove: (e, cell) => {
      if (e.buttons === 1) {
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

    $isDragging,
    $drawState,
    rollback,
    eventsIdle,
    eventsDragging,
  };
};
