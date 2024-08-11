import {
  combine,
  createEffect,
  createEvent,
  createStore,
  Event,
  restore,
  sample,
  Store,
} from "effector";
import JSZip from "jszip";
import { flushDelayed, withPersistent } from "@cubux/effector-persistent";
import * as RoArray from "@cubux/readonly-array";
import * as RoMap from "@cubux/readonly-map";
import * as RoSet from "@cubux/readonly-set";
import {
  $displayReadOnly,
  $instanceIsReadOnly,
  allowManualSave,
  configStorage,
  FilesStorageKey,
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
  LocalOptions,
  serializeLocalOptionsList,
  summarySupportReport,
  SupportReportType,
} from "drivers";
import { SupportReport } from "components/files/FileToolbar/SupportReport";
import {
  fmtLevelForFilename,
  fmtLevelNumber,
  fmtLevelShort,
} from "components/levelset/fmt";
import { Trans } from "i18n/Trans";
import { TranslationGetter } from "i18n/types";
import { msgBox } from "ui/feedback";
import { ColorType } from "ui/types";
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
  levelsetsDidWakeUp,
  removeCurrentLevelsetFile,
  removeOthersLevelsetFile,
  setCurrentLevelset,
} from "./files";
import {
  DemoData,
  IBaseLevelsList,
  isEqualLevels,
  LevelBuffer,
  LevelsetFile,
  LevelsetFlushBuffer,
  LevelsetsBuffers,
  readToBuffer,
  readToBuffers,
  updateBufferLevel,
} from "./types";

// REFACT: split too long file

type _LevelRef = readonly [FilesStorageKey, number | null];
type _LevelRefStrict = readonly [FilesStorageKey, number];

const _willSetCurrentLevelFx = createEffect((r: _LevelRef) => {
  const [key] = r;
  _unsetCurrentLevel(key);
  _setCurrentLevel(r);
});
const _unsetCurrentLevel = createEvent<FilesStorageKey>();
const _setCurrentLevel = createEvent<_LevelRef>();
// _unsetCurrentLevel.watch((p) => console.log(">> _unsetCurrentLevel", p));
// _setCurrentLevel.watch((p) => console.log(">> _setCurrentLevel", p));

const openLevel = createEvent<_LevelRefStrict>();
/**
 * Switch level with the given index in current levelset to closed state
 */
export const closeCurrentLevel = createEvent<unknown>();
const _closeLevel = createEvent<_LevelRefStrict>();
/**
 * Switch all other levels but the given index in current levelset to closed state
 */
export const closeOtherLevels = createEvent<unknown>();
const _closeOtherLevels = createEvent<_LevelRefStrict>();
/**
 * Set current level with the given index (open it if not yet)
 */
export const setCurrentLevel = createEvent<number>();
const setCurrentLevelRef = createEvent<_LevelRefStrict>();
sample({
  clock: setCurrentLevel,
  source: $currentKey,
  filter: Boolean,
  fn: (key, i): _LevelRefStrict => [key, i],
  target: setCurrentLevelRef,
});
sample({
  clock: setCurrentLevelRef,
  target: [openLevel, _willSetCurrentLevelFx],
});
// open first level after file created/opened
fileDidOpen.watch((key) => {
  // console.log(">> fileDidOpen", key);
  setCurrentLevelset(key);
  setCurrentLevelRef([key, 0]);
  // console.log(">> fileDidOpen end.", key);
});
// setCurrentLevelRef.watch((p) => console.log(">> setCurrentLevelRef", p));
// openLevel.watch((p) => console.log(">> openLevel", p));
// _willSetCurrentLevelFx.watch((p) =>
//   console.log(">> _willSetCurrentLevelFx", p),
// );
// _willSetCurrentLevelFx.done.watch((p) =>
//   console.log(">> _willSetCurrentLevelFx.done", p),
// );
export const exportCurrentLevel = createEvent<unknown>();
interface ImportLevelParams {
  file: File;
  levelset?: IBaseLevelset<IBaseLevel>;
}
export const importCurrentLevel = createEvent<ImportLevelParams>();
/**
 * Insert new level in current level index in current levelset
 */
export const insertAtCurrentLevel = createEvent<unknown>();
/**
 * Append new level in current levelset
 */
export const appendLevel = createEvent<unknown>();
/**
 * Delete current level in current levelset
 */
