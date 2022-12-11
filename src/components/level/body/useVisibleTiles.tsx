import { useStoreMap } from "effector-react";
import { FC, ReactElement } from "react";
import { IBaseLevel, TileRenderProps } from "drivers";
import { $currentLevelUndoQueue } from "models/levelsets";
import { UndoQueue } from "utils/data";
import { Rect } from "utils/rect/types";

type RR = readonly [
  x: number,
  y: number,
  w: number,
  h: number,
  TileRender: FC<TileRenderProps>,
];

const clipTilesRect = (
  q: UndoQueue<IBaseLevel> | null,
  [x0, y0, w, h, TileRender]: RR,
) => {
  if (!q) {
    return [];
  }
  const level = q.current;

  const nodes: ReactElement[] = [];
  for (const [x, y, n, tile] of level.tilesRenderStream(x0, y0, w, h)) {
    nodes.push(
      <TileRender
        key={`${x}:${y}`}
        tile={tile}
        style={{ "--x": x, "--y": y, "--w": n } as {}}
      />,
    );
  }
  return nodes;
};

export const useVisibleTiles = (rect: Rect, TileRender: FC<TileRenderProps>) =>
  useStoreMap({
    store: $currentLevelUndoQueue,
    keys: [rect.x, rect.y, rect.width, rect.height, TileRender],
    fn: clipTilesRect,
  });
