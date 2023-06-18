import * as RoArray from "@cubux/readonly-array";
import * as RoMap from "@cubux/readonly-map";
import { FilesStorageKey } from "backend";
import { IBaseLevel, IBaseLevelset } from "drivers";
import { strCmp } from "utils/strings";
import { UndoQueue } from "utils/data";

// REFACT: unalias
export type LevelsetFileKey = FilesStorageKey;

export type IBaseLevelsList = readonly IBaseLevel[];

/**
 * Old < 0.6 interface before formats
 *
 * Any user can skip several >=0.6 versions, so `driverFormat` can still be
 * `undefined` for someone.
 */
interface LevelsetFileSourceOld {
  file: Blob;
  name: string;
  driverName: string;
  /** @since 0.6 */
  driverFormat: string | undefined;
  /** @since 0.14 */
  order?: number | undefined;
}
export interface LevelsetFileSource extends LevelsetFileSourceOld {
  driverFormat: string;
}
/**
 * Old < 0.6 interface before formats
 *
 * Any user can skip several >=0.6 versions, so `driverFormat` can still be
 * `undefined` for someone.
 */
export interface LevelsetFileDataOld extends LevelsetFileSourceOld {
  key: LevelsetFileKey;
}
export interface LevelsetFileData extends LevelsetFileDataOld {
  driverFormat: string;
}
export interface LevelsetFile extends LevelsetFileData {
  levelset: IBaseLevelset<IBaseLevel>;
}
export const cmpLevelsetFiles = (a: LevelsetFileData, b: LevelsetFileData) =>
  (a.order ?? 0) - (b.order ?? 0) || strCmp(a.key, b.key);

export interface LevelsetConvertOpt {
  toDriverFormat: string;
}
export interface LevelsetConvertTry extends LevelsetConvertOpt {
  confirmWarnings?: boolean;
}

export interface LevelBuffer<L> {
  undoQueue: UndoQueue<L>;
  isOpened?: boolean;
  // currentTile?: number;
}

export const isEqualLevels = <L>(a: readonly L[], b: readonly L[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

export type LevelsetBuffer<L> = readonly LevelBuffer<L>[];

export interface LevelsetBuffers<L> {
  levels: LevelsetBuffer<L>;
  currentIndex?: number;
}

export type LevelsetsBuffers = ReadonlyMap<
  LevelsetFileKey,
  LevelsetBuffers<IBaseLevel>
>;

export interface LevelsetFlushBuffer {
  key: LevelsetFileKey;
  driverName: string;
  driverFormat: string;
  levels: IBaseLevelsList;
}

export const readToBuffer = <L extends IBaseLevel>(
  level: L,
): LevelBuffer<L> => ({
  undoQueue: new UndoQueue(level),
});
export const readToBuffers = <L extends IBaseLevel>(
  levels: readonly L[],
  opened?: ReadonlySet<number>,
): LevelsetBuffers<L> => ({
  levels: levels.map((l, i) => ({
    ...readToBuffer(l),
    isOpened: opened?.has(i),
  })),
});

export const updateBufferLevel = (
  map: LevelsetsBuffers,
  key: LevelsetFileKey,
  index: number | undefined,
  updater: (level: LevelBuffer<IBaseLevel>) => LevelBuffer<IBaseLevel>,
) =>
  RoMap.update(map, key, (buf) => {
    const i = index ?? buf.currentIndex;
    if (i === undefined) {
      return buf;
    }
    return {
      ...buf,
      levels: RoArray.update(buf.levels, i, updater),
    };
  });

export interface DemoData {
  data: Uint8Array;
  seed_hi: number;
  seed_lo: number;
}
