import { FC } from "react";
import { IconContainer } from "ui/icon";
import { Tile } from "./Tile";
import cl from "./InlineTile.module.scss";

interface Props {
  tile: number;
  variant?: number;
  tileClassName?: string;
}

export const InlineTile: FC<Props> = ({ tile, variant, tileClassName }) => (
  <IconContainer className={cl.root}>
    <Tile tile={tile} variant={variant} className={tileClassName} />
  </IconContainer>
);
