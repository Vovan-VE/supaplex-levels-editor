import { Point2D } from "./types";

export const lineInterpolation = (
  a: Point2D,
  b: Point2D,
): readonly Point2D[] => {
  const points: Point2D[] = [];
  const { x: ax, y: ay } = a;
  const { x: bx, y: by } = b;

  // straight vertical
  if (ax === bx) {
    const [from, to] = ay < by ? [ay, by] : [by, ay];
    for (let i = from; i <= to; i++) {
      points.push({ x: ax, y: i });
    }
    return points;
  }
  // straight horizontal
  if (ay === by) {
    const [from, to] = ax < bx ? [ax, bx] : [bx, ax];
    for (let i = from; i <= to; i++) {
      points.push({ x: i, y: ay });
    }
    return points;
  }

  // diagonal
  const dx = ax < bx ? 1 : -1;
  const dy = ay < by ? 1 : -1;

  const w = Math.abs(ax - bx);
  const h = Math.abs(ay - by);
  // 45 deg
  if (w === h) {
    for (let i = w, x = ax, y = ay; i-- >= 0; x += dx, y += dy) {
      points.push({ x, y });
    }
    return points;
  }

  if (w > h) {
    feedDiagonal(w, h, (l, o) =>
      points.push({ x: ax + l * dx, y: ay + o * dy }),
    );
  } else {
    feedDiagonal(h, w, (l, o) =>
      points.push({ x: ax + o * dx, y: ay + l * dy }),
    );
  }
  return points;
};

const feedDiagonal = (
  length: number,
  offset: number,
  p: (l: number, o: number) => void,
) => {
  const L = length + 1;
  const O = offset + 1;
  for (let i = 0; i < L; i++) {
    p(i, Math.floor(((i + 0.5) / L) * O));
  }
};
