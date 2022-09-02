import {
  combine,
  createEffect,
  createEvent,
  createStore,
  Event,
  forward,
  merge,
  sample,
} from "effector";
import * as RoArray from "@cubux/readonly-array";
import * as RoMap from "@cubux/readonly-map";
import { getDriver, IBaseLevel } from "drivers";
import { flushDelayed } from "utils/effector";
import { isNotNull } from "utils/fn";
import { $currentKey, $currentLevelsetFile, $levelsets } from "./files";
import {
  LevelsetFlushBuffer,
  LevelsetKeyAndFile,
  LevelsetsBuffers,
  LevelWithIndex,
  readToBuffer,
  readToBuffers,
  updateBufferLevel,
  writeFromBuffers,
} from "./types";

/**
 * Flush data from buffers back to files
 */
export const flushBuffers = createEvent<LevelsetsBuffers>();

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
 * Insert new level at the given index in current levelset
 */
export const insertLevel = createEvent<LevelWithIndex>();
/**
 * Append new level in current levelset
 */
export const appendLevel = createEvent<IBaseLevel>();
/**
 * Delete level with the given index in current levelset
 */
export const deleteLevel = createEvent<number>();
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

const readBufferFromFileFx = createEffect(
  async ({ file: { file, driverName } }: LevelsetKeyAndFile) =>
    getDriver(driverName)?.reader?.readLevelset(await file.arrayBuffer()) ||
    null,
);
const writeBuffersToFileFx = createEffect(
  async ({ driverName, buffer }: LevelsetFlushBuffer) => {
    const d = getDriver(driverName);
    return (
      (d &&
        d.writer?.writeLevelset(d.createLevelset(writeFromBuffers(buffer)))) ||
      null
    );
  },
);

const _withCurrentKey = <T>(clock: Event<T>) =>
  sample({
    clock,
    source: $currentKey,
    filter: isNotNull,
    fn: (key, value) => ({ key: key!, value }),
  });

const _$buffersMap = createStore<LevelsetsBuffers>(new Map())
  // remove buffers when a file closed
  .on($levelsets, (map, existing) =>
    RoMap.filter(map, (_, key) => existing.has(key)),
  )
  // init on file read done
  .on(readBufferFromFileFx.done, (map, { params: { key }, result }) => {
    if (result) {
      return RoMap.set(map, key, readToBuffers([...result.getLevels()]));
    }
  })
  // switch per-level "is opened" state
  .on(
    _withCurrentKey(
      merge<{ index?: number; open: boolean }>([
        openLevel.map((index) => ({ index, open: true })),
        closeLevel.map((index) => ({ index, open: false })),
      ]),
    ),
    (map, { key, value: { index, open } }) => {
      const next = updateBufferLevel(map, key, index, (b) => ({
        ...b,
        isOpened: open,
      }));
      if (
        !open &&
        (index === undefined || index === map.get(key)?.currentIndex)
      ) {
        return RoMap.update(next, key, (buf) => ({
          ...buf,
          currentIndex: undefined,
        }));
      }
      return next;
    },
  )
  // switch current level in the given levelset
  .on(_withCurrentKey(setCurrentLevel), (map, { key, value: index }) =>
    RoMap.update(map, key, (buf) =>
      index >= 0 && index < buf.levels.length
        ? { ...buf, currentIndex: index }
        : buf,
    ),
  )
  // insert new level into current levelset
  .on(_withCurrentKey(insertLevel), (map, { key, value: { index, level } }) =>
    RoMap.update(map, key, (buf) => ({
      ...buf,
      levels: RoArray.insert(buf.levels, index, readToBuffer(level)),
      // no current level OR inserted after current
      ...(buf.currentIndex === undefined || index > buf.currentIndex
        ? // no op
          null
        : // otherwise: inserted was before current or current, so shift current
          { currentIndex: buf.currentIndex + 1 }),
    })),
  )
  // append new level into current levelset
  .on(_withCurrentKey(appendLevel), (map, { key, value: level }) =>
    RoMap.update(map, key, (buf) => ({
      ...buf,
      levels: [...buf.levels, readToBuffer(level)],
    })),
  )
  // delete the level from current levelset
  .on(_withCurrentKey(deleteLevel), (map, { key, value: index }) =>
    RoMap.update(map, key, (buf) => ({
      ...buf,
      levels: RoArray.remove(buf.levels, index),
      // no current level OR deleted was after current
      ...(buf.currentIndex === undefined || index > buf.currentIndex
        ? // no op
          null
        : // deleted was current
        buf.currentIndex === index
        ? // unset current
          { currentIndex: undefined }
        : // otherwise: deleted was before current, so shift current
          { currentIndex: buf.currentIndex - 1 }),
    })),
  )
  // operations with current levels in current levelset
  .on(_withCurrentKey(updateCurrentLevel), (map, { key, value: level }) =>
    updateBufferLevel(map, key, undefined, (b) => ({
      ...b,
      undoQueue: b.undoQueue.done(level),
    })),
  )
  // undo in current level in current levelset
  .on(_withCurrentKey(undoCurrentLevel), (map, { key }) =>
    updateBufferLevel(map, key, undefined, (b) =>
      b.undoQueue.canUndo ? { ...b, undoQueue: b.undoQueue.undo() } : b,
    ),
  )
  // redo in current level in current levelset
  .on(_withCurrentKey(redoCurrentLevel), (map, { key }) =>
    updateBufferLevel(map, key, undefined, (b) =>
      b.undoQueue.canRedo ? { ...b, undoQueue: b.undoQueue.redo() } : b,
    ),
  );

sample({
  // on current levelset file changed
  clock: $currentLevelsetFile,
  source: _$buffersMap,
  // when buffer is not initialized yet
  filter: (map, cur) => cur !== null && !map.has(cur.key),
  // trigger file reading
  fn: (_, cur) => cur!,
  target: readBufferFromFileFx,
});

readBufferFromFileFx.fail.watch(({ params: { file }, error }) => {
  // TODO: UI toast
  console.log("Could not load file", file, error);
});

// auto trigger flush after buffers changed
flushDelayed({
  source: _$buffersMap,
  flushDelay: 60 * 1000,
  target: flushBuffers,
});
// forward buffers to async effect
sample({
  clock: flushBuffers,
  source: $levelsets,
  fn: (levelsets, buffers) =>
    [...buffers]
      .map(([key, buffer]) => ({
        key,
        buffer,
        driverName: levelsets.get(key)?.driverName,
      }))
      .filter((p): p is LevelsetFlushBuffer => p.driverName !== undefined),
}).watch((toFlush) => {
  for (const params of toFlush) {
    writeBuffersToFileFx(params);
  }
});
// update blob files on flush success
$levelsets.on(
  writeBuffersToFileFx.done,
  (files, { params: { key }, result: ab }) => {
    if (ab) {
      return RoMap.update(files, key, (f) => ({ ...f, file: new Blob([ab]) }));
    }
  },
);
writeBuffersToFileFx.fail.watch(({ params, error }) => {
  // TODO: UI toast
  console.log("Could flush changes back to file in memory", params, error);
});

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
