import { Cell, Direction } from "./types";

export const newCell = (x: number, y: number, allWalls = true): Cell => ({
  x,
  y,
  walls: new Set(
    allWalls
      ? [Direction.TOP, Direction.RIGHT, Direction.BOTTOM, Direction.LEFT]
      : undefined,
  ),
});

export const setWall = (cell: Cell, at: Direction, set: boolean) => {
  if (set) {
    cell.walls.add(at);
  } else {
    cell.walls.delete(at);
  }
};