export const deleteCurrentLevel = createEvent<unknown>();
const _deleteLevel = createEvent<_LevelRefStrict>();
export const changeLevelsOrder =
  createEvent<readonly LevelBuffer<IBaseLevel>[]>();
/**
 * Delete all the rest levels after the current
 */
export const deleteRestLevels = createEvent<unknown>();
const _deleteRestLevels = createEvent<_LevelRefStrict>();
/**
 * Update current level in current levelset
 */
export const updateCurrentLevel = createEvent<IBaseLevel>();
export const updateLevel = createEvent<{
  key: FilesStorageKey;
  index: number;
  level: IBaseLevel;
}>();
export const internalUpdateLevelDemo = createEvent<{
  key: FilesStorageKey;
  index: number;
  demoData: DemoData;
}>();
/**
 * Undo in current level in current levelset
 */
export const undoCurrentLevel = createEvent<unknown>();
/**
 * Undo in current level in current levelset
 */
export const redoCurrentLevel = createEvent<unknown>();

/**
 * Flush changes for the given levelset to blob
 */
const flushBuffer = createEvent<FilesStorageKey>();
/**
 * Flush changes for all levelset to blob
 */
const flushBuffers = createEvent<unknown>();
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
  FilesStorageKey,
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
      return map;
    },
  )
  // switch per-level "is opened" state
  .on(openLevel, (map, [key, index]) =>
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
    _withCurrentKey(changeLevelsOrder),
    (map, { current: key, value: nextLevels }) =>
      RoMap.update(map, key, (buf) => {
        const newIndices = new Map(nextLevels.map((l, i) => [l, i]));
        const { levels, currentIndex } = buf;
        if (levels.every((l, i) => newIndices.get(l) === i)) {
          return buf;
        }
        return {
          ...buf,
          currentIndex:
            currentIndex !== undefined
              ? newIndices.get(levels[currentIndex])
              : undefined,
          levels: Array.from(levels).sort(
            (a, b) => (newIndices.get(a) ?? 0) - (newIndices.get(b) ?? 0),
          ),
        };
      }),
  )
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
  source: _$buffersMap,
  filter: (files, key) =>
    Boolean(
      key && files.has(key) && files.get(key)!.currentIndex !== undefined,
    ),
  fn: (files, key) => files.get(key!)!.currentIndex!,
});

const _willCloseLevelFx = createEffect(async (ref: _LevelRefStrict) => {
  await _willSetCurrentLevelFx([ref[0], null]);
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

const _insertAtCurrentLevel = sample({
  clock: insertAtCurrentLevel,
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
});
sample({
  source: _insertAtCurrentLevel,
  target: _willSetCurrentLevelFx,
});
sample({
  clock: appendLevel,
  source: {
    files: _$buffersMap,
    key: $currentKey,
  },
  filter: ({ files, key }) => Boolean(key && files.has(key)),
  fn: ({ files, key }): _LevelRef => [
    key!,
    // at this moment it already has new level in the end
    files.get(key!)!.levels.length - 1,
  ],
  target: _willSetCurrentLevelFx,
});

const _$currentDriverMinLevelsCount = combine(
  $currentDriverName,
  $currentDriverFormat,
  (drv, fmt) => (drv && fmt && getDriverFormat(drv, fmt)?.minLevelsCount) || 1,
);

const _willDeleteLevelFx = createEffect(async (ref: _LevelRefStrict) => {
  await _willSetCurrentLevelFx([ref[0], null]);
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
// _$openedIndices.watch((p) => console.log(">> _$openedIndices", p));
// _$wakeUpOpenedIndices.watch((p) => console.log(">> _$wakeUpOpenedIndices", p));
// _$keepOpenedIndices.watch((p) => console.log(">> _$keepOpenedIndices", p));

const openedLevelsDidWakeUp = createEvent<void>();
const _$wakeUpWait = createStore<ReadonlySet<1 | 2>>(new Set([1, 2]))
  .on(levelsetsDidWakeUp, (s) => RoSet.remove(s, 1))
  .on(openedLevelsDidWakeUp, (s) => RoSet.remove(s, 2));

export const filesDidWakeUp = sample({
  clock: _$wakeUpWait,
  filter: (s) => !s.size,
});

// openedLevelsDidWakeUp.watch(() => console.warn("OPENED LEVELS WAKE UP END"));
// filesDidWakeUp.watch(() => console.warn("DATA WAKE UP END"));

// persistent store indices for opened levels
type _OpenedIndicesSerialized = readonly [
  key: FilesStorageKey,
  opened: readonly number[],
  current?: number | null,
];
type _OpenedIndicesSerializedList = readonly _OpenedIndicesSerialized[];
withPersistent<string, _OpenedIndicesWakeUpMap, _OpenedIndicesSerializedList>(
  _$keepOpenedIndices,
  configStorage,
  "openedLevels",
  {
    // Opening a file cause it first to appear with no current level,
    // then the current level set to 0.
    flushDelay: 5,
    wakeUp: _$wakeUpOpenedIndices,
    ...($instanceIsReadOnly ? { readOnly: $instanceIsReadOnly } : null),
    onAfterWakeUp: openedLevelsDidWakeUp,
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
    target: createEvent<ReadonlySet<FilesStorageKey>>(),
  }),
  (map, keys) => RoMap.filter(map, (_, k) => !keys.has(k)),
);

export const flushCurrentFile = createEvent<unknown>();
export const saveAndClose = createEvent<unknown>();
export const saveOthersAndClose = createEvent<unknown>();
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

type _SaveAsInnerParams = { key: FilesStorageKey; options?: SaveAsOptions };
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
        JSON.stringify(serializeLocalOptionsList(localOptions), null, 2) + "\n",
      );
      saveFileAs(await zip.generateAsync({ type: "blob" }), `${file.name}.zip`);
    } else {
      saveFileAs(file.file, file.name);
    }
  }
});

