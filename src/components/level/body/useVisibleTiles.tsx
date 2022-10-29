import { useStoreMap } from "effector-react";
import { FC, ReactElement } from "react";
import { IBaseLevel, TileRenderProps } from "drivers";
import { $currentLevelUndoQueue } from "models/levelsets";
import { UndoQueue } from "utils/data";

type R = readonly [x: number, y: number, w: number, h: number];
type RR = readonly [...R, FC<TileRenderProps>];

const clipTilesRect = (
  q: UndoQueue<IBaseLevel> | null,
  [x0, y0, w, h, TileRender]: RR,
) => {
  if (!q) {
    return [];
  }
  const level = q.current;

  const nodes: ReactElement[] = [];
  for (let j = 0; j < h; j++) {
    const y = y0 + j;
    for (let i = 0; i < w; i++) {
      const x = x0 + i;
      nodes.push(
        <TileRender
          key={`${x}:${y}`}
          tile={level.getTile(x, y)}
          style={{ "--x": x, "--y": y } as {}}
        />,
      );
    }
  }
  return nodes;
};

export const useVisibleTiles = (rect: R, TileRender: FC<TileRenderProps>) =>
  useStoreMap({
    store: $currentLevelUndoQueue,
    keys: [...rect, TileRender],
    fn: clipTilesRect,
  });
