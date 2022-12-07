import {
  combine,
  createEffect,
  createEvent,
  createStore,
  Event,
  forward,
  sample,
  Store,
} from "effector";
import { saveAs } from "file-saver";
import { flushDelayed, withPersistent } from "@cubux/effector-persistent";
import * as RoArray from "@cubux/readonly-array";
import * as RoMap from "@cubux/readonly-map";
import { APP_TITLE } from "configs";
import {
  getDriverFormat,
  IBaseLevel,
  IBaseLevelset,
  levelSupportsDemo,
} from "drivers";
import { IBounds } from "utils/rect";
import { localStorageDriver } from "../_utils/persistent";
import {
  $currentDriverFormat,
  $currentDriverName,
  $currentKey,
  $currentLevelsetFile,
  $levelsets,
  currentKeyBeforeWillGone,
  fileDidOpen,
  setCurrentLevelset,
} from "./files";
import {
  DemoData,
  IBaseLevelsList,
  isEqualLevels,
  LevelsetFileF,
  LevelsetFileKey,
  LevelsetFlushBuffer,
  LevelsetsBuffers,
  readToBuffer,
  readToBuffers,
  updateBufferLevel,
} from "./types";

/**
 * Delay to flush changes to in-memory files after a changes was made. More
 * changes in sequence within this delay cause flush to delay more.
 */
const AUTO_FLUSH_DELAY = 300;

type _LevelRef = readonly [LevelsetFileKey, number | null];
type _LevelRefStrict = readonly [LevelsetFileKey, number];

const _willSetCurrentLevelFx = createEffect((next: number | null) => {
  const key = $currentKey.getState();
  if (key) {
    _unsetCurrentLevel();
    _setCurrentLevel([key, next]);
  }
});
const _unsetCurrentLevel = createEvent();
const _setCurrentLevel = createEvent<_LevelRef>();

/**
 * Switch level with the given index in current levelset to opened state
 */
export const openLevel = createEvent<number>();
/**
 * Switch level with the given index in current levelset to closed state
 */
export const closeCurrentLevel = createEvent<any>();
const _closeLevel = createEvent<_LevelRefStrict>();
/**
 * Set current level with the given index (open it if not yet)
 */
export const setCurrentLevel = createEvent<number>();
forward({ from: setCurrentLevel, to: [openLevel, _willSetCurrentLevelFx] });
// open first level after file created/opened
fileDidOpen.watch((key) => {
  setCurrentLevelset(key);
  setCurrentLevel(0);
});
/**
 * Insert new level in current level index in current levelset
 */
export const insertAtCurrentLevel = createEvent<any>();
/**
 * Append new level in current levelset
 */
export const appendLevel = createEvent<any>();
/**
 * Delete current level in current levelset
 */
export const deleteCurrentLevel = createEvent<any>();
const _deleteLevel = createEvent<_LevelRefStrict>();
/**
 * Update current level in current levelset
 */
export const updateCurrentLevel = createEvent<IBaseLevel>();
export const updateLevel = createEvent<{
  key: LevelsetFileKey;
  index: number;
  level: IBaseLevel;
}>();
export const internalUpdateLevelDemo = createEvent<{
  key: LevelsetFileKey;
  index: number;
  demoData: DemoData;
}>();
/**
 * Undo in current level in current levelset
 */
export const undoCurrentLevel = createEvent<any>();
/**
 * Undo in current level in current levelset
 */
export const redoCurrentLevel = createEvent<any>();
/**
 * Flush changes for the given levelset to blob
 */
export const flushBuffer = createEvent<LevelsetFileKey>();
/**
 * Flush changes for all levelset to blob
 */
export const flushBuffers = createEvent<any>();
/**
 * Download current levelset file
 */
export const downloadCurrentFile = createEvent<any>();

const _withCurrent =
  <S>(current: Store<S | null>) =>
  <T>(clock: Event<T>) =>
    sample({
      clock,
      source: current,
      filter: Boolean,
      fn: (current, value) => ({ current, value }),
    });

const _withCurrentKey = _withCurrent($currentKey);
const _withCurrentFile = _withCurrent($currentLevelsetFile);

