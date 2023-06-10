import {
  combine,
  createEffect,
  createEvent,
  createStore,
  forward,
  sample,
} from "effector";
import { withPersistent, withPersistentMap } from "@cubux/effector-persistent";
import * as RoMap from "@cubux/readonly-map";
import { StoreDriver } from "@cubux/storage-driver";
import {
  $instanceIsReadOnly,
  allowManualSave,
  configStorage,
  createFile,
  exitApp,
  filesStorage,
  FilesStorageItem,
  onExitDirty,
} from "backend";
import {
  DriverName,
  FALLBACK_FORMAT,
  getDriverFormat,
  isExtValid,
  LocalOptionsList,
  parseFormatFilename,
  REPLACED_DRIVERS,
  summarySupportReport,
} from "drivers";
import { generateKey } from "utils/strings";
import * as MapOrder from "utils/map/order";
import { showToastErrorWrap } from "../ui/toasts";
import { flushEvents } from "./flushEvents";
import {
  LevelsetConvertOpt,
  LevelsetConvertTry,
  LevelsetFile,
  LevelsetFileData,
  LevelsetFileDataOld,
  LevelsetFileKey,
  LevelsetFileSource,
} from "./types";

const fulfillFileLevels = async (
  input: LevelsetFileData,
): Promise<LevelsetFile> => {
  const format = getDriverFormat(input.driverName, input.driverFormat);
  if (!format) {
    throw new Error(
      `Invalid driver or format: ${input.driverName}, ${input.driverFormat}`,
    );
  }
  let ab: ArrayBuffer;
  try {
    ab = await input.file.arrayBuffer();
  } catch (e) {
    throw new Error(
      "Could not read data from blob: " +
        (e instanceof Error ? e.message : "unknown error"),
    );
  }
  return {
    ...input,
    levelset: format.readLevelset(ab),
  };
};

interface AddFileParams extends LevelsetFileSource {
  insertAfterKey?: LevelsetFileKey;
  key?: LevelsetFileKey;
}
interface AddFileResult {
  file: LevelsetFile;
  insertAfterKey: LevelsetFileKey | undefined;
}

const prepareCreateFileAborted = createFile ? new Error() : undefined;
const prepareCreateFileFx = createFile
  ? createEffect(
      async ({ key, filename }: { key: LevelsetFileKey; filename: string }) => {
        if (!(await createFile!(key, filename))) {
          throw prepareCreateFileAborted;
        }
      },
    )
  : undefined;
/**
 * Add new file from whatever source
 */
export const addLevelsetFileFx = createEffect(
  async ({
    insertAfterKey,
    key = generateKey() as LevelsetFileKey,
    ...source
  }: AddFileParams): Promise<AddFileResult | null> => {
    const file = await fulfillFileLevels({
      ...source,
      key,
    });
    if (prepareCreateFileFx) {
      try {
        await prepareCreateFileFx({ key, filename: source.name });
      } catch (e) {
        if (e === prepareCreateFileAborted) {
          return null;
        }
        throw e;
      }
    }
    return { file, insertAfterKey };
  },
);
const addLevelsetFileDoneData = sample({
  source: addLevelsetFileFx.doneData,
  filter: Boolean,
});
addLevelsetFileFx.fail.watch(({ error }) =>
  showToastErrorWrap("Could not load file", error),
);

interface LevelsetConvertContinue extends LevelsetConvertOpt {
  file: LevelsetFile;
}
const convertLevelsetContinueFx = createEffect(
  ({ file, toDriverFormat }: LevelsetConvertContinue) => {
    const to = getDriverFormat(file.driverName, toDriverFormat);
    if (to) {
      let newFileName = file.name;
      if (file.driverFormat !== toDriverFormat) {
        const origFN = parseFormatFilename(
          file.name,
          file.driverName as DriverName,
          file.driverFormat,
        );
        if (
          !origFN.hasExt ||
          !isExtValid(origFN.ext, file.driverName as DriverName, toDriverFormat)
        ) {
          newFileName = `${origFN.basename}.${to.fileExtensionDefault}`;
        }
      }

      return addLevelsetFileFx({
        file: new Blob([to.writeLevelset(file.levelset)]),
        name: newFileName,
        driverName: file.driverName,
        driverFormat: toDriverFormat,
        insertAfterKey: file.key,
      });
    }
  },
);

