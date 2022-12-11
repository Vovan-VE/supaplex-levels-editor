import { inRect, Rect } from "utils/rect";
import { ISupaplexBox } from "./internal";

export class AnyBox implements ISupaplexBox, Rect {
  readonly #width: number;
  readonly #height: number;

  readonly validateCoords =
    process.env.NODE_ENV === "production"
      ? undefined
      : (x: number, y: number) => {
          if (!inRect(x, y, this)) {
            throw new RangeError(`Cell coords (${x}, ${y}) are out of range`);
          }
        };

  constructor(width: number, height: number) {
    this.#width = width;
    this.#height = height;
  }

  get x() {
    return 0;
  }
  get y() {
    return 0;
  }

  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }

  get length() {
    return this.#width * this.#height;
  }

  coordsToOffset(x: number, y: number) {
    return y * this.#width + x;
  }
}