const createLevelForFile = (file: LevelsetFileF) => {
  const f = getDriverFormat(file.driverName, file.driverFormat);
  if (!f) {
    throw new Error("Invalid driver or format name");
  }
  return f.createLevel();
};

interface _OpenedIndicesWakeUp {
  opened: ReadonlySet<number>;
  current?: number;
}
type _OpenedIndicesWakeUpMap = ReadonlyMap<
  LevelsetFileKey,
  _OpenedIndicesWakeUp
>;
// temporary storage since page load until underlying file activated
const _$wakeUpOpenedIndices = createStore<_OpenedIndicesWakeUpMap>(new Map())
  // remove unneeded reference when a file closed
  .on($levelsets, (map, existing) =>
    RoMap.filter(map, (_, key) => existing.has(key)),
  );

const _$buffersMap = createStore<LevelsetsBuffers>(new Map())
  // remove buffers when a file closed
  .on($levelsets, (map, existing) =>
    RoMap.filter(map, (_, key) => existing.has(key)),
  )
  // init on file read done
  .on(
    sample({
      clock: $currentLevelsetFile,
      source: _$wakeUpOpenedIndices,
      fn: (opened, current) => ({
        current,
        opened: current && opened.get(current.key),
      }),
    }),
    (map, { current, opened }) => {
      if (current && !map.has(current.key)) {
        return RoMap.set(map, current.key, {
          ...readToBuffers(
            current.levelset.getLevels(),
            opened?.opened || undefined,
          ),
          currentIndex: opened?.current,
        });
      }
    },
  )
  // switch per-level "is opened" state
  .on(_withCurrentKey(openLevel), (map, { current: key, value: index }) =>
    updateBufferLevel(map, key, index, (b) => ({ ...b, isOpened: true })),
  )
  // switch per-level "is opened" state
  .on(_closeLevel, (map, [key, index]) => {
    let next = updateBufferLevel(map, key, index, (b) => ({
      ...b,
      isOpened: false,
    }));
    if (index === next.get(key)?.currentIndex) {
      // when closing current level, unset current index
      next = RoMap.update(next, key, (buf) => ({
        ...buf,
        currentIndex: undefined,
      }));
    }
    return next;
  })
  // switch current level in the given levelset
  .on(_setCurrentLevel, (map, [key, index]) =>
    RoMap.update(map, key, (buf) =>
      index === null
        ? { ...buf, currentIndex: index ?? undefined }
        : index >= 0 && index < buf.levels.length
        ? { ...buf, currentIndex: index }
        : buf,
    ),
  )
  // insert new level at current level index into current levelset
  .on(_withCurrentFile(insertAtCurrentLevel), (map, { current: file }) =>
    RoMap.update(map, file.key, (buf) =>
      buf.currentIndex === undefined ||
      buf.levels.length >=
        (getDriverFormat(file.driverName, file.driverFormat)?.maxLevelsCount ??
          Infinity)
        ? buf
        : {
            ...buf,
            levels: RoArray.insert(buf.levels, buf.currentIndex, {
              ...readToBuffer(createLevelForFile(file)),
              isOpened: true,
            }),
          },
    ),
  )
  // append new level into current levelset
  .on(_withCurrentFile(appendLevel), (map, { current: file }) =>
    RoMap.update(map, file.key, (buf) =>
      buf.levels.length >=
      (getDriverFormat(file.driverName, file.driverFormat)?.maxLevelsCount ??
        Infinity)
        ? buf
        : {
            ...buf,
            levels: [
              ...buf.levels,
              { ...readToBuffer(createLevelForFile(file)), isOpened: true },
            ],
            // currentIndex: buf.levels.length,
          },
    ),
  )
  // delete the level from current levelset
  .on(_deleteLevel, (map, [key, index]) =>
    RoMap.update(map, key, (buf) => ({
      ...buf,
      levels: RoArray.remove(buf.levels, index),
    })),
  )
  // operations with current levels in current levelset
  .on(
    _withCurrentKey(updateCurrentLevel),
    (map, { current: key, value: level }) =>
      updateBufferLevel(map, key, undefined, (b) => ({
        ...b,
        undoQueue: b.undoQueue.done(level),
      })),
  )
  .on(updateLevel, (map, { key, index, level }) =>
    updateBufferLevel(map, key, index, (b) => ({
      ...b,
      undoQueue: b.undoQueue.done(level),
    })),
  )
  .on(
    internalUpdateLevelDemo,
    (map, { key, index, demoData: { data, seed_lo, seed_hi } }) =>
      updateBufferLevel(map, key, index, (b) => {
        const level = b.undoQueue.current;
        if (!levelSupportsDemo(level)) {
          return b;
        }

        return {
          ...b,
          undoQueue: b.undoQueue.done(
            level.setDemo(data).setDemoSeed({ hi: seed_hi, lo: seed_lo }),
          ),
        };
      }),
  )
  // undo in current level in current levelset
  .on(_withCurrentKey(undoCurrentLevel), (map, { current: key }) =>
    updateBufferLevel(map, key, undefined, (b) =>
      b.undoQueue.canUndo ? { ...b, undoQueue: b.undoQueue.undo() } : b,
    ),
  )
  // redo in current level in current levelset
  .on(_withCurrentKey(redoCurrentLevel), (map, { current: key }) =>
    updateBufferLevel(map, key, undefined, (b) =>
      b.undoQueue.canRedo ? { ...b, undoQueue: b.undoQueue.redo() } : b,
    ),
  );

