import { FC, memo } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { TileRenderProps } from "drivers";
import { $drvTiles, $levelTiles } from "models/levels";
import { ContainerProps } from "ui/types";
import cl from "./LevelBody.module.scss";

interface Props extends ContainerProps {}

export const LevelBody: FC<Props> = ({ className, ...rest }) => {
  const TileRender = useStore($drvTiles)!;
  const { width, height, chunks } = useStore($levelTiles)!;

  return (
    <div
      {...rest}
      className={cn(cl.root, className)}
      style={{ "--tiles-x": width, "--tiles-y": height } as any}
    >
      <div className={cl.canvas}>
        <div className={cl.tiles}>
          {
            // nodes
            chunks.map((chunk, i) => (
              <Chunk key={i} values={chunk} TileRender={TileRender} />
            ))
          }
        </div>
        <div className={cl.cover} />
      </div>
    </div>
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
