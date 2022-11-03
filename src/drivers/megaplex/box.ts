import { inRect } from "utils/rect";
import { IBox } from "../supaplex/internal";

export class AnyBox implements IBox {
  readonly #width: number;
  readonly #height: number;

  readonly validateCoords =
    process.env.NODE_ENV === "production"
      ? undefined
      : (x: number, y: number) => {
          if (!inRect(x, y, [0, 0, this.#width, this.#height])) {
            throw new RangeError(`Cell coords (${x}, ${y}) are out of range`);
          }
        };

  constructor(width: number, height: number) {
    this.#width = width;
    this.#height = height;
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
