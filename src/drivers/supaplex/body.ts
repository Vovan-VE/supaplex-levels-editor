import { IBox, ILevelBody } from "./internal";

const validateByte =
  process.env.NODE_ENV === "production"
    ? undefined
    : (byte: number) => {
        if (byte < 0 || byte > 255) {
          throw new RangeError(`Invalid byte ${byte}`);
        }
      };

export class LevelBody implements ILevelBody {
  readonly #box: IBox;
  readonly #raw: Uint8Array;

  constructor(box: IBox, data?: Uint8Array) {
    this.#box = box;
    if (data) {
      if (process.env.NODE_ENV !== "production" && data.length !== box.length) {
        throw new Error(
          `Invalid buffer length ${data.length}, expected ${box.length}`,
        );
      }
      this.#raw = new Uint8Array(data);
    } else {
      this.#raw = new Uint8Array(box.length);
    }
  }

  copy(): this {
    return new LevelBody(this.#box, this.#raw) as this;
  }

  get length() {
    return this.#box.length;
  }

  get raw() {
    return new Uint8Array(this.#raw);
  }

  getTile(x: number, y: number) {
    this.#box.validateCoords?.(x, y);
    return this.#raw[this.#box.coordsToOffset(x, y)];
  }

  setTile(x: number, y: number, value: number) {
    this.#box.validateCoords?.(x, y);
    validateByte?.(value);
    const offset = this.#box.coordsToOffset(x, y);
    if (this.#raw[offset] === value) {
      return this;
    }
    const copy = this.copy();
    copy.#raw[offset] = value;
    return copy;
  }
}
