import { FC } from "react";
import { IconContainer } from "ui/icon";
import { Tile } from "./Tile";
import cl from "./InlineTile.module.scss";

interface Props {
  tile: number;
  tileClassName?: string;
}

export const InlineTile: FC<Props> = ({ tile, tileClassName }) => (
  <IconContainer className={cl.root}>
    <Tile tile={tile} className={tileClassName} />
  </IconContainer>
);
