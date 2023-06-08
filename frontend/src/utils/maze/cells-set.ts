import { Cell, CellsSet } from "./types";

const getKey = (cell: Cell) => `${cell.x};${cell.y}` as const;

export const newCellsSet = (): CellsSet => ({ cells: new Map() });
export const isEmpty = (set: CellsSet): boolean => !set.cells.size;
export const has = (set: CellsSet, cell: Cell): boolean =>
  set.cells.has(getKey(cell));

export const add = (set: CellsSet, cell: Cell) => {
  const key = getKey(cell);
  if (set.cells.has(key)) {
    if (set.cells.get(key) !== cell) {
      throw new Error("Trying to add different cell with the same coords");
    }
  } else {
    set.cells.set(key, cell);
  }
};

export const remove = (set: CellsSet, cell: Cell) => {
  set.cells.delete(getKey(cell));
};

export const getRandom = (set: CellsSet): Cell => {
  const n = set.cells.size;
  if (!n) {
    throw new Error("The Set is empty");
  }
  return Array.from(set.cells.values())[Math.floor(Math.random() * n)];
};
