export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface IBounds {
  readonly width: number;
  readonly height: number;
}

export interface Rect extends Point2D, IBounds {}
