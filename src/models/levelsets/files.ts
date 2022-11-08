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
import { createIndexedDBDriver, createNullDriver } from "@cubux/storage-driver";
import { APP_STORAGE_PREFIX } from "configs";
import { getDriver } from "drivers";
import { generateKey } from "utils/strings";
import { localStorageDriver } from "../_utils/persistent";
import {
  LevelsetFile,
  LevelsetFileData,
  LevelsetFileKey,
  LevelsetFileSource,
} from "./types";

const fulfillFileLevels = async (
  input: LevelsetFileData,
): Promise<LevelsetFile> => {
  const driver = getDriver(input.driverName);
  if (!driver) {
    throw new Error("Invalid driver name: " + input.driverName);
  }
  const reader = driver.reader;
  if (!reader) {
    throw new Error("No reader in driver: " + input.driverName);
  }
  let ab: ArrayBuffer;
  try {
    ab = await input.file.arrayBuffer();
  } catch (e) {
    console.error(e);
    throw new Error(
      "Could not read data from blob: " +
        (e instanceof Error ? e.message : "unknown error"),
    );
  }
  return {
    ...input,
    levelset: reader.readLevelset(ab),
  };
};

/**
 * Add new file from whatever source
 */
export const addLevelsetFileFx = createEffect(
  (source: LevelsetFileSource): Promise<LevelsetFile> =>
    fulfillFileLevels({
      ...source,
      key: generateKey() as LevelsetFileKey,
    }),
);
addLevelsetFileFx.fail.watch(({ params, error }) => {
  console.log("Could not load file", params, error);
});

/**
 * Close file and forget everything about it
 */
export const removeCurrentLevelsetFile = createEvent<any>();
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

export const fileDidOpen = addLevelsetFileFx.doneData.map(({ key }) => key);

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
  localStorageDriver,
  "currentFile",
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

interface _DbLevelsetFile extends Omit<LevelsetFileData, "file"> {
  fileBuffer: ArrayBuffer;
}
/**
 * Loaded files in memory
 */
export const $levelsets = withPersistentMap(
  createStore<ReadonlyMap<LevelsetFileKey, LevelsetFile>>(new Map()),
  process.env.NODE_ENV === "test"
    ? createNullDriver<LevelsetFileKey, _DbLevelsetFile>()
    : createIndexedDBDriver<LevelsetFileKey, _DbLevelsetFile>({
        dbName: APP_STORAGE_PREFIX,
        dbVersion: 1,
        table: "levelset-files",
      }),
  {
    serialize: async ({
      file,
      name,
      driverName,
      key,
    }: LevelsetFile): Promise<_DbLevelsetFile> => ({
      name,
      driverName,
      key,
      fileBuffer: await file.arrayBuffer(),
    }),
    unserialize: ({ name, driverName, key, fileBuffer }: _DbLevelsetFile) =>
      fulfillFileLevels({
        file: new Blob([fileBuffer]),
        name,
        driverName,
        key,
      }),
  },
)
  .on([updateLevelsetFile, addLevelsetFileFx.doneData], (map, file) =>
    RoMap.set(map, file.key, file),
  )
  .on(
    sample({
      clock: renameCurrentLevelset,
      source: $currentKey,
      filter: Boolean,
      fn: (key, name) => ({ key, name }),
    }),
    (map, { key, name }) =>
      RoMap.update(map, key, (file) => ({ ...file, name })),
  )
  .on(_removeLevelsetFile, RoMap.remove);

export const $hasFiles = $levelsets.map((m) => m.size > 0);

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
export const $currentLevelset = $currentLevelsetFile.map((f) =>
  f ? f.levelset : null,
);
