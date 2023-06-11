export const enum Direction {
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
}

export interface Cell {
  x: number;
  y: number;
  walls: Set<Direction>;
}

export interface CellsSet {
  cells: Map<string, Cell>;
}

export interface Maze {
  width: number;
  height: number;
  // Array of rows, t.i. `cells[y][x]`
  cells: Cell[][];
}
