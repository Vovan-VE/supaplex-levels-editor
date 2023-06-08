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
import JSZip from "jszip";
import { flushDelayed, withPersistent } from "@cubux/effector-persistent";
import * as RoArray from "@cubux/readonly-array";
import * as RoMap from "@cubux/readonly-map";
import {
  $displayReadOnly,
  $instanceIsReadOnly,
  allowManualSave,
  configStorage,
  onDeactivate,
  saveFileAs,
  setTitle,
} from "backend";
import { APP_TITLE } from "configs";
import {
  detectDriverFormat,
  getDriver,
  getDriverFormat,
  IBaseLevel,
  IBaseLevelset,
  levelSupportsDemo,
  summarySupportReport,
  SupportReportType,
} from "drivers";
import { SupportReport } from "components/files/FileToolbar/SupportReport";
import { fmtLevelNumber } from "components/levelset/fmt";
import { msgBox } from "ui/feedback";
import { ColorType } from "ui/types";
import { isNotNull } from "utils/fn";
import { IBounds } from "utils/rect";
import { $autoSave, $autoSaveDelay } from "../settings";
import {
  $currentDriverFormat,
  $currentDriverName,
  $currentFileName,
  $currentKey,
  $currentLevelsetFile,
  $levelsets,
  currentKeyBeforeWillGone,
  fileDidOpen,
  removeCurrentLevelsetFile,
  removeOthersLevelsetFile,
  setCurrentLevelset,
} from "./files";
import {
  DemoData,
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
 * Switch all other levels but the given index in current levelset to closed state
 */
export const closeOtherLevels = createEvent<any>();
const _closeOtherLevels = createEvent<_LevelRefStrict>();
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
export const exportCurrentLevel = createEvent<any>();
export const importCurrentLevel = createEvent<File>();
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
 * Delete all the rest levels after the current
 */
export const deleteRestLevels = createEvent<any>();
const _deleteRestLevels = createEvent<_LevelRefStrict>();
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
const flushBuffer = createEvent<LevelsetFileKey>();
/**
 * Flush changes for all levelset to blob
 */
const flushBuffers = createEvent<any>();
if (onDeactivate) {
  sample({
    source: onDeactivate,
    filter: $autoSave,
    target: flushBuffers,
  });
}
export const saveAllFx = allowManualSave
  ? createEffect(async () => {
      flushBuffers();
    })
  : async () => {};

export interface SaveAsOptions {
  withLocalOptions?: boolean;
}
/**
 * Download current levelset file
 */
export const saveAsCurrentFile = createEvent<SaveAsOptions | undefined>();

const _withCurrent =
  <S,>(current: Store<S | null>) =>
  <T,>(clock: Event<T>) =>
    sample({
      clock,
      source: current,
      filter: Boolean,
      fn: (current, value) => ({ current, value }),
    });

const _withCurrentKey = _withCurrent($currentKey);
const _withCurrentFile = _withCurrent($currentLevelsetFile);

const createLevelForFile = (file: LevelsetFile) => {
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
  // switch other but current to "is closed" state
  .on(_closeOtherLevels, (map, [key, index]) =>
    RoMap.update(map, key, (buf) => ({
      ...buf,
      levels: buf.levels.map((b, i) =>
        i !== index && b.isOpened ? { ...b, isOpened: false } : b,
      ),
    })),
  )
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
  // delete all the rest levels after the current
  .on(_deleteRestLevels, (map, [key, curIndex]) =>
    RoMap.update(map, key, (buf) =>
      curIndex + 1 < buf.levels.length
        ? {
            ...buf,
            levels: buf.levels.slice(0, curIndex + 1),
          }
        : buf,
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
  clock: closeOtherLevels,
  source: {
    files: _$buffersMap,
    key: $currentKey,
  },
  filter: ({ files, key }) => {
    if (key) {
      const buf = files.get(key);
      if (buf?.currentIndex !== undefined) {
        return (
          buf.levels.length > 1 &&
          buf.levels.some((l, i) => l.isOpened && i !== buf.currentIndex)
        );
      }
    }
    return false;
  },
  fn: ({ files, key }): _LevelRefStrict => [
    key!,
    files.get(key!)!.currentIndex!,
  ],
  target: _closeOtherLevels,
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
  fn: ({ files, key }) =>
    // at this moment it already has new level in the end
    files.get(key!)!.levels.length - 1,
  target: _willSetCurrentLevelFx,
});

const _$currentDriverMinLevelsCount = combine(
  $currentDriverName,
  $currentDriverFormat,
  (drv, fmt) => (drv && fmt && getDriverFormat(drv, fmt)?.minLevelsCount) || 1,
);

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
    _minCount: _$currentDriverMinLevelsCount,
  },
  filter: ({ files, key, _files, _minCount }) => {
    if (key && _files.has(key)) {
      const f = files.get(key);
      return Boolean(
        f && f.currentIndex !== undefined && f.levels.length > _minCount,
      );
    }
    return false;
  },
  fn: ({ files, key }): _LevelRefStrict => [
    key!,
    files.get(key!)!.currentIndex!,
  ],
  target: _willDeleteLevelFx,
});

