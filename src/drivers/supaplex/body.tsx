import { IsPlayableResult, ITilesStreamItem } from "../types";
import { IBox, ILevelBody } from "./internal";
import { TILE_EXIT, TILE_MURPHY } from "./tiles-id";
import { InlineTile } from "./InlineTile";

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
      leftToRequire.has(TILE_MURPHY) && (
        <>
          There is no <InlineTile tile={TILE_MURPHY} /> Murphy in the level.
        </>
      ),
      leftToRequire.has(TILE_EXIT) && (
        <>
          There is no <InlineTile tile={TILE_EXIT} /> Exit in the level.
        </>
      ),
    ].filter(Boolean);
    return errors.length ? [false, errors] : [true];
  }

  *tilesRenderStream(
    x: number,
    y: number,
    w: number,
    h: number,
    width: number,
    height: number,
  ): Iterable<ITilesStreamItem> {
    if (x >= width || y >= height || x + w <= 0 || y + h <= 0) {
      return;
    }
    const xEnd = Math.min(width, x + w);
    const yEnd = Math.min(height, y + h);
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    for (let j = y; j < yEnd; j++) {
      let lastItem: [x: number, y: number, width: number, tile: number] | null =
        [0, 0, 0, -1];
      for (let i = x; i < xEnd; i++) {
        const tile = this.#raw[this.#box.coordsToOffset(i, j)];
        if (tile === lastItem[3]) {
          lastItem[2]++;
        } else {
          if (lastItem[2]) {
            yield lastItem;
          }
          lastItem = [i, j, 1, tile];
        }
      }
      yield lastItem;
    }
  }
}
