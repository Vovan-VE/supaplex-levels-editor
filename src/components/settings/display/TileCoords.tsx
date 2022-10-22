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

export const TileCoords: FC<Props> = ({ x, y, format, base }) => {
  const b = useStore($coordsDisplayBasis);
  base ??= b;
  return (
    <>{fmt[format ?? CoordsFormat.Bracket](base + x, base + y, BASE[base])}</>
  );
};
