import {
  ISupaplexLevel,
  ISupaplexSpecPort,
  ISupaplexSpecPortProps,
} from "./types";
import { isSpecPort } from "./tiles";

export const LEVEL_BYTES_LENGTH = 1536;
const LEVEL_WIDTH = 60;
const LEVEL_HEIGHT = 24;

const GRAVITY_OFFSET = 1444;
const TITLE_OFFSET = GRAVITY_OFFSET + 2;
const TITLE_LENGTH = 23;
const FREEZE_ZONKS_OFFSET = TITLE_OFFSET + TITLE_LENGTH;
const INFOTRONS_NEED_OFFSET = FREEZE_ZONKS_OFFSET + 1;
const SPEC_PORT_COUNT_OFFSET = INFOTRONS_NEED_OFFSET + 1;
const SPEC_PORT_DB_OFFSET = SPEC_PORT_COUNT_OFFSET + 1;
const SPEC_PORT_ITEM_LENGTH = 6;
const SPEC_PORT_MAX_COUNT = 10;

const coordsToOffset = (x: number, y: number) => y * LEVEL_WIDTH + x;

const specPortRawZeros = () => new Uint8Array(SPEC_PORT_ITEM_LENGTH);
const specPortRawOffset = (index: number) =>
  SPEC_PORT_DB_OFFSET + index * SPEC_PORT_ITEM_LENGTH;

export const specPortOffsetToCoords = (
  b0: number,
  b1: number,
): [x: number, y: number] => {
  const offset = ((b0 << 8) | b1) >> 1;
  return [offset % LEVEL_WIDTH, Math.floor(offset / LEVEL_WIDTH)];
};

export const specPortCoordsToOffset = (
  x: number,
  y: number,
): [b0: number, b1: number] => {
  const offset = coordsToOffset(x, y) << 1;
  return [(offset >> 8) & 0xff, offset & 0xff];
};

const getSpecPortProps = (raw: Uint8Array): ISupaplexSpecPortProps => ({
  setsGravity: raw[2] === 1,
  setsFreezeZonks: raw[3] === 2,
  setsFreezeEnemies: raw[4] === 1,
});

const validateCoords =
  process.env.NODE_ENV === "production"
    ? undefined
    : (x: number, y: number) => {
        if (x < 0 || x >= LEVEL_WIDTH || y < 0 || y >= LEVEL_HEIGHT) {
          throw new RangeError(`Cell coords (${x}, ${y}) are out of range`);
        }
      };

const validateByte =
  process.env.NODE_ENV === "production"
    ? undefined
    : (byte: number) => {
        if (byte < 0 || byte > 255) {
          throw new RangeError(`Invalid byte ${byte}`);
        }
      };

export class SupaplexLevel implements ISupaplexLevel {
  static fromArrayBuffer(buffer: ArrayBufferLike, byteOffset?: number) {
    return new SupaplexLevel(
      new Uint8Array(buffer, byteOffset, LEVEL_BYTES_LENGTH),
    );
  }

  readonly #data: Uint8Array;

  constructor(data?: Uint8Array) {
    if (data) {
      if (
        process.env.NODE_ENV !== "production" &&
        data.length !== LEVEL_BYTES_LENGTH
      ) {
        throw new Error(
          `Invalid buffer length ${data.length}, expected ${LEVEL_BYTES_LENGTH}`,
        );
      }
      this.#data = new Uint8Array(data);
    } else {
      this.#data = new Uint8Array(LEVEL_BYTES_LENGTH);
      this.title = "";
    }
  }