export const convertLevelsetTryFx = createEffect(
  async ({ toDriverFormat, confirmWarnings }: LevelsetConvertTry) => {
    const file = $currentLevelsetFile.getState();
    if (file) {
      if (!confirmWarnings) {
        const { supportReport } = getDriverFormat(
          file.driverName,
          toDriverFormat,
        )!;
        const report = summarySupportReport(supportReport(file.levelset));
        if (report) {
          return report;
        }
      }
      await convertLevelsetContinueFx({ file, toDriverFormat });
    }
  },
);

/**
 * Close file and forget everything about it
 */
export const removeCurrentLevelsetFile = createEvent<any>();
/**
 * Close other files but current and forget everything about them
 */
export const removeOthersLevelsetFile = createEvent<any>();
/**
 * Update loaded file in memory
 */
export const updateLevelsetFile = createEvent<LevelsetFile>();
/**
 * Rename currently selected file
 */
export const renameCurrentLevelset = createEvent<string>();

/**
 * Switch currently selected file
 */
export const setCurrentLevelset = createEvent<LevelsetFileKey>();

export const fileDidOpen = addLevelsetFileDoneData.map(
  ({ file: { key } }) => key,
);

const _willSetCurrentKeyFx = createEffect((next: LevelsetFileKey | null) => {
  _unsetCurrentKey();
  _setCurrentKey(next);
});
const _unsetCurrentKey = createEvent();
const _setCurrentKey = createEvent<LevelsetFileKey | null>();
forward({
  from: setCurrentLevelset,
  to: _willSetCurrentKeyFx,
});
/**
 * Key of current selected file within `$levelsets`
 */
export const $currentKey = withPersistent(
  createStore<LevelsetFileKey | null>(null),
  configStorage,
  "currentFile",
  $instanceIsReadOnly ? { readOnly: $instanceIsReadOnly } : undefined,
).on(_setCurrentKey, (_, c) => c);

export const currentKeyWillGone = createEvent<LevelsetFileKey>();
export const currentKeyBeforeWillGone = sample({
  clock: _unsetCurrentKey,
  source: $currentKey,
  filter: Boolean,
});
currentKeyBeforeWillGone.watch(currentKeyWillGone);

const _removeLevelsetFile = sample({
  clock: removeCurrentLevelsetFile,
  source: $currentKey,
  filter: Boolean,
});
sample({
  source: _removeLevelsetFile,
  fn: () => null,
  target: _willSetCurrentKeyFx,
});

const _removeOthersLevelsetFile = sample({
  clock: removeOthersLevelsetFile,
  source: $currentKey,
  filter: Boolean,
});

/**
 * Old < 0.6 interface before formats
 *
 * Any user can skip several >=0.6 versions, so `driverFormat` can still be
 * `undefined` for someone.
 */
interface _DbLevelsetFile
  extends Omit<LevelsetFileDataOld, "file">,
    FilesStorageItem {
  fileBuffer: ArrayBuffer;
  _options?: LocalOptionsList;
}