let _$dirtyKeys: Store<ReadonlySet<FilesStorageKey>>;
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
  type _MapToFlush = ReadonlyMap<FilesStorageKey, IBaseLevelsList>;
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
  _$dirtyKeys = _$changedLevelsets.map<ReadonlySet<FilesStorageKey>>(
    (map) => new Set(map.keys()),
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
      const ret = new Map<FilesStorageKey, IBaseLevelsList>();
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
          key: FilesStorageKey;
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
  if (import.meta.env.DEV) {
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
export const findPlayer = createEvent<unknown>();
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
        }.${fmtLevelForFilename(index, lvl.title)}${dotExt}`,
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
    async ({
      file,
      levelset,
      driverName,
      driverFormat,
    }: ImportLevelParams & DriverOpt) => {
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

      let localOptions: LocalOptions | undefined = undefined;
      if (levelset) {
        localOptions = levelset.getLevel(0).localOptions;
      } else {
        levelset = from.readLevelset(await file.arrayBuffer());
      }
      const report = summarySupportReport(supportReport(levelset));
      if (report?.type === SupportReportType.ERR) {
        return { report };
      }
      // apply the things warned by warnings
      levelset = readLevelset(
        writeLevelset(createLevelset([levelset.getLevel(0)])),
      );
      return {
        level: levelset.getLevel(0).setLocalOptions(localOptions),
        report,
      };
    },
  );
  sample({
    clock: importCurrentLevel,
    source: {
      driverName: $currentDriverName,
      driverFormat: $currentDriverFormat,
    },
    filter: (o): o is DriverOpt => Boolean(o.driverName && o.driverFormat),
    fn: (s: DriverOpt, f: ImportLevelParams) => ({ ...s, ...f }),
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
          {report.type === SupportReportType.ERR ? (
            <Trans i18nKey="main:level.import.CannotImportDueTo" />
          ) : (
            <Trans i18nKey="main:level.import.ImportWithChanges" />
          )}
        </p>
        <SupportReport report={report} />
      </>,
      {
        button: {
          uiColor: ColorType.MUTE,
          text: <Trans i18nKey="main:common.buttons.Close" />,
        },
      },
    ),
  );
  importCurrentLevelFx.failData.watch((e) =>
    msgBox(
      <Trans
        i18nKey="main:level.import.ImportFailed"
        values={{ reason: e.message }}
      />,
      {
        button: {
          uiColor: ColorType.MUTE,
          text: <Trans i18nKey="main:common.buttons.Close" />,
        },
      },
    ),
  );
}

export const cmpLevelToggle = createEvent<unknown>();
const setCmpFirstLevelRef = createEvent<_LevelRefStrict | null>();
export const closeCmpLevels = createEvent<unknown>();
export const swapCmpLevels = createEvent<unknown>();
const setCmpLevels = createEvent<[_LevelRefStrict, _LevelRefStrict]>();
const $cmpLevelsRefs = restore(setCmpLevels, null)
  .reset(closeCmpLevels)
  .on(swapCmpLevels, (r) => r && [r[1], r[0]]);
export const $hasCmpLevelsRefs = $cmpLevelsRefs.map(Boolean);
export type CmpEntry = { file: LevelsetFile; index: number; level: IBaseLevel };
type _CmpEntries = [CmpEntry, CmpEntry];
export const $cmpLevels = combine(
  $levelsets,
  _$buffersMap,
  $cmpLevelsRefs,
  (files, buffers, refs): _CmpEntries | null => {
    if (!refs) {
      return null;
    }
    const [a, b] = refs.map<CmpEntry | null>(([key, index]) => {
      const file = files.get(key);
      const level = buffers.get(key)?.levels[index]?.undoQueue.current;
      if (file && level) {
        return { file, index, level };
      }
      return null;
    });
    if (a && b) {
      return [a, b];
    }
    return null;
  },
);
const $cmpFirstLevelRef = restore(setCmpFirstLevelRef, null)
  .reset(setCmpLevels, closeCmpLevels)
  .on($levelsets.updates, (ref, files) => {
    if (ref) {
      const [key] = ref;
      if (!files.has(key)) {
        return null;
      }
    }
    return ref;
  })
  .on(_deleteLevel, (ref, del) => {
    if (ref) {
      const [key, index] = ref;
      const [delKey, delIndex] = del;
      if (delKey === key) {
        if (delIndex === index) {
          return null;
        }
        if (delIndex < index) {
          return [key, index - 1];
        }
      }
    }
    return ref;
  })
  .on(_deleteRestLevels, (ref, del) => {
    if (ref) {
      const [key, index] = ref;
      const [delKey, delIndex] = del;
      if (delKey === key && index > delIndex) {
        return null;
      }
    }
    return ref;
  })
  .on(_insertAtCurrentLevel, (ref, ins) => {
    if (ref) {
      const [key, index] = ref;
      const [insKey, insIndex] = ins;
      if (key === insKey && index >= insIndex) {
        return [key, index + 1];
      }
    }
    return ref;
  });
export const $cmpLevelHasFirst = $cmpFirstLevelRef.map(Boolean);
export const $cmpLevelFirstTitle = combine(
  $cmpFirstLevelRef,
  $levelsets,
  $currentKey,
  _$buffersMap,
  (ref, levelsets, currentKey, files): TranslationGetter | null => {
    if (!ref) {
      return (t) => t("main:cmpLevels.button.SetCurrentAsFirst");
    }
    const [key, index] = ref;
    const buffer = files.get(key);
    if (currentKey && key === currentKey && buffer?.currentIndex === index) {
      return (t) => t("main:cmpLevels.button.SelectAnotherLevel");
    }
    const levelset = levelsets.get(key);
    const level = buffer?.levels[index]?.undoQueue.current;
    if (levelset && level) {
      const values = {
        file: levelset.name,
        level: fmtLevelShort(
          index,
          String(levelset.levelset.levelsCount).length,
          level.title,
        ),
        size: `${level.width}x${level.height}`,
      };
      return (t) => t("main:cmpLevels.button.CompareWithCurrent", values);
    }
    return null;
  },
);
sample({
  clock: cmpLevelToggle,
  source: {
    files: _$buffersMap,
    key: $currentKey,
    prev: $cmpFirstLevelRef,
  },
  filter: ({ files, key }) =>
    Boolean(
      key && files.has(key) && files.get(key)!.currentIndex !== undefined,
    ),
  fn: ({ files, key, prev }): [_LevelRefStrict, _LevelRefStrict | null] => [
    [key!, files.get(key!)!.currentIndex!],
    prev,
  ],
}).watch(([ref, prev]) => {
  if (!prev) {
    setCmpFirstLevelRef(ref);
    return;
  }
  if (prev[0] === ref[0] && prev[1] === ref[1]) {
    setCmpFirstLevelRef(null);
    return;
  }
  setCmpLevels([prev, ref]);
});
