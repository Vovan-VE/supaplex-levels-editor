import {
  combine,
  createEffect,
  createEvent,
  createStore,
  sample,
} from "effector";
import { withPersistent, withPersistentMap } from "@cubux/effector-persistent";
import * as RoMap from "@cubux/readonly-map";
import {
  createIndexedDBDriver,
  createLocalStorageDriver,
  createNullDriver,
} from "@cubux/storage-driver";
import { getDriver } from "drivers";
import { generateKey } from "utils/strings";
import { LevelsetFile, LevelsetFileKey, LevelsetFileSource } from "./types";

const fulfillFileLevels = async (
  input: LevelsetFile,
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
    levels: [...reader.readLevelset(ab).getLevels()],
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
  // TODO: UI toast
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

const lsDriver = createLocalStorageDriver({
  prefix: "sp-ed",
});

/**
 * Key of current selected file within `$levelsets`
 */
export const $currentKey = withPersistent(
  createStore<LevelsetFileKey | null>(null),
  lsDriver,
  "currentFile",
)
  .on(setCurrentLevelset, (_, c) => c)
  .on(addLevelsetFileFx.doneData, (_, { key }) => key);

const _removeLevelsetFile = sample({
  clock: removeCurrentLevelsetFile,
  source: $currentKey,
  filter: Boolean,
});
$currentKey.on(_removeLevelsetFile, (c, del) => (del === c ? null : undefined));

interface _DbLevelsetFile extends Omit<LevelsetFile, "file" | "levels"> {
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
        dbName: "sp-ed",
        dbVersion: 1,
        table: "levelset-files",
      }),
  {
    serialize: async ({ file, name, driverName, key }: LevelsetFile) => ({
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

// reset current file key when is refers to non-existing file
$currentKey.reset(
  sample({
    clock: $levelsets,
    source: { key: $currentKey, files: $levelsets },
    filter: ({ key, files }) => typeof key === "string" && !files.has(key),
  }),
);

/**
 * Reference to current file and key together
 */
export const $currentLevelsetFile = combine(
  $levelsets,
  $currentKey,
  (map, key) => (key && map.get(key)) || null,
);
