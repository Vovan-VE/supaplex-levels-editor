import { useUnit } from "effector-react";
import { $coordsDisplayBasis } from "models/settings";
import { BASE, PropsCustom } from "./common";

export const useTileCoordsDisplayCustom = <T>({
  x,
  y,
  base,
  format,
}: PropsCustom<T>) => {
  const b = useUnit($coordsDisplayBasis);
  base ??= b;
  return format(base + x, base + y, BASE[base]);
};
