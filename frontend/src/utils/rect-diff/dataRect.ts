import { IBounds, inBounds } from "../rect";

export interface IDataRect extends IBounds {
  getTile(x: number, y: number): number;
}

export class DataRect implements IDataRect {
  readonly #width: number;
  readonly #height: number;
  readonly #data: Uint8Array;

  constructor(width: number, height: number, data?: Uint8Array) {
    const length = width * height;
    this.#width = width;
    this.#height = height;
    this.#data = new Uint8Array(length);
    if (data?.length) {
      this.#data.set(data.slice(0, length));
    }
  }

  copy() {
    return new DataRect(this.#width, this.#height, this.#data);
  }

  get length() {
    return this.#data.length;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  getTile(x: number, y: number): number {
    throwOutOfBounds?.(x, y, this);
    return this.#data[y * this.#width + x];
  }

  setTile(x: number, y: number, tile: number) {
    throwOutOfBounds?.(x, y, this);
    this.#data[y * this.#width + x] = tile;
  }
}

const throwOutOfBounds = import.meta.env.DEV
  ? (x: number, y: number, b: IBounds) => {
      if (!inBounds(x, y, b)) {
        throw new RangeError(
          `Out of bounds: [${x}, ${y}] @ ${b.width}x${b.height}`,
        );
      }
    }
  : undefined;
