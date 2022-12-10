import { FC } from "react";
import { TileRenderProps } from "../types";
import cl from "./tiles-svg/supaplex.module.scss";

export const SpChipClassic = cl.chip0;
export const SpChipWinplex = cl.chip1;

export const Tile: FC<TileRenderProps> = ({ tile, className, style }) => (
  <i
    className={`${cl.t} ${tile !== undefined ? cl[`t${tile}`] ?? cl.u : cl.u}${
      className ? ` ${className}` : ""
    }`}
    style={style}
  />
);
