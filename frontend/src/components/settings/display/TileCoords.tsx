import { useStore } from "effector-react";
import { FC } from "react";
import { $coordsDisplayBasis } from "models/settings";

export const enum CoordsFormat {
  // Vars = 0,
  Bracket = 1,
}

type Fmt = (x: number, y: number, b: string) => string;
const fmt: Record<CoordsFormat, Fmt> = {
  // [CoordsFormat.Vars]: (x, y, b) => `x${b}=${x}; y${b}=${y}`,
  [CoordsFormat.Bracket]: (x, y, b) => `[${x}; ${y}]${b}`,
};

const BASE = ["₀", "₁"];

interface Props {
  x: number;
  y: number;
  format?: CoordsFormat;
  base?: 0 | 1;
}

export const useTileCoordsDisplay = ({
  x,
  y,
  format = CoordsFormat.Bracket,
  base,
}: Props) => {
  const b = useStore($coordsDisplayBasis);
  base ??= b;
  return fmt[format](base + x, base + y, BASE[base]);
};

export const TileCoords: FC<Props> = (props) => (
  <>{useTileCoordsDisplay(props)}</>
);
