import { combine, createEvent, createStore } from "effector";
import * as RoMap from "@cubux/readonly-map";
import { generateKey } from "utils/strings";
import { LevelsetFile, LevelsetKeyAndFile } from "./types";

/**
 * Add new file from whatever source
 */
export const addLevelsetFile = createEvent<LevelsetFile>();
/**
 * Close file and forget everything about it
 */
export const removeLevelsetFile = createEvent<string>();
/**
 * Update loaded file in memory
 */
export const updateLevelsetFile = createEvent<LevelsetKeyAndFile>();

const _addLevelsetFileInternal = addLevelsetFile.map<LevelsetKeyAndFile>(
  (file) => ({
    file,
    key: generateKey(),
  }),
);

/**
 * Loaded files in memory
 */
export const $levelsets = createStore<ReadonlyMap<string, LevelsetFile>>(
  new Map(),
)
  .on([updateLevelsetFile, _addLevelsetFileInternal], (map, { key, file }) =>
    RoMap.set(map, key, file),
  )
  .on(removeLevelsetFile, RoMap.remove);

/**
 * Switch currently selected file
 */
export const setCurrentLevelset = createEvent<string>();
/**
 * Key of current selected file within `$levelsets`
 */
export const $currentKey = createStore<string | null>(null)
  .on(setCurrentLevelset, (_, c) => c)
  .on(_addLevelsetFileInternal, (_, { key }) => key)
  .on(removeLevelsetFile, (c, del) => (del === c ? null : undefined));

/**
 * Reference to current file and key together
 */
export const $currentLevelsetFile = combine(
  $levelsets,
  $currentKey,
  (map, key): LevelsetKeyAndFile | null => {
    if (key) {
      const file = map.get(key);
      if (file) {
        return { key, file };
      }
    }
    return null;
  },
);
