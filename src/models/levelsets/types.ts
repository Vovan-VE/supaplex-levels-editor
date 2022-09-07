import * as RoArray from "@cubux/readonly-array";
import * as RoMap from "@cubux/readonly-map";
import { CodeOf } from "@cubux/types";
import { IBaseLevel } from "drivers";
import { UndoQueue } from "utils/data";

export type LevelsetFileKey = CodeOf<"LevelsetFile">;

export type IBaseLevelsList = readonly IBaseLevel[];

export interface LevelsetFileSource {
  file: Blob;
  name: string;
  driverName: string;
}
export interface LevelsetFile extends LevelsetFileSource {
  key: LevelsetFileKey;
  levels?: IBaseLevelsList;
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
  levels: IBaseLevelsList;
}

export const readToBuffer = <L extends IBaseLevel>(
  level: L,
): LevelBuffer<L> => ({
  undoQueue: new UndoQueue(level),
});
export const readToBuffers = <L extends IBaseLevel>(
  levels: readonly L[],
): LevelsetBuffers<L> => ({ levels: levels.map(readToBuffer) });

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
