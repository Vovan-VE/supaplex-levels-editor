import {
  createEvent,
  createStore,
  Event,
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
import { $drvTiles, $tileIndex } from "../current";
import {
  CellEventSnapshot,
  GridEventsProps,
  PenShapeStructures,
  ToolVariantUI,
} from "./interface";

interface Variant<P> extends ToolVariantUI {
  drawProps: P;
}
interface IDrawStart<P> {
  // extends DrawEndParams<T>
  event: CellEventSnapshot;
  tile: number;
  drvStructs: PenShapeStructures | undefined;
  drawProps: P;
}
interface IDrawData<P> extends IDrawStart<P> {}

interface DrawStartState<S> {
  drawState: S;
  level: IBaseLevel;
}

interface DrawEndParams<S> {
  drawState: S;
  level: IBaseLevel;
}

interface DrawEndCommit {
  do: "commit";
  level: IBaseLevel;
}
interface DrawEndContinue<S> {
  do: "continue";
  drawState: S;
  level: IBaseLevel;
}
type DrawEndResult<S> = DrawEndCommit | DrawEndContinue<S>;

export const createDragTool = <DrawProps, DrawState>({
  VARIANTS,
  idleState,
  drawStartReducer,
  drawReducer,
  drawEndReducer,
}: {
  VARIANTS: readonly Variant<DrawProps>[];
  idleState: DrawState;
  drawStartReducer?: (
    prev: DrawStartState<DrawState>,
    draw: IDrawStart<DrawProps>,
  ) => DrawStartState<DrawState>;
  drawReducer: (prev: DrawState, draw: IDrawData<DrawProps>) => DrawState;
  drawEndReducer: (
    params: DrawEndParams<DrawState>,
  ) => DrawEndResult<DrawState>;
}) => {
  type IStart = IDrawStart<DrawProps>;
  type IContinue = IDrawData<DrawProps>;

  const free = createEvent<any>();
  const rollback = createEvent<any>();
  sample({ source: free, target: rollback });
  const doCommit = createEvent<DrawEndCommit>();
  const didCommit = createEvent<any>();
  const doContinue = createEvent<DrawEndContinue<DrawState>>();

  const setVariant = createEvent<number>();
  const $variant = createStore<number>(0).on(setVariant, (prev, n) => {
    if (n >= 0 && n < VARIANTS.length) {
      return n;
    }
    return prev;
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

  let didStart: Event<any> = doStart;
  if (drawStartReducer) {
    const temp = sample({
      clock: doStart,
      source: {
        drawState: $drawState,
        level: $currentLevelUndoQueue,
      },
      filter: ({ level }) => level !== null,
      fn: ({ drawState, level }, start) =>
        drawStartReducer({ drawState, level: level!.current }, start),
    });
    sample({
      source: temp,
      fn: ({ level }) => level,
      target: updateCurrentLevel,
    });
    sample({
      source: temp,
      fn: ({ drawState }) => drawState,
      target: $drawState,
    });
    didStart = temp;
  }

  const $isDragging = createStore(false)
    .reset(rollback, didDragEnd)
    .on(didStart, () => true);

  // -----
  // start
  // -----

  sample({
    clock: tryDrawStart,
    source: {
      isDragging: $isDragging,
      isLevelSelected: $currentLevelIsSelected,
      tile: $tileIndex,
      tiles: $drvTiles,
      variant: $variant,
    },
    filter: ({ isDragging, isLevelSelected }) => !isDragging && isLevelSelected,
    fn: ({ tile, tiles, variant }, event): IStart => ({
      event,
      tile,
      drvStructs: tiles!.find((o) => o.value === tile)?.drawStruct,
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
      isLevelSelected: $currentLevelIsSelected,
      tile: $tileIndex,
      tiles: $drvTiles,
      variant: $variant,
    },
    filter: ({ isDragging, isLevelSelected }) => isDragging && isLevelSelected,
    fn: ({ tile, tiles, variant }, event): IContinue => ({
      event,
      tile,
      drvStructs: tiles!.find((o) => o.value === tile)?.drawStruct,
      drawProps: VARIANTS[variant].drawProps,
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
  sample({ source: doCommit, target: didCommit });

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