export const currentLevelIndexWillGone = sample({
  clock: [_unsetCurrentLevel, currentKeyBeforeWillGone],
  source: {
    files: _$buffersMap,
    key: $currentKey,
  },
  filter: ({ files, key }) =>
    Boolean(
      key && files.has(key) && files.get(key)!.currentIndex !== undefined,
    ),
  fn: ({ files, key }) => files.get(key!)!.currentIndex!,
});

const _willCloseLevelFx = createEffect(async (ref: _LevelRefStrict) => {
  await _willSetCurrentLevelFx(null);
  _closeLevel(ref);
});
sample({
  clock: closeCurrentLevel,
  source: {
    files: _$buffersMap,
    key: $currentKey,
  },
  filter: ({ files, key }) =>
    Boolean(
      key && files.has(key) && files.get(key)!.currentIndex !== undefined,
    ),
  fn: ({ files, key }): _LevelRefStrict => [
    key!,
    files.get(key!)!.currentIndex!,
  ],
  target: _willCloseLevelFx,
});

sample({
  clock: insertAtCurrentLevel,
  source: {
    files: _$buffersMap,
    key: $currentKey,
  },
  filter: ({ files, key }) =>
    Boolean(
      key && files.has(key) && files.get(key)!.currentIndex !== undefined,
    ),
  fn: ({ files, key }) => files.get(key!)!.currentIndex!,
  target: _willSetCurrentLevelFx,
});
sample({
  clock: appendLevel,
  source: {
    files: _$buffersMap,
    key: $currentKey,
  },
  filter: ({ files, key }) => Boolean(key && files.has(key)),
  fn: ({ files, key }) => files.get(key!)!.levels.length,
  target: _willSetCurrentLevelFx,
});

const _willDeleteLevelFx = createEffect(async (ref: _LevelRefStrict) => {
  await _willSetCurrentLevelFx(null);
  _deleteLevel(ref);
});
sample({
  clock: deleteCurrentLevel,
  source: {
    files: _$buffersMap,
    key: $currentKey,
    _files: $levelsets,
    _drv: $currentDriverName,
    _fmt: $currentDriverFormat,
  },
  filter: ({ files, key, _files, _drv, _fmt }) =>
    Boolean(
      key &&
        _drv &&
        _fmt &&
        files.has(key) &&
        _files.has(key) &&
        files.get(key)!.currentIndex !== undefined &&
        files.get(key)!.levels.length >
          (getDriverFormat(_drv, _fmt)?.minLevelsCount ?? 1),
    ),
  fn: ({ files, key }): _LevelRefStrict => [
    key!,
    files.get(key!)!.currentIndex!,
  ],
  target: _willDeleteLevelFx,
});