export const $levelsets = withPersistentMap(
  createStore<ReadonlyMap<LevelsetFileKey, LevelsetFile>>(new Map()),
  filesStorage as StoreDriver<LevelsetFileKey, _DbLevelsetFile>,
  {
    ...flushEvents,
    ...($instanceIsReadOnly ? { readOnly: $instanceIsReadOnly } : null),
    serialize: async ({
      file,
      name,
      driverName,
      driverFormat,
      key,
      levelset,
    }: LevelsetFile): Promise<_DbLevelsetFile> => ({
      name,
      driverName,
      driverFormat,
      key,
      fileBuffer: await file.arrayBuffer(),
      _options: levelset.localOptions,

      // DEV update time for local debug purpose
      ...(process.env.NODE_ENV === "development"
        ? { _t: new Date().toISOString() }
        : null),
    }),
    unserialize: async ({
      name,
      driverName,
      driverFormat,
      key,
      fileBuffer,
      _options,
    }: _DbLevelsetFile) => {
      const lf = await fulfillFileLevels({
        file: new Blob([fileBuffer]),
        name,
        driverName: REPLACED_DRIVERS[driverName] || driverName,
        driverFormat:
          driverFormat ?? FALLBACK_FORMAT[driverName] ?? "_unknown_",
        key,
      });
      return {
        ...lf,
        levelset: lf.levelset.setLocalOptions(_options),
      };
    },
  },
)
  .on(updateLevelsetFile, (map, file) => RoMap.set(map, file.key, file))
  .on(addLevelsetFileDoneData, (map, { file, insertAfterKey }) => {
    let next = RoMap.set(map, file.key, file);
    if (insertAfterKey) {
      next = MapOrder.moveAfter(next, file.key, insertAfterKey);
    }
    return next;
  })
  .on(_removeLevelsetFile, RoMap.remove)
  .on(_removeOthersLevelsetFile, (map, key) => {
    if (map.size > 1) {
      const v = map.get(key);
      if (v) {
        return new Map([[key, v]]);
      }
    }
  });
if (!allowManualSave) {
  $levelsets.on(
    sample({
      clock: renameCurrentLevelset,
      source: $currentKey,
      filter: Boolean,
      fn: (key, name) => ({ key, name }),
    }),
    (map, { key, name }) =>
      RoMap.update(map, key, (file) => ({ ...file, name })),
  );
}

export const onceFlushDone = createEvent<() => void>();
if (onExitDirty && exitApp) {
  type F = () => void;
  type FS = readonly F[];
  const run = createEvent<FS>();
  const $queue = createStore<FS>([])
    .reset(flushEvents.onFlushFail, run)
    .on(onceFlushDone, (list, fn) => [...list, fn]);
  sample({
    clock: flushEvents.onFlushDone,
    source: $queue,
    filter: (q) => q.length > 0,
    target: run,
  });
  run.watch((fs) => {
    for (const f of fs) {
      try {
        f();
      } catch (e) {
        console.error("onFlushDone queue", f, "error:", e);
      }
    }
  });
}

export const $hasFiles = $levelsets.map((m) => m.size > 0);
export const $hasOtherFiles = combine(
  $levelsets,
  $currentKey,
  (m, current) => m.size > 1 && Boolean(current && m.has(current)),
);
export const $isFileOpened = $currentKey.map(Boolean);

// reset current file key when is refers to non-existing file
sample({
  clock: $levelsets,
  source: { key: $currentKey, files: $levelsets },
  filter: ({ key, files }) => typeof key === "string" && !files.has(key),
  fn: () => null,
  target: _willSetCurrentKeyFx,
});

/**
 * Reference to current file and key together
 */
export const $currentLevelsetFile = combine(
  $levelsets,
  $currentKey,
  (map, key) => (key && map.get(key)) || null,
);

export const $currentFileName = $currentLevelsetFile.map((f) =>
  f ? f.name : null,
);
export const $currentDriverName = $currentLevelsetFile.map((f) =>
  f ? f.driverName : null,
);
export const $currentDriverFormat = $currentLevelsetFile.map((f) =>
  f ? f.driverFormat : null,
);
export const $currentFileHasLocalOptions = $currentLevelsetFile.map((f) =>
  Boolean(f && f.levelset.hasLocalOptions),
);