import { FC } from "react";
import { IconContainer } from "ui/icon";
import { Tile } from "./Tile";
import cl from "./InlineTile.module.scss";

interface Props {
  tile: number;
}

export const InlineTile: FC<Props> = ({ tile }) => {
  return (
    <IconContainer className={cl.root}>
      <Tile tile={tile} />
    </IconContainer>
  );
};
