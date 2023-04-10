import cn from "classnames";
import { FC } from "react";
import { TileRenderProps } from "../types";
import cl from "./tiles-svg/supaplex.module.scss";

export const SpChipClassic = cl.chip0;
export const SpChipWinplex = cl.chip1;

export const Tile: FC<TileRenderProps> = ({
  tile,
  variant,
  className,
  style,
}) => (
  <i
    className={cn(
      cl.t,
      cl[`t${tile}`] ?? cl.u,
      variant !== undefined && cl[`v${variant}`],
      className,
    )}
    style={style}
  />
);
