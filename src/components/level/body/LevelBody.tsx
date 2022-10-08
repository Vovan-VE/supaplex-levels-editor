import { FC, memo, useEffect } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { TileRenderProps } from "drivers";
import { $bodyScale, $drvTiles, $levelTiles } from "models/levels";
import { $toolUI, rollbackWork } from "models/levels/tools";
import { ContainerProps } from "ui/types";
import cl from "./LevelBody.module.scss";
import { CoverGrid } from "./CoverGrid";
import { DrawLayers } from "./DrawLayers";

interface Props extends ContainerProps {}

export const LevelBody: FC<Props> = ({ className, ...rest }) => {
  const TileRender = useStore($drvTiles)!;
  const { width, height, chunks } = useStore($levelTiles)!;
  const bodyScale = useStore($bodyScale);
  const { events, drawLayers, Dialogs } = useStore($toolUI);
  useEffect(() => rollbackWork, []);

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
            {chunks.map((chunk, i) => (
              <Chunk key={i} values={chunk} TileRender={TileRender} />
            ))}
          </div>
          <DrawLayers drawLayers={drawLayers} className={cl.drawLayer} />
          <CoverGrid
            cols={width}
            rows={height}
            className={cl.cover}
            {...events}
          />
        </div>
      </div>
      {Dialogs && <Dialogs />}
    </>
  );
};

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
