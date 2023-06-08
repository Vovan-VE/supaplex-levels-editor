import { clipRect, Rect } from "utils/rect";
import { IsPlayableResult } from "../types";
import { AnyBox } from "./AnyBox";
import { ILevelBody, ISupaplexBox } from "./internal";
import { InlineTile } from "./InlineTile";
import { tiles } from "./tiles";
import { TILE_EXIT, TILE_MURPHY } from "./tiles-id";

const validateByte =
  process.env.NODE_ENV === "production"
    ? undefined
    : (byte: number) => {
        if (byte < 0 || byte > 255) {
          throw new RangeError(`Invalid byte ${byte}`);
        }
      };

export const createLevelBody = (
  box: ISupaplexBox,
  data?: Uint8Array,
): ILevelBody => {
  if (
    process.env.NODE_ENV !== "production" &&
    data &&
    data.length !== box.length
  ) {
    throw new Error(
      `Invalid buffer length ${data.length}, expected ${box.length}`,
    );
  }
  return new LevelBody(box, data);
};

class LevelBody implements ILevelBody {
  readonly #box: ISupaplexBox;
  readonly #raw: Uint8Array;

  constructor(box: ISupaplexBox, data?: Uint8Array) {
    this.#box = box;
    this.#raw = data ? new Uint8Array(data) : new Uint8Array(box.length);
  }

  #batchingLevel = 0;
  #isBatchCopy = false;
  copy() {
    if (this.#isBatchCopy) {
      return this;
    }
    const copy = new LevelBody(this.#box, this.#raw);
    if (this.#batchingLevel > 0) {
      copy.#isBatchCopy = true;
    }
    return copy;
  }

  batch(update: (b: this) => this) {
    this.#batchingLevel++;
    let result: this;
    try {
      result = update(this);
    } finally {
      this.#batchingLevel--;
    }
    if (!this.#batchingLevel) {
      result.#isBatchCopy = false;
    }
    return result;
  }

  get width() {
    return this.#box.width;
  }

  get height() {
    return this.#box.height;
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
      if (leftToRequire.delete(tile) && !leftToRequire.size) {
        return [true];
      }
    }
    return [
      false,
      [...leftToRequire].map((tile) => (
        <>
          There is no <InlineTile tile={tile} /> {tiles[tile].title} in the
          level.
        </>
      )),
    ];
  }

  *tilesRenderStream(x: number, y: number, width: number, height: number) {
    ({ x, y, width, height } = clipRect({ x, y, width, height }, this.#box));
    const xEnd = x + width;
    const yEnd = y + height;
    for (let j = y; j < yEnd; j++) {
      let lastItem: [x: number, y: number, width: number, tile: number] = [
        0, 0, 0, -1,
      ];
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
      if (lastItem[2] > 0) {
        yield lastItem;
      }
    }
  }

  copyRegion(r: Rect) {
    const { x, y, width, height } = clipRect(r, this.#box);
    if (
      x === 0 &&
      y === 0 &&
      width === this.#box.width &&
      height === this.#box.height
    ) {
      return [0, 0, this] as const;
    }
    const b = new AnyBox(width, height);
    const res = new LevelBody(b);
    const dest = res.#raw;
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        dest[b.coordsToOffset(i, j)] =
          this.#raw[this.#box.coordsToOffset(x + i, y + j)];
      }
    }
    return [x, y, res] as const;
  }

  findPlayer(): [x: number, y: number] | null {
    const i = this.#raw.indexOf(TILE_MURPHY);
    return i >= 0
      ? [i % this.#box.width, Math.floor(i / this.#box.width)]
      : null;
  }
}
