import cn from "classnames";
import { useStore } from "effector-react";
import { FC, memo } from "react";
import { $drvTileRender } from "models/levels";
import {
  $feedbackCell,
  $toolIndex,
  $toolVariant,
  DrawLayer,
  DrawLayerType,
  TOOLS,
} from "models/levels/tools";
import { $currentLevelSize } from "models/levelsets";
import { ContainerProps } from "ui/types";
import { inRect } from "utils/rect";
import cl from "./DrawLayers.module.scss";

const TYPE_CLASSES: Partial<Record<DrawLayerType, string>> = {
  [DrawLayerType.TILES]: cl.typeTiles,
  [DrawLayerType.TILE_FILL]: cl.typeTileFill,
  [DrawLayerType.SELECT_RANGE]: cl.typeSelectRange,
};

interface ListProps extends ContainerProps {
  drawLayers?: readonly DrawLayer[];
  // TODO: visibleRect: RectA;
}

export const DrawLayers: FC<ListProps> = ({
  drawLayers,
  className,
  ...rest
}) => (
  <>
    {drawLayers?.map((layer, i) => (
      <div
        {...rest}
        key={i}
        className={cn(className, TYPE_CLASSES[layer.type])}
      >
        <DrawLayerItem layer={layer} />
      </div>
    ))}
    <FeedbackLayer {...rest} className={className} />
  </>
);

interface LayerProps {
  layer: DrawLayer;
  // TODO: visibleRect: RectA;
}
const DrawLayerItem = memo<LayerProps>(({ layer }) => {
  const TileRender = useStore($drvTileRender)!;
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

    case DrawLayerType.TILE_FILL: {
      const { tile, width, height } = layer;
      return (
        <TileRender
          tile={tile}
          style={
            {
              "--x": LX,
              "--y": LY,
              "--w": width,
              "--h": height,
            } as {}
          }
        />
      );
    }

    case DrawLayerType.SELECT_RANGE: {
      const { width, height, borders: b } = layer;

      return (
        <span
          className={cn(
            b.has("T") && cl._bt,
            b.has("R") && cl._br,
            b.has("B") && cl._bb,
            b.has("L") && cl._bl,
          )}
          style={
            {
              "--x": LX,
              "--y": LY,
              "--w": width,
              "--h": height,
            } as {}
          }
        />
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

const FeedbackLayer: FC<ContainerProps> = ({ className, ...rest }) => {
  const feedback = useStore($feedbackCell);
  const { width, height } = useStore($currentLevelSize)!;
  const tool = useStore($toolIndex);
  const toolVariant = useStore($toolVariant);
  const { internalName, variants } = TOOLS[tool];
  const variantName = variants[toolVariant].internalName;
  const clTool = `tool-${internalName}`;
  return (
    <div
      {...rest}
      className={cn(
        className,
        cl.typeFeedback,
        clTool,
        `${clTool}-${variantName}`,
      )}
    >
      {feedback && inRect(feedback.x, feedback.y, [0, 0, width, height]) && (
        <div
          className={cl.cell}
          style={
            {
              "--x": feedback.x,
              "--y": feedback.y,
            } as {}
          }
        />
      )}
    </div>
  );
};
