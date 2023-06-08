import { Cell, CellsSet, Direction, Maze } from "./types";
import * as CS from "./cells-set";
import * as direction from "./direction";
import * as M from "./maze";

// Theory: https://github.com/Vovan-VE/maze--main/blob/master/algorithms/generation.md
// Implementations:
// - https://github.com/Vovan-VE/maze-php/blob/master/src/maze/Generator.php
// - https://github.com/Vovan-VE/maze-go/blob/master/pkg/maze/generator.go

export const generate = (
  width: number,
  height: number,
  branchLength: number,
): Maze => {
  const maze = M.newMaze(width, height);
  const aFree = CS.newCellsSet();
  const aFrontier = CS.newCellsSet();

  M.forEachCell(maze, (cell) => CS.add(aFree, cell));

  const cStart = CS.getRandom(aFree);
  CS.remove(aFree, cStart);
  CS.add(aFrontier, cStart);

  while (!CS.isEmpty(aFree)) {
    let cCurrent = CS.getRandom(aFrontier);
    for (let length = branchLength; length-- > 0; ) {
      const [cNext, dNext] = findAdjacentFree(
        maze,
        aFree,
        cCurrent,
        direction.random(),
      );
      M.removeWalls(maze, cCurrent.x, cCurrent.y, dNext);
      CS.remove(aFree, cNext);
      if (CS.isEmpty(aFree)) {
        break;
      }
      updateFrontiers(maze, aFrontier, aFree, cNext);
      if (!cellHasFreeAdjacent(maze, aFree, cNext)) {
        break;
      }
      CS.add(aFrontier, cNext);
      cCurrent = cNext;
    }
  }

  return maze;
};

const findAdjacentFree = (
  maze: Maze,
  aFree: CellsSet,
  current: Cell,
  dStart: Direction,
): [cell: Cell, at: Direction] => {
  const { x, y } = current;
  for (let n = 4; n-- > 0; ) {
    const cNext = M.getAdjacentCell(maze, x, y, dStart);
    if (cNext && CS.has(aFree, cNext)) {
      return [cNext, dStart];
    }
    dStart = direction.next(dStart);
  }
  throw new Error("There are no free cells ever?");
};

const updateFrontiers = (
  maze: Maze,
  aFrontier: CellsSet,
  aFree: CellsSet,
  cell: Cell,
) => {
  const { x, y } = cell;
  for (let n = 4, d = Direction.TOP; n-- > 0; d = direction.next(d)) {
    const next = M.getAdjacentCell(maze, x, y, d);
    if (
      next &&
      CS.has(aFrontier, next) &&
      !cellHasFreeAdjacent(maze, aFree, next)
    ) {
      CS.remove(aFrontier, next);
    }
  }
};

const cellHasFreeAdjacent = (maze: Maze, aFree: CellsSet, cell: Cell) => {
  const { x, y } = cell;
  for (let n = 4, d = Direction.TOP; n-- > 0; d = direction.next(d)) {
    const next = M.getAdjacentCell(maze, x, y, d);
    if (next && CS.has(aFree, next)) {
      return true;
    }
  }
  return false;
};
