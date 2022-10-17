import { IsPlayableResult } from "../types";
import { IBox, ILevelBody } from "./internal";
import { TILE_EXIT, TILE_MURPHY } from "./tiles-id";

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

  isPlayable(): IsPlayableResult {
    const leftToRequire = new Set([TILE_MURPHY, TILE_EXIT]);
    for (const tile of this.#raw) {
      if (!leftToRequire.size) {
        break;
      }
      if (leftToRequire.has(tile)) {
        leftToRequire.delete(tile);
      }
    }
    const errors = [
      // TODO: show SVG tiles
      leftToRequire.has(TILE_MURPHY) && "There is no Murphy in the level.",
      leftToRequire.has(TILE_EXIT) && "There is no Exit in the level.",
    ].filter(Boolean);
    return errors.length ? [false, errors] : [true];
  }
}
