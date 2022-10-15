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
    <FeedbackLayer {...rest} className={className} />
  </>
);

interface LayerProps {
  layer: DrawLayer;
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
      {feedback &&
        feedback.x >= 0 &&
        feedback.y >= 0 &&
        feedback.x < width &&
        feedback.y < height && (
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
