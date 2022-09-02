import * as RoArray from "@cubux/readonly-array";
import * as RoMap from "@cubux/readonly-map";
import { IBaseLevel } from "drivers";
import { UndoQueue } from "utils/data";

export interface LevelsetFile {
  file: Blob;
  name: string;
  driverName: string;
}

export interface LevelsetKeyAndFile {
  key: string;
  file: LevelsetFile;
}

export interface LevelBuffer<L> {
  undoQueue: UndoQueue<L>;
  isOpened?: boolean;
  // currentTile?: number;
}

export type LevelsetBuffer<L> = readonly LevelBuffer<L>[];

export interface LevelsetBuffers<L> {
  levels: LevelsetBuffer<L>;
  currentIndex?: number;
}

export type LevelsetsBuffers = ReadonlyMap<string, LevelsetBuffers<IBaseLevel>>;

export interface LevelsetFlushBuffer {
  key: string;
  driverName: string;
  buffer: LevelsetBuffers<IBaseLevel>;
}

export const readToBuffer = <L extends IBaseLevel>(level: L) => ({
  undoQueue: new UndoQueue(level),
});
export const readToBuffers = <L extends IBaseLevel>(
  levels: readonly L[],
): LevelsetBuffers<L> => ({ levels: levels.map(readToBuffer) });

export const writeFromBuffers = <L extends IBaseLevel>(
  buf: LevelsetBuffers<L>,
) => buf.levels.map((b) => b.undoQueue.current);

export const updateBufferLevel = (
  map: LevelsetsBuffers,
  key: string,
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

export interface LevelWithIndex {
  level: IBaseLevel;
  index: number;
}
