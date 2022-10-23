import { useStore } from "effector-react";
import { FC } from "react";
import { TileCoords } from "components/settings/display";
import { $feedbackCell } from "models/levels/tools";
import { ContainerProps } from "ui/types";

export const HoveredCell: FC<ContainerProps> = (props) => {
  const feedback = useStore($feedbackCell);
  if (!feedback) {
    return null;
  }
  return (
    <span {...props}>
      <TileCoords {...feedback} />
    </span>
  );
};
