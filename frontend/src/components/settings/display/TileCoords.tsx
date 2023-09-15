import { useStore } from "effector-react";
import { FC, ReactNode } from "react";
import { $coordsDisplayBasis } from "models/settings";

type Fmt<T> = (x: number, y: number, b: string) => T;
const fmtDefault: Fmt<string> = (x, y, b) => `[${x}; ${y}]${b}`;

const BASE = ["₀", "₁"];

interface Props {
  x: number;
  y: number;
  base?: 0 | 1;
}
interface PropsCustom<T> extends Props {
  format: Fmt<T>;
}

const useTileCoordsDisplayCustom = <T,>({
  x,
  y,
  base,
  format,
}: PropsCustom<T>) => {
  const b = useStore($coordsDisplayBasis);
  base ??= b;
  return format(base + x, base + y, BASE[base]);
};

export const useTileCoordsDisplay = (p: Props) =>
  useTileCoordsDisplayCustom({ ...p, format: fmtDefault });

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