  copy() {
    return new SupaplexLevel(this.#data);
  }

  get raw() {
    return new Uint8Array(this.#data);
  }

  get width() {
    return LEVEL_WIDTH;
  }

  get height() {
    return LEVEL_HEIGHT;
  }

  get isResizable() {
    return false;
  }

  getCell(x: number, y: number) {
    validateCoords?.(x, y);
    return this.#data[coordsToOffset(x, y)];
  }

  setCell(x: number, y: number, value: number) {
    validateCoords?.(x, y);
    validateByte?.(value);
    const offset = coordsToOffset(x, y);
    if (isSpecPort(value)) {
      if (!isSpecPort(this.#data[offset])) {
        this.setSpecPort(x, y);
      }
    } else {
      if (isSpecPort(this.#data[offset])) {
        this.deleteSpecPort(x, y);
      }
    }
    this.#data[offset] = value;
  }

  get initialGravity() {
    return this.#data[GRAVITY_OFFSET] === 1;
  }
  set initialGravity(on) {
    this.#data[GRAVITY_OFFSET] = on ? 1 : 0;
  }

  get title() {
    return String.fromCharCode(
      ...this.#data.slice(TITLE_OFFSET, TITLE_OFFSET + TITLE_LENGTH),
    );
  }
  set title(title) {
    if (process.env.NODE_ENV !== "production" && title.length > TITLE_LENGTH) {
      throw new RangeError("Title length exceeds limit");
    }
    if (/[^\x20-\x7F]/.test(title)) {
      throw new Error("Unsupported characters found");
    }

    this.#data.set(
      title
        .padEnd(TITLE_LENGTH)
        .split("")
        .map((ch) => {
          const byte = ch.charCodeAt(0);
          validateByte?.(byte);
          return byte;
        }),
      TITLE_OFFSET,
    );
  }

  get maxTitleLength() {
    return TITLE_LENGTH;
  }

  get initialFreezeZonks() {
    return this.#data[FREEZE_ZONKS_OFFSET] === 2;
  }
  set initialFreezeZonks(on) {
    this.#data[FREEZE_ZONKS_OFFSET] = on ? 2 : 0;
  }

  get infotronsNeed() {
    return this.#data[INFOTRONS_NEED_OFFSET] || "all";
  }
  set infotronsNeed(inf) {
    if (inf === "all") {
      this.#data[INFOTRONS_NEED_OFFSET] = 0;
    } else {
      validateByte?.(inf);
      if (process.env.NODE_ENV !== "production" && inf === 0) {
        throw new RangeError("Value cannot be 0 since it has special meaning");
      }
      this.#data[INFOTRONS_NEED_OFFSET] = inf;
    }
  }

  get specPortsCount() {
    return Math.min(SPEC_PORT_MAX_COUNT, this.#data[SPEC_PORT_COUNT_OFFSET]);
  }

  #setSpecPortsCount(count: number) {
    this.#data[SPEC_PORT_COUNT_OFFSET] = count;
  }

  *getSpecPorts(): Generator<ISupaplexSpecPort, void, void> {
    for (let i = 0, L = this.specPortsCount; i < L; i++) {
      const raw = this.#getSpecPortRaw(i);
      const [x, y] = specPortOffsetToCoords(raw[0], raw[1]);
      yield {
        x,
        y,
        ...getSpecPortProps(raw),
      };
    }
  }

  clearSpecPorts() {
    let count = this.specPortsCount;
    this.#setSpecPortsCount(0);
    while (count-- > 0) {
      this.#data.set(specPortRawZeros(), specPortRawOffset(count));
    }
  }

  #findSpecPortOffset(x: number, y: number): number | undefined {
    const [b0, b1] = specPortCoordsToOffset(x, y);
    const count = this.specPortsCount;
    for (let i = 0; i < count; i++) {
      const offset = specPortRawOffset(i);
      if (this.#data[offset] === b0 && this.#data[offset + 1] === b1) {
        return i;
      }
    }
  }

  #getSpecPortRaw(index: number) {
    const offset = specPortRawOffset(index);
    return this.#data.slice(offset, offset + SPEC_PORT_ITEM_LENGTH);
  }

  findSpecPort(x: number, y: number) {
    validateCoords?.(x, y);

    const index = this.#findSpecPortOffset(x, y);
    if (index !== undefined) {
      return getSpecPortProps(this.#getSpecPortRaw(index));
    }
  }

  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps) {
    validateCoords?.(x, y);

    let index = this.#findSpecPortOffset(x, y);
    let isNew = false;
    if (index === undefined) {
      index = this.specPortsCount;
      if (index >= SPEC_PORT_MAX_COUNT) {
        throw new RangeError("Cannot add more spec ports");
      }
      isNew = true;
    } else {
      if (!props) {
        return;
      }
    }

    const {
      setsGravity = false,
      setsFreezeZonks = false,
      setsFreezeEnemies = false,
    } = props || {};

    const [b0, b1] = specPortCoordsToOffset(x, y);
    const raw = Uint8Array.of(
      b0,
      b1,
      setsGravity ? 1 : 0,
      setsFreezeZonks ? 2 : 0,
      setsFreezeEnemies ? 1 : 0,
      0,
    );
    if (
      process.env.NODE_ENV === "production" &&
      raw.length !== SPEC_PORT_ITEM_LENGTH
    ) {
      throw new Error(
        `Invalid raw length ${raw.length}, expected ${SPEC_PORT_ITEM_LENGTH}`,
      );
    }
    this.#data.set(raw, specPortRawOffset(index));
    if (isNew) {
      this.#setSpecPortsCount(this.specPortsCount + 1);
    }
  }

  deleteSpecPort(x: number, y: number) {
    validateCoords?.(x, y);

    const index = this.#findSpecPortOffset(x, y);
    if (index !== undefined) {
      const count = this.specPortsCount;
      if (index < count - 1) {
        this.#data.set(
          this.#getSpecPortRaw(count - 1),
          specPortRawOffset(index),
        );
      }
      this.#data.set(specPortRawZeros(), specPortRawOffset(count - 1));
      this.#setSpecPortsCount(count - 1);
    }
  }
}
