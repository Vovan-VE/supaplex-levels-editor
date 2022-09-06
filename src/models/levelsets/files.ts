import {
  combine,
  createEffect,
  createEvent,
  createStore,
  sample,
} from "effector";
import { withPersistentMap } from "@cubux/effector-persistent";
import * as RoMap from "@cubux/readonly-map";
import { createIndexedDBDriver, createNullDriver } from "@cubux/storage-driver";
import { getDriver } from "drivers";
import { generateKey } from "utils/strings";
import { LevelsetFile, LevelsetFileKey, LevelsetFileSource } from "./types";

/**
 * Add new file from whatever source
 */
export const addLevelsetFileFx = createEffect(
  async (source: LevelsetFileSource): Promise<LevelsetFile> => {
    const driver = getDriver(source.driverName);
    if (!driver) {
      throw new Error("Invalid driver name: " + source.driverName);
    }
    const reader = driver.reader;
    if (!reader) {
      throw new Error("No reader in driver: " + source.driverName);
    }
    let ab: ArrayBuffer;
    try {
      ab = await source.file.arrayBuffer();
    } catch (e) {
      console.error(e);
      throw new Error(
        "Could not read data from blob: " +
          (e instanceof Error ? e.message : "unknown error"),
      );
    }
    return {
      ...source,
      key: generateKey() as LevelsetFileKey,
      levels: [...reader.readLevelset(ab).getLevels()],
    };
  },
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
 * Switch currently selected file
 */
export const setCurrentLevelset = createEvent<LevelsetFileKey>();
/**
 * Key of current selected file within `$levelsets`
 */
export const $currentKey = createStore<LevelsetFileKey | null>(null)
  .on(setCurrentLevelset, (_, c) => c)
  .on(addLevelsetFileFx.doneData, (_, { key }) => key);

const _removeLevelsetFile = sample({
  clock: removeCurrentLevelsetFile,
  source: $currentKey,
  filter: Boolean,
});
$currentKey.on(_removeLevelsetFile, (c, del) => (del === c ? null : undefined));

/**
 * Loaded files in memory
 */
export const $levelsets = withPersistentMap(
  createStore<ReadonlyMap<LevelsetFileKey, LevelsetFile>>(new Map()),
  process.env.NODE_ENV === "test"
    ? createNullDriver()
    : createIndexedDBDriver({
        dbName: "sp-ed",
        dbVersion: 1,
        table: "levelset-files",
      }),
)
  .on([updateLevelsetFile, addLevelsetFileFx.doneData], (map, file) =>
    RoMap.set(map, file.key, file),
  )
  .on(_removeLevelsetFile, RoMap.remove);

/**
 * Reference to current file and key together
 */
export const $currentLevelsetFile = combine(
  $levelsets,
  $currentKey,
  (map, key) => (key && map.get(key)) || null,
);
