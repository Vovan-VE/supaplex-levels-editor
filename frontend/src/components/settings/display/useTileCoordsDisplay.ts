import { useTileCoordsDisplayCustom } from "./useTileCoordsDisplayCustom";
import { fmtDefault, Props } from "./common";

export const useTileCoordsDisplay = (p: Props) =>
  useTileCoordsDisplayCustom({ ...p, format: fmtDefault });