// opened indices in loaded buffers
const _$openedIndices = _$buffersMap.map((map) =>
  RoMap.map(
    map,
    (buf): _OpenedIndicesWakeUp => ({
      opened: buf.levels.reduce(
        (set, b, i) => (b.isOpened ? set.add(i) : set),
        new Set<number>(),
      ),
      current: buf.currentIndex,
    }),
  ),
);

// all opened indices to keep regardless of whether loaded or not yet
const _$keepOpenedIndices = combine(
  _$openedIndices,
  _$wakeUpOpenedIndices,
  RoMap.merge,
);

// persistent store indices for opened levels
type _OpenedIndicesSerialized = readonly [
  key: LevelsetFileKey,
  opened: readonly number[],
  current?: number | null,
];
type _OpenedIndicesSerializedList = readonly _OpenedIndicesSerialized[];
withPersistent<string, _OpenedIndicesWakeUpMap, _OpenedIndicesSerializedList>(
  _$keepOpenedIndices,
  localStorageDriver,
  "openedLevels",
  {
    wakeUp: _$wakeUpOpenedIndices,
    serialize: (map: _OpenedIndicesWakeUpMap) =>
      [...map]
        .map<_OpenedIndicesSerialized>(([key, item]) => [
          key,
          [...item.opened].map((i) => i + 1),
          item.current !== undefined ? item.current + 1 : undefined,
        ])
        .filter(([, list]) => list.length),
    unserialize: (list) =>
      new Map(
        list.map(([key, list, c]) => [
          key,
          {
            opened: new Set(list.map((i) => i - 1)),
            current: typeof c === "number" ? c - 1 : undefined,
          },
        ]),
      ),
  },
);

// remove from `_$wakeUpOpenedIndices` those which are presented in `_$buffersMap`
_$wakeUpOpenedIndices.on(
  // keys in `_$buffersMap` which are present in `_$wakeUpOpenedIndices`
  sample({
    clock: _$buffersMap.map((files) => new Set([...files.keys()])),
    source: _$wakeUpOpenedIndices,
    fn: (wakeUp, loaded) =>
      new Set([...wakeUp.keys()].filter((key) => loaded.has(key))),
    target: createEvent<ReadonlySet<LevelsetFileKey>>(),
  }),
  (map, keys) => RoMap.filter(map, (_, k) => !keys.has(k)),
);

sample({
  clock: downloadCurrentFile,
  source: $currentKey,
  filter: Boolean,
  target: flushBuffer,
}).watch((key) => {
  // https://effector.dev/docs/advanced-guide/computation-priority
  // Since `watch` classified as "side effect" (and actually it is so here),
  // this `.watch()` handler will be called after all store updates with updated
  // file after flush ends.
  const file = $levelsets.getState().get(key);
  if (file) {
    saveAs(file.file, file.name);
  }
});

