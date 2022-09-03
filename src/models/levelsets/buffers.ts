import {
  combine,
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
  IBaseLevelsList,
  isEqualLevels,
  LevelsetFileKey,
  LevelsetFlushBuffer,
  LevelsetsBuffers,
  LevelWithIndex,
  readToBuffer,
  readToBuffers,
  updateBufferLevel,
} from "./types";

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
/**
 * Flush changes for the given levelset to blob
 */
export const flushBuffer = createEvent<LevelsetFileKey>();
/**
 * Flush changes for all levelset to blob
 */
export const flushBuffers = createEvent<any>();

const _withCurrentKey = <T>(
  clock: Event<T>,
): Event<{ key: LevelsetFileKey; value: T }> =>
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
  .on($currentLevelsetFile, (map, current) => {
    if (current && !map.has(current.key)) {
      return RoMap.set(map, current.key, readToBuffers(current.levels));
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
          files.has(key) && !isEqualLevels(levels, files.get(key)!.levels),
      ),
  );
  // auto trigger flush for all after buffers changed
  flushDelayed({
    source: _$changedLevelsets,
    flushDelay: 60 * 1000,
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
        [...levelsels].reduce<{ key: LevelsetFileKey; ab: ArrayBuffer }[]>(
          (list, [key, levels]) => {
            const file = files.get(key);
            if (file) {
              const ab = _writeBuffersToFile({
                key,
                driverName: file.driverName,
                levels,
              });
              if (ab) {
                list.push({ key, ab });
              }
            }
            return list;
          },
          [],
        ),
    }),
    (files, result) =>
      result.reduce(
        (files, { key, ab }) =>
          RoMap.update(files, key, (f) => ({ ...f, file: new Blob([ab]) })),
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