sample({
  clock: deleteRestLevels,
  source: {
    files: _$buffersMap,
    key: $currentKey,
    _files: $levelsets,
    _drv: $currentDriverName,
    _fmt: $currentDriverFormat,
    _minCount: _$currentDriverMinLevelsCount,
  },
  filter: ({ files, key, _files, _minCount }) => {
    if (key && _files.has(key)) {
      const f = files.get(key);
      return Boolean(
        f &&
          f.currentIndex !== undefined &&
          f.currentIndex + 1 < f.levels.length &&
          f.levels.length > _minCount,
      );
    }
    return false;
  },
  fn: ({ files, key }): _LevelRefStrict => [
    key!,
    files.get(key!)!.currentIndex!,
  ],
  target: _deleteRestLevels,
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
  configStorage,
  "openedLevels",
  {
    wakeUp: _$wakeUpOpenedIndices,
    ...($instanceIsReadOnly ? { readOnly: $instanceIsReadOnly } : null),
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

export const flushCurrentFile = createEvent<any>();
export const saveAndClose = createEvent<any>();
export const saveOthersAndClose = createEvent<any>();
if (allowManualSave) {
  sample({
    clock: flushCurrentFile,
    source: $currentKey,
    filter: Boolean,
    target: flushBuffer,
  });

  sample({
    source: saveAndClose,
    // since `sample()` returns `target`, we create new target event,
    // so further `watch` is attached to that event, not to `flushCurrentFile`
    target: flushCurrentFile.prepend(() => {}),
  }).watch(removeCurrentLevelsetFile);
}

type _SaveAsInnerParams = { key: LevelsetFileKey; options?: SaveAsOptions };
sample({
  clock: saveAsCurrentFile,
  source: $currentKey,
  filter: Boolean,
  fn: (key, options) => ({ key, options }),
  target: flushBuffer.prepend<_SaveAsInnerParams>(({ key }) => key),
}).watch(async ({ key, options: { withLocalOptions = false } = {} }) => {
  // https://effector.dev/docs/advanced-guide/computation-priority
  // Since `watch` classified as "side effect" (and actually it is so here),
  // this `.watch()` handler will be called after all store updates with updated
  // file after flush ends.
  const file = $levelsets.getState().get(key);
  if (file) {
    const localOptions = file.levelset.localOptions;
    if (withLocalOptions && localOptions) {
      const zip = new JSZip();
      zip.file(file.name, file.file.arrayBuffer());
      zip.file(
        `${file.name}.options.json`,
        JSON.stringify(
          Object.fromEntries(
            localOptions
              .map((o, i) => (o ? ([i + 1, o] as const) : undefined))
              .filter(isNotNull),
          ),
          null,
          2,
        ) + "\n",
      );
      saveFileAs(await zip.generateAsync({ type: "blob" }), `${file.name}.zip`);
    } else {
      saveFileAs(file.file, file.name);
    }
  }
});

let _$dirtyKeys: Store<ReadonlySet<LevelsetFileKey>>;
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
  type _MapToFlush = ReadonlyMap<LevelsetFileKey, IBaseLevelsList>;
  const _flushBuffers = createEvent<_MapToFlush>();

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
  _$dirtyKeys = _$changedLevelsets.map<ReadonlySet<LevelsetFileKey>>(
    (map, prev) => {
      const next = new Set(map.keys());
      // REFACT: RoSet.syncFrom()
      if (
        prev &&
        prev !== next &&
        prev.size === next.size &&
        Array.from(prev).every((v) => next.has(v))
      ) {
        return prev;
      }
      return next;
    },
  );

  // auto trigger flush for all after buffers changed
  flushDelayed({
    source: _$changedLevelsets,
    target: _flushBuffers,
    flushDelay: $autoSaveDelay,
    filter: $autoSave,
  });
  // delayed "flush all" when $autoSave becomes true
  flushDelayed({
    source: sample({
      source: $autoSave.updates,
      filter: Boolean,
    }),
    target: flushBuffers,
    flushDelay: $autoSaveDelay,
    filter: $autoSave,
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
  if (allowManualSave) {
    sample({
      clock: saveOthersAndClose,
      source: {
        changed: _$changedLevelsets,
        current: $currentKey,
      },
      filter: ({ current }) => Boolean(current),
      fn: ({ changed, current }) => RoMap.remove(changed, current!),
      target: _flushBuffers.prepend<_MapToFlush>((p) => p),
    }).watch(removeOthersLevelsetFile);
  }
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
export const $dirtyKeys = _$dirtyKeys;
export const $isAnyDirty = $dirtyKeys.map((s) => s.size > 0);
export const $currentFileIsDirty = combine(_$dirtyKeys, $currentKey, (set, k) =>
  Boolean(k && set.has(k)),
);
export const $otherIsDirty = combine(
  _$dirtyKeys,
  $currentKey,
  (set, k) => set.size > (k && set.has(k) ? 1 : 0),
);

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
export const $currentBufferHasOtherOpened = $currentBuffer.map((b) =>
  Boolean(
    b &&
      b.currentIndex !== undefined &&
      b.levels.some((l, i) => l.isOpened && i !== b.currentIndex),
  ),
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

{
  const $titleFile = combine(
    $currentLevelsetFile.map(
      (f) => f && ([f.name, f.levelset.levelsCount] as const),
    ),
    $currentBuffer.map((b) => b && (b.currentIndex ?? null)),
    (file, index) =>
      file
        ? `${
            index !== null
              ? `${fmtLevelNumber(index, String(file[1]).length)}: `
              : ""
          }${file[0]} - `
        : "",
  );
  const $titleWithDirty = allowManualSave
    ? combine($titleFile, $currentFileIsDirty, (s, d) => (d ? `*${s}` : s))
    : $titleFile;
  const $titlePrefix = $displayReadOnly
    ? combine($displayReadOnly, $titleWithDirty, (r, s) =>
        r ? `[RO!] ${s}` : s,
      )
    : $titleWithDirty;
  $titlePrefix.watch((title) => setTitle(title + APP_TITLE));
}

sample({
  clock: exportCurrentLevel,
  source: {
    file: $currentFileName,
    driverName: $currentDriverName,
    level: $currentLevel,
  },
}).watch(({ file, driverName, level }) => {
  if (file && driverName && level) {
    const {
      index,
      level: {
        undoQueue: { current: lvl },
      },
    } = level;
    const { formats, detectExportFormat } = getDriver(driverName)!;
    const format = formats[detectExportFormat(lvl)];
    if (format) {
      const { createLevelset, fileExtensionDefault, writeLevelset } = format;
      const dotExt = `.${fileExtensionDefault}`;
      saveFileAs(
        new Blob([writeLevelset(createLevelset([lvl]))]),
        `${
          file.toUpperCase().endsWith(dotExt.toUpperCase())
            ? file.substring(0, file.length - dotExt.length)
            : file
        }.${index + 1}${dotExt}`,
      );
    }
  }
});

{
  interface DriverOpt {
    driverName: string;
    driverFormat: string;
  }

  const importCurrentLevelFx = createEffect(
    async ({ file, driverName, driverFormat }: { file: File } & DriverOpt) => {
      const { formats } = getDriver(driverName)!;
      const { createLevelset, readLevelset, supportReport, writeLevelset } =
        formats[driverFormat];

      const detected = detectDriverFormat(await file.arrayBuffer(), file.name);
      if (!detected) {
        throw new Error(`"${file.name}": Unsupported file format.`);
      }
      const [fromDriver, fromFormat] = detected;
      if (fromDriver !== driverName) {
        throw new Error(`"${file.name}": Different levelsets driver.`);
      }
      const from = formats[fromFormat];

      let levelset = from.readLevelset(await file.arrayBuffer());
      const report = summarySupportReport(supportReport(levelset));
      if (report?.type === SupportReportType.ERR) {
        return { report };
      }
      // apply the things warned by warnings
      levelset = readLevelset(
        writeLevelset(createLevelset([levelset.getLevel(0)])),
      );
      return { level: levelset.getLevel(0), report };
    },
  );
  sample({
    clock: importCurrentLevel,
    source: {
      driverName: $currentDriverName,
      driverFormat: $currentDriverFormat,
    },
    filter: (o): o is DriverOpt => Boolean(o.driverName && o.driverFormat),
    fn: (s: DriverOpt, file: File) => ({ ...s, file }),
    target: importCurrentLevelFx,
  });

  sample({
    source: importCurrentLevelFx.doneData.map(({ level }) => level),
    filter: Boolean,
    target: updateCurrentLevel,
  });
  sample({
    source: importCurrentLevelFx.doneData.map(({ report }) => report),
    filter: Boolean,
  }).watch((report) =>
    msgBox(
      <>
        <p>
          {report.type === SupportReportType.ERR
            ? "Cannot import level due to the following compatibility errors:"
            : "Level was imported applying the following compatibility changes:"}
        </p>
        <SupportReport report={report} />
      </>,
      {
        button: { uiColor: ColorType.MUTE, text: "Close" },
      },
    ),
  );
  importCurrentLevelFx.failData.watch((e) =>
    msgBox(<>Cannot import level file file: {e.message}</>, {
      button: { uiColor: ColorType.MUTE, text: "Close" },
    }),
  );
}
