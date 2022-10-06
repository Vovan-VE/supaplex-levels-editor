import cn from "classnames";
import { useStore } from "effector-react";
import { FC, memo } from "react";
import { $drvTiles } from "models/levels";
import { DrawLayer, DrawLayerType } from "models/levels/tools";
import { ContainerProps } from "ui/types";
import cl from "./DrawLayers.module.scss";

const TYPE_CLASSES: Partial<Record<DrawLayerType, string>> = {
  [DrawLayerType.TILES]: cl.typeTiles,
};

interface ListProps extends ContainerProps {
  drawLayers: readonly DrawLayer[];
}

export const DrawLayers: FC<ListProps> = ({
  drawLayers,
  className,
  ...rest
}) => (
  <>
    {drawLayers.map((layer, i) => (
      <div
        {...rest}
        key={i}
        className={cn(className, TYPE_CLASSES[layer.type])}
      >
        <DrawLayerItem layer={layer} />
      </div>
    ))}
  </>
);

interface LayerProps {
  layer: DrawLayer;
}
const DrawLayerItem = memo<LayerProps>(({ layer }) => {
  const TileRender = useStore($drvTiles)!;
  const { x: LX, y: LY } = layer;

  switch (layer.type) {
    case DrawLayerType.TILES: {
      const { tiles } = layer;
      return (
        <>
          {[...tiles.values()].map(({ x, y, tile }) => (
            <TileRender
              key={`${x}:${y}`}
              tile={tile}
              style={
                {
                  "--x": LX + x,
                  "--y": LY + y,
                } as {}
              }
            />
          ))}
        </>
      );
    }

    case DrawLayerType.CUSTOM: {
      const { Component } = layer;
      return <Component x={LX} y={LX} />;
    }

    default:
      return null;
  }
});
