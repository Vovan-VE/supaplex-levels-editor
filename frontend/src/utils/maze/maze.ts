import { Cell, Direction, Maze } from "./types";
import * as cell from "./cell";
import * as direction from "./direction";

export const newMaze = (width: number, height: number): Maze => ({
  width,
  height,
  cells: Array.from({ length: height }).map((_, y) =>
    Array.from({ length: width }).map((_, x) => cell.newCell(x, y)),
  ),
});

export const forEachCell = (maze: Maze, fn: (c: Cell) => void) => {
  const { width, height, cells } = maze;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      fn(cells[y][x]);
    }
  }
};

export const getAdjacentCell = (
  maze: Maze,
  x: number,
  y: number,
  at: Direction,
): Cell | undefined => {
  const [ax, ay] = direction.adjacentCoords(x, y, at);
  return maze.cells[ay]?.[ax];
};

export const removeWalls = (
  maze: Maze,
  x: number,
  y: number,
  at: Direction,
) => {
  const { cells } = maze;
  const current = cells[y]?.[x];
  if (!current) {
    throw new RangeError(
      `Coords [${x}; ${y}] out of bounds ${maze.width}x${maze.height}`,
    );
  }

  const adjacent = getAdjacentCell(maze, x, y, at);
  if (adjacent) {
    cell.setWall(adjacent, direction.opposite(at), false);
  } else {
    throw new RangeError("There is no adjacent cell");
  }
  cell.setWall(current, at, false);
};
