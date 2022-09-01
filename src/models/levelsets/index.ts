import { createEvent, createStore, sample } from "effector";
import * as RoMap from "@cubux/readonly-map";
import { generateKey } from "utils/strings";
import { LevelsetFile } from "./types";

interface Pair {
  key: string;
  file: LevelsetFile;
}

export const addLevelsetFile = createEvent<LevelsetFile>();
export const removeLevelsetFile = createEvent<string>();
export const updateLevelsetFile = createEvent<Pair>();

const _addLevelsetFileInternal = createEvent<Pair>();
sample({
  source: addLevelsetFile,
  fn: (file): Pair => ({ file, key: generateKey() }),
  target: _addLevelsetFileInternal,
});

export const $levelsets = createStore<ReadonlyMap<string, LevelsetFile>>(
  new Map(),
)
  .on([updateLevelsetFile, _addLevelsetFileInternal], (map, { key, file }) =>
    RoMap.set(map, key, file),
  )
  .on(removeLevelsetFile, RoMap.remove);

export const setCurrentLevelset = createEvent<string>();
export const $currentKey = createStore<string | null>(null)
  .on(setCurrentLevelset, (_, c) => c)
  .on(_addLevelsetFileInternal, (_, { key }) => key)
  .on(removeLevelsetFile, (c, del) => (del === c ? null : undefined));
