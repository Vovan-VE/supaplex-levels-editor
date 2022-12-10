export type RectA = readonly [x: number, y: number, w: number, h: number];
export type RectO = { x: number; y: number; w: number; h: number };
export interface IBounds {
  readonly width: number;
  readonly height: number;
}