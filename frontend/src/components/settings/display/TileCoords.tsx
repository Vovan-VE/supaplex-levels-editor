import { FC, ReactNode } from "react";
import { Fmt, fmtDefault, Props, PropsCustom } from "./common";
import { useTileCoordsDisplayCustom } from "./useTileCoordsDisplayCustom";

interface PropsOpt extends Props {
  format?: Fmt<ReactNode>;
}
const isStrictProps = (p: PropsOpt): p is PropsCustom<ReactNode> =>
  p.format !== undefined;

export const TileCoords: FC<PropsOpt> = (props) => (
  <>
    {useTileCoordsDisplayCustom(
      isStrictProps(props) ? props : { ...props, format: fmtDefault },
    )}
  </>
);
