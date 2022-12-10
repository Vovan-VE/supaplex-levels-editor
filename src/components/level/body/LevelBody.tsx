import { FC, useEffect, useMemo } from "react";
import cn from "classnames";
import { useGate, useStore, useStoreMap } from "effector-react";
import {
  $bodyScale,
  $drvTileRender,
  $drvTiles,
  addInteraction,
  BodyVisibleRectGate,
} from "models/levels";
import {
  $toolUI,
  GridContextEventHandler,
  rollbackWork,
} from "models/levels/tools";
import { $currentLevelSize, $currentLevelUndoQueue } from "models/levelsets";
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
  const TileRender = useStore($drvTileRender)!;
  const { width, height } = useStore($currentLevelSize)!;
  const bodyScale = useStore($bodyScale);
  const { events, drawLayers, Dialogs } = useStore($toolUI);
  useEffect(() => rollbackWork, []);

  const handleContextMenu = useContextMenuHandler(events?.onContextMenu);

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
          } as any
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
