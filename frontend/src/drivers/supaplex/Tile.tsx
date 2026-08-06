import cn from "classnames";
import { FC } from "react";
import { TileRenderProps } from "../types";
import cl from "./tiles-svg/supaplex.module.scss";

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
