import { FC, memo, useEffect, useMemo } from "react";
import cn from "classnames";
import { useStore, useStoreMap } from "effector-react";
import { TileRenderProps } from "drivers";
import {
  $bodyScale,
  $drvTileRender,
  $drvTiles,
  $levelTiles,
  addInteraction,
} from "models/levels";
import {
  $toolUI,
  GridContextEventHandler,
  rollbackWork,
} from "models/levels/tools";
import { $currentLevelUndoQueue } from "models/levelsets";
import { ContainerProps } from "ui/types";
import { CoverGrid } from "./CoverGrid";
import { DrawLayers } from "./DrawLayers";
import { DriverInteractions } from "./DriverInteractions";
import cl from "./LevelBody.module.scss";

interface Props extends ContainerProps {}

export const LevelBody: FC<Props> = ({ className, ...rest }) => {
  const TileRender = useStore($drvTileRender)!;
  const { width, height, chunks } = useStore($levelTiles)!;
  const bodyScale = useStore($bodyScale);
  const { events, drawLayers, Dialogs } = useStore($toolUI);
  useEffect(() => rollbackWork, []);

  const handleContextMenu = useContextMenuHandler(events?.onContextMenu);

  return (
    <>
      <div
        {...rest}
        className={cn(cl.root, className)}
        style={
          {
            "--tiles-x": width,
            "--tiles-y": height,
            "--tile-size": `${bodyScale.toFixed(0)}px`,
          } as any
        }
      >
        <div className={cl.canvas}>
          <div className={cl.tiles}>
            <Chunks chunks={chunks} TileRender={TileRender} />
          </div>
          <DrawLayers drawLayers={drawLayers} className={cl.drawLayer} />
          <CoverGrid
            cols={width}
            rows={height}
            className={cl.cover}
            {...events}
            onContextMenu={handleContextMenu}
          />
        </div>
      </div>
      {Dialogs && <Dialogs />}
      <DriverInteractions />
    </>
  );
};

interface ChunksProps {
  chunks: number[][];
  TileRender: FC<TileRenderProps>;
}
const Chunks = memo<ChunksProps>(({ chunks, TileRender }) => (
  <>
    {chunks.map((chunk, i) => (
      <Chunk key={i} values={chunk} TileRender={TileRender} />
    ))}
  </>
));

interface ChunkProps {
  values: number[];
  TileRender: FC<TileRenderProps>;
}
const Chunk = memo<ChunkProps>(({ values, TileRender }) => (
  <>
    {values.map((value, i) => (
      <TileRender key={i} tile={value} />
    ))}
  </>
));

const useContextMenuHandler = (toolContextMenu?: GridContextEventHandler) => {
  const hasToolContextMenu = Boolean(toolContextMenu);
  const hasDrvContextMenu = useStoreMap($drvTiles, (tiles) =>
    tiles!.some(({ interaction }) => interaction?.onContextMenu),
  );
  const tiles = useStore($drvTiles)!;
  const level = useStore($currentLevelUndoQueue)!.current;
  const drvContextMenu = useMemo<GridContextEventHandler | undefined>(() => {
    if (!hasToolContextMenu && hasDrvContextMenu) {
      return (e) => {
        if (e.inBounds) {
          const tile = level.getTile(e.x, e.y);
          const { interaction } = tiles[tile];
          const action = interaction?.onContextMenu?.(e, level);
          if (action) {
            addInteraction(action);
          }
        }
      };
    }
  }, [level, tiles, hasToolContextMenu, hasDrvContextMenu]);

  return toolContextMenu ?? drvContextMenu;
};
