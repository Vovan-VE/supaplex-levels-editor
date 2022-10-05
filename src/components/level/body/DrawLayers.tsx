import { useStore } from "effector-react";
import { FC, memo } from "react";
import { $drvTiles } from "models/levels";
import { DrawLayer } from "models/levels/tools";
import { ContainerProps } from "ui/types";
import cn from "classnames";

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
      <div {...rest} key={i} className={cn(className, `layer-${layer.type}`)}>
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
    case "tiles": {
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

    case "custom": {
      const { Component } = layer;
      return <Component x={LX} y={LX} />;
    }

    default:
      return null;
  }
});