{
  const _writeBuffersToFile = ({
    driverName,
    driverFormat,
    levels,
  }: LevelsetFlushBuffer) => {
    const f = getDriverFormat(driverName, driverFormat);
    return (f && f.writeLevelset(f.createLevelset(levels))) || null;
  };

  // internal intermediate event to actually flush specific buffers
  const _flushBuffers =
    createEvent<ReadonlyMap<LevelsetFileKey, IBaseLevelsList>>();

  // extract only levels from only actually changed buffers
  const _$changedLevelsets = combine(
    _$buffersMap,
    $levelsets,
    (buffers, files) =>
      RoMap.filter(
        RoMap.map(buffers, ({ levels }) =>
          levels.map((b) => b.undoQueue.current),
        ),
        (levels, key) =>
          files.has(key) &&
          !isEqualLevels(levels, files.get(key)!.levelset.getLevels()),
      ),
  );
  // auto trigger flush for all after buffers changed
  flushDelayed({
    source: _$changedLevelsets,
    flushDelay: AUTO_FLUSH_DELAY,
    target: _flushBuffers,
  });
  // trigger flush for the given levelset
  sample({
    clock: flushBuffer,
    source: _$changedLevelsets,
    fn: (changed, key) => {
      const ret = new Map<LevelsetFileKey, IBaseLevelsList>();
      if (changed.has(key)) {
        ret.set(key, changed.get(key)!);
      }
      return ret;
    },
    target: _flushBuffers,
  });
  // trigger flush for all levelsets
  sample({
    clock: flushBuffers,
    source: _$changedLevelsets,
    target: _flushBuffers,
  });
  const _flushActually = sample({
    clock: _flushBuffers,
    source: $levelsets,
    fn: (files, levelsels) =>
      [...levelsels].reduce<
        {
          key: LevelsetFileKey;
          ab: ArrayBuffer;
          levelset: IBaseLevelset<IBaseLevel>;
        }[]
      >((list, [key, levels]) => {
        const file = files.get(key);
        if (file) {
          const ab = _writeBuffersToFile({
            key,
            driverName: file.driverName,
            driverFormat: file.driverFormat,
            levels,
          });
          if (ab) {
            list.push({
              key,
              ab,
              levelset: getDriverFormat(
                file.driverName,
                file.driverFormat,
              )!.createLevelset(levels),
            });
          }
        }
        return list;
      }, []),
  });
  if (process.env.NODE_ENV === "development") {
    _flushActually.watch((list) => {
      if (list.length) {
        console.info(
          "Internal flush for",
          list.length,
          "file(s)",
          new Date().toLocaleTimeString(),
        );
      }
    });
  }
  // update blob files on flush
  $levelsets.on(_flushActually, (files, result) =>
    result.reduce(
      (files, { key, ab, levelset }) =>
        RoMap.update(files, key, (f) => ({
          ...f,
          file: new Blob([ab]),
          levelset,
        })),
      files,
    ),
  );
}

/**
 * Editing buffer for current levelset
 */
export const $currentBuffer = combine(
  _$buffersMap,
  $currentKey,
  (map, key) => (key && map.get(key)) || null,
);
export const $currentBufferSelected = $currentBuffer.map(Boolean);
export const $currentBufferLevelsCount = $currentBuffer.map(
  (b) => b && b.levels.length,
);

/**
 * Editing buffer to current level in current levelset
 */
export const $currentLevel = $currentBuffer.map((b) =>
  b && b.currentIndex !== undefined
    ? {
        index: b.currentIndex,
        level: b.levels[b.currentIndex],
      }
    : null,
);
export const $currentLevelIsSelected = $currentBuffer.map(
  (b) => b !== null && b.currentIndex !== undefined,
);
export const $currentLevelIndex = $currentLevel.map((c) =>
  c ? c.index : null,
);
export const $currentLevelBuffer = $currentLevel.map(
  (c) => (c && c.level) || null,
);
export const $currentLevelUndoQueue = $currentLevelBuffer.map((level) =>
  level ? level.undoQueue : null,
);
export const $currentLevelSize = $currentLevelUndoQueue.map<IBounds | null>(
  (q) => (q ? { width: q.current.width, height: q.current.height } : null),
);

export const $playerPos = $currentLevelUndoQueue.map<
  [x: number, y: number] | null
>((q, prev = null) => {
  if (!q) {
    return null;
  }
  const next = q.current.findPlayer();
  if (next && prev && next[0] === prev[0] && next[1] === prev[1]) {
    return prev;
  }
  return next;
});
export const findPlayer = createEvent<any>();
export const scrollToPlayer = sample({
  clock: findPlayer,
  source: $playerPos,
  filter: Boolean,
});

/**
 * Shortcut for indices of opened levels in current levelset
 */
export const $currentOpenedIndices = $currentBuffer.map(
  (buf) =>
    buf &&
    buf.levels.reduce<readonly number[]>(
      (list, b, i) => (b.isOpened ? [...list, i] : list),
      [],
    ),
);

combine(
  $currentLevelsetFile.map(
    (f) => f && ([f.name, f.levelset.levelsCount] as const),
  ),
  $currentBuffer.map((b) => b && (b.currentIndex ?? null)),
  (f, index) =>
    (f
      ? `${
          index !== null
            ? `${String(index + 1).padStart(String(f[1]).length, "0")}: `
            : ""
        }${f[0]} - `
      : "") + APP_TITLE,
).watch((title) => {
  try {
    window.document.title = title;
  } catch {}
});
