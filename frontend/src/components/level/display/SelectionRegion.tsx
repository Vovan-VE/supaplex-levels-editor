import cn from "classnames";
import { useUnit } from "effector-react";
import { FC } from "react";
import { TileCoords } from "components/settings/display";
import { $selectionFeedback } from "models/levels/tools/_selection";
import { IconContainer, svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import cl from "./SelectionRegion.module.scss";

export const SelectionRegion: FC<ContainerProps> = (props) => {
  const rect = useUnit($selectionFeedback);
  if (!rect) {
    return null;
  }

  const { x, y, width, height } = rect;
  return (
    <div {...props} className={cn(cl.root, props.className)}>
      <IconContainer className={cl.icon}>
        <svgs.Selection />
      </IconContainer>
      <span>
        <TileCoords x={x} y={y} />
      </span>
      <span>
        {width}x{height}
      </span>
    </div>
  );
};
