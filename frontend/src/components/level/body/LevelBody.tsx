import { FC, useCallback, useEffect, useMemo } from "react";
import cn from "classnames";
import { useGate, useStoreMap, useUnit } from "effector-react";
import { getTilesVariantsMap } from "drivers";
import {
  $bodyScale,
  $drvTileRender,
  $drvTiles,
  addInteraction,
  BodyVisibleRectGate,
  setTile,
} from "models/levels";
import { $toolUI, rollbackWork } from "models/levels/tools";
import { $currentLevelSize, $currentLevelUndoQueue } from "models/levelsets";
import {
  GridContextEventHandler,
  GridPickTileEventHandler,
} from "ui/grid-events";
import { ContainerProps } from "ui/types";
import { CoverGrid } from "./CoverGrid";
import { DrawLayers } from "./DrawLayers";
import { DriverInteractions } from "./DriverInteractions";
import { PlayerLocator } from "./PlayerLocator";
import { useVisibleBodyRect } from "./useVisibleBodyRect";
import { useVisibleTiles } from "./useVisibleTiles";
import cl from "./LevelBody.module.scss";

interface Props extends ContainerProps {}

export const LevelBody: FC<Props> = ({ className, ...rest }) => {
  const TileRender = useUnit($drvTileRender)!;
  const { width, height } = useUnit($currentLevelSize)!;
  const bodyScale = useUnit($bodyScale);
  const { events, drawLayers, Dialogs } = useUnit($toolUI);
  useEffect(() => rollbackWork, []);

  const handleContextMenu = useContextMenuHandler(events?.onContextMenu);
  const handlePickTile = usePickTile();

  const { refRoot, refCanvas, rect } = useVisibleBodyRect(
    width,
    height,
    bodyScale,
  );
  useGate(BodyVisibleRectGate, { rect });
  const nodes = useVisibleTiles(rect, TileRender);

  return (
    <>
      <div
        {...rest}
        ref={refRoot}
        className={cn(cl.root, className)}
        style={
          {
            "--tiles-x": width,
            "--tiles-y": height,
            "--tile-size": `${bodyScale.toFixed(0)}px`,
          } as {}
        }
      >
        <div ref={refCanvas} className={cl.canvas}>
          <div className={cl.tiles}>{nodes}</div>
          <PlayerLocator />
          <DrawLayers
            drawLayers={drawLayers}
            visibleRect={rect}
            className={cl.drawLayer}
          />
          <CoverGrid
            cols={width}
            rows={height}
            className={cl.cover}
            {...events}
            onContextMenu={handleContextMenu}
            onPickTile={handlePickTile}
          />
        </div>
      </div>
      {Dialogs && <Dialogs />}
      <DriverInteractions />
    </>
  );
};

const useContextMenuHandler = (toolContextMenu?: GridContextEventHandler) => {
  const hasToolContextMenu = Boolean(toolContextMenu);
  const hasDrvContextMenu = useStoreMap($drvTiles, (tiles) =>
    tiles!.some(({ interaction }) => interaction?.onContextMenu),
  );
  const tiles = useUnit($drvTiles)!;
  const level = useUnit($currentLevelUndoQueue)!.current;
  const drvContextMenu = useMemo<GridContextEventHandler | undefined>(() => {
    if (!hasToolContextMenu && hasDrvContextMenu) {
      return (e) => {
        if (e.inBounds) {
          const tile = level.getTile(e.x, e.y);
          const action = tiles[tile]?.interaction?.onContextMenu?.(e, level);
          if (action) {
            addInteraction(action);
          }
        }
      };
    }
  }, [level, tiles, hasToolContextMenu, hasDrvContextMenu]);

  return toolContextMenu ?? drvContextMenu;
};

const usePickTile = () => {
  const tiles = useUnit($drvTiles)!;
  const tileVariants = useMemo(() => getTilesVariantsMap(tiles), [tiles]);
  const level = useUnit($currentLevelUndoQueue)!.current;

  return useCallback<GridPickTileEventHandler>(
    ({ x, y }) => {
      let tile = level.getTile(x, y);
      tile = tileVariants.get(tile) ?? tile;
      setTile(tiles.findIndex(({ value }) => value === tile));
    },
    [level, tileVariants, tiles],
  );
};
