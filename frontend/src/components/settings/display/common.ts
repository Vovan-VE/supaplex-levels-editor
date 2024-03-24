export type Fmt<T> = (x: number, y: number, b: string) => T;
export const fmtDefault: Fmt<string> = (x, y, b) => `[${x}; ${y}]${b}`;

export const BASE = ["₀", "₁"];

export interface Props {
  x: number;
  y: number;
  base?: 0 | 1;
}
export interface PropsCustom<T> extends Props {
  format: Fmt<T>;
}
