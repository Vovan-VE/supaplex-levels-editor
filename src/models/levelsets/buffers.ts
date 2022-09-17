import {
  combine,
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
import { APP_NAME } from "configs";
import { getDriver, IBaseLevel } from "drivers";
import { localStorageDriver } from "../_utils/persistent";
import { $currentKey, $currentLevelsetFile, $levelsets } from "./files";
import {
  IBaseLevelsList,
  isEqualLevels,
  LevelsetFile,
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
const AUTO_FLUSH_DELAY = 3 * 1000;

/**
 * Switch level with the given index in current levelset to opened state
 */
export const openLevel = createEvent<number>();
/**
 * Switch level with the given index in current levelset to closed state
 */
export const closeLevel = createEvent<number | undefined>();
/**
 * Set current level with the given index (open it if not yet)
 */
export const setCurrentLevel = createEvent<number>();
forward({ from: setCurrentLevel, to: openLevel });
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
/**
 * Update current level in current levelset
 */
export const updateCurrentLevel = createEvent<IBaseLevel>();
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

const createLevelForFile = (file: LevelsetFile) => {
  const d = getDriver(file.driverName);
  if (!d) {
    throw new Error("Invalid driver name");
  }
  return d.createLevel();
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
const _$wakeUpOpenedIndices = createStore<_OpenedIndicesWakeUpMap>(new Map());

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
  .on(_withCurrentKey(closeLevel), (map, { current: key, value: index }) => {
    const next = updateBufferLevel(map, key, index, (b) => ({
      ...b,
      isOpened: false,
    }));
    if (index === undefined || index === map.get(key)?.currentIndex) {
      // when closing current level, unset current index
      return RoMap.update(next, key, (buf) => ({
        ...buf,
        currentIndex: undefined,
      }));
    }
    return next;
  })
  // switch current level in the given levelset
  .on(_withCurrentKey(setCurrentLevel), (map, { current: key, value: index }) =>
    RoMap.update(map, key, (buf) =>
      index >= 0 && index < buf.levels.length
        ? { ...buf, currentIndex: index }
        : buf,
    ),
  )
  // insert new level at current level index into current levelset
  .on(_withCurrentFile(insertAtCurrentLevel), (map, { current: file }) =>
    RoMap.update(map, file.key, (buf) =>
      buf.currentIndex === undefined ||
      buf.levels.length >= (file.levelset.maxLevelsCount ?? Infinity)
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
      buf.levels.length >= (file.levelset.maxLevelsCount ?? Infinity)
        ? buf
        : {
            ...buf,
            levels: [
              ...buf.levels,
              { ...readToBuffer(createLevelForFile(file)), isOpened: true },
            ],
            currentIndex: buf.levels.length,
          },
    ),
  )
  // delete the level from current levelset
  .on(_withCurrentFile(deleteCurrentLevel), (map, { current: file }) =>
    RoMap.update(map, file.key, (buf) =>
      buf.currentIndex === undefined ||
      buf.levels.length <= file.levelset.minLevelsCount
        ? buf
        : {
            ...buf,
            levels: RoArray.remove(buf.levels, buf.currentIndex),
            currentIndex: undefined,
          },
    ),
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

// persistent store indices for opened levels
type _OpenedIndicesSerialized = readonly [
  key: LevelsetFileKey,
  opened: readonly number[],
  current?: number | null,
];
type _OpenedIndicesSerializedList = readonly _OpenedIndicesSerialized[];
withPersistent<string, _OpenedIndicesWakeUpMap, _OpenedIndicesSerializedList>(
  _$openedIndices,
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
  const _writeBuffersToFile = ({ driverName, levels }: LevelsetFlushBuffer) => {
    const d = getDriver(driverName);
    return (d && d.writer?.writeLevelset(d.createLevelset(levels))) || null;
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
  // update blob files on flush
  $levelsets.on(
    sample({
      clock: _flushBuffers,
      source: $levelsets,
      fn: (files, levelsels) =>
        [...levelsels].reduce<
          { key: LevelsetFileKey; ab: ArrayBuffer; levels: IBaseLevelsList }[]
        >((list, [key, levels]) => {
          const file = files.get(key);
          if (file) {
            const ab = _writeBuffersToFile({
              key,
              driverName: file.driverName,
              levels,
            });
            if (ab) {
              list.push({ key, ab, levels });
            }
          }
          return list;
        }, []),
    }),
    (files, result) =>
      result.reduce(
        (files, { key, ab, levels }) =>
          RoMap.update(files, key, (f) => ({
            ...f,
            file: new Blob([ab]),
            levels,
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

export const $currentLevelIndex = $currentLevel.map((c) =>
  c ? c.index : null,
);
export const $currentLevelBuffer = $currentLevel.map(
  (c) => (c && c.level) || null,
);
export const $currentLevelUndoQueue = $currentLevelBuffer.map((level) =>
  level ? level.undoQueue : null,
);

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
      : "") + APP_NAME,
).watch((title) => {
  try {
    window.document.title = title;
  } catch {}
});
