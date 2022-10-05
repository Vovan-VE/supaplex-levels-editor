import { FC } from "react";
import { TileRenderProps } from "../types";
import cl from "./tiles-svg/supaplex.module.scss";

export const Tile: FC<TileRenderProps> = ({ tile, style }) => (
  <i
    className={`${cl.t} ${tile !== undefined ? cl[`t${tile}`] ?? cl.u : cl.u}`}
    style={style}
  />
);
