import cn from "classnames";
import { useUnit } from "effector-react";
import { FC, memo, ReactElement } from "react";
import { $drvTileRender } from "models/levels";
import {
  $feedbackCell,
  $toolIndex,
  $toolVariant,
  DrawLayer,
  DrawLayerProps,
  DrawLayerType,
  TOOLS,
} from "models/levels/tools";
import { $currentLevelSize } from "models/levelsets";
import { ContainerProps } from "ui/types";
import { inBounds, inRect, Rect } from "utils/rect";
import cl from "./DrawLayers.module.scss";

const TYPE_CLASSES: Partial<Record<DrawLayerType, string>> = {
  [DrawLayerType.TILES]: cl.typeTiles,
  [DrawLayerType.TILE_FILL]: cl.typeTileFill,
  [DrawLayerType.SELECT_RANGE]: cl.typeSelectRange,
  [DrawLayerType.TILES_REGION]: cl.typeTilesRegion,
};

interface ListProps extends ContainerProps {
  drawLayers?: readonly DrawLayer[];
  visibleRect: Rect;
}

export const DrawLayers: FC<ListProps> = ({
  drawLayers,
  visibleRect,
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
        <DrawLayerItem layer={layer} visibleRect={visibleRect} />
      </div>
    ))}
    <FeedbackLayer {...rest} className={className} />
  </>
);

interface LayerProps {
  layer: DrawLayer;
  visibleRect: Rect;
}
const DrawLayerItem: FC<LayerProps> = ({ layer, visibleRect }) => {
  const { x: LX, y: LY } = layer;

  switch (layer.type) {
    case DrawLayerType.TILES:
      return <DrawLayerTiles {...layer} visibleRect={visibleRect} />;

    case DrawLayerType.TILE_FILL:
      return <DrawLayerTileFill {...layer} />;

    case DrawLayerType.SELECT_RANGE:
      return <DrawLayerSelectRange {...layer} />;

    case DrawLayerType.TILES_REGION:
      return <DrawLayerTilesRegion {...layer} visibleRect={visibleRect} />;

    case DrawLayerType.CUSTOM: {
      const { Component } = layer;
      return <Component x={LX} y={LY} />;
    }

    default:
      return null;
  }
};

type VR = { visibleRect: Rect };

const DrawLayerTiles: FC<DrawLayerProps<DrawLayerType.TILES> & VR> = ({
  x: LX,
  y: LY,
  tiles,
  visibleRect,
}) => {
  const TileRender = useUnit($drvTileRender)!;
  return (
    <>
      {[...tiles.values()].reduce<ReactElement[]>((nodes, { x, y, tile }) => {
        if (inRect(x, y, visibleRect)) {
          nodes.push(
            <TileRender
              key={`${x}:${y}`}
              tile={tile}
              style={
                {
                  "--x": LX + x,
                  "--y": LY + y,
                } as {}
              }
            />,
          );
        }
        return nodes;
      }, [])}
    </>
  );
};

const DrawLayerTilesRegion: FC<
  DrawLayerProps<DrawLayerType.TILES_REGION> & VR
> = ({ x: LX, y: LY, tiles, visibleRect }) => {
  const TileRender = useUnit($drvTileRender)!;
  // -----------------------------------> canvas
  //     ----------------------           layer region
  //        ----------------              visible
  // c   l  v
  // ----|---------> x'
  //     0
  // => -lx + vx
  const nodes: ReactElement[] = [];
  for (const [x, y, n, tile, variant] of tiles.tilesRenderStream(
    visibleRect.x - LX,
    visibleRect.y - LY,
    visibleRect.width,
    visibleRect.height,
  )) {
    nodes.push(
      <TileRender
        key={`${x}:${y}`}
        tile={tile}
        variant={variant}
        style={
          {
            "--x": x + LX,
            "--y": y + LY,
            "--w": n,
          } as {}
        }
      />,
    );
  }

  return <>{nodes}</>;
};

const DrawLayerTileFill = memo<DrawLayerProps<DrawLayerType.TILE_FILL>>(
  ({ x, y, width, height, tile }) => {
    const TileRender = useUnit($drvTileRender)!;
    return (
      <TileRender
        tile={tile}
        style={
          {
            "--x": x,
            "--y": y,
            "--w": width,
            "--h": height,
          } as {}
        }
      />
    );
  },
);

const DrawLayerSelectRange = memo<DrawLayerProps<DrawLayerType.SELECT_RANGE>>(
  ({ x, y, width, height, borders }) => (
    <span
      className={cn(
        borders.has("T") && cl._bt,
        borders.has("R") && cl._br,
        borders.has("B") && cl._bb,
        borders.has("L") && cl._bl,
      )}
      style={
        {
          "--x": x,
          "--y": y,
          "--w": width,
          "--h": height,
        } as {}
      }
    />
  ),
);

const FeedbackLayer: FC<ContainerProps> = ({ className, ...rest }) => {
  const feedback = useUnit($feedbackCell);
  const size = useUnit($currentLevelSize)!;
  const tool = useUnit($toolIndex);
  const toolVariant = useUnit($toolVariant);
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
      {feedback && inBounds(feedback.x, feedback.y, size) && (
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
