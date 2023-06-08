import { Direction } from "./types";

export const random = () => Math.floor(Math.random() * 4) as Direction;
export const next = (d: Direction) => ((d + 1) % 4) as Direction;
export const opposite = (d: Direction) => ((d + 2) % 4) as Direction;
export const adjacentCoords = (
  x: number,
  y: number,
  d: Direction,
): readonly [x: number, y: number] => {
  switch (d) {
    case Direction.TOP:
      y--;
      break;
    case Direction.RIGHT:
      x++;
      break;
    case Direction.BOTTOM:
      y++;
      break;
    case Direction.LEFT:
      x--;
      break;
  }
  return [x, y];
};
