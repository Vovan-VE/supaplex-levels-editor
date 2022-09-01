import { ILevelFooter } from "./internal";
import { ISupaplexSpecPort, ISupaplexSpecPortProps } from "./types";

export const FOOTER_BYTE_LENGTH = 96;

const GRAVITY_OFFSET = 4;
const TITLE_OFFSET = GRAVITY_OFFSET + 2;
export const TITLE_LENGTH = 23;
const FREEZE_ZONKS_OFFSET = TITLE_OFFSET + TITLE_LENGTH;
const INFOTRONS_NEED_OFFSET = FREEZE_ZONKS_OFFSET + 1;
const SPEC_PORT_COUNT_OFFSET = INFOTRONS_NEED_OFFSET + 1;
const SPEC_PORT_DB_OFFSET = SPEC_PORT_COUNT_OFFSET + 1;
const SPEC_PORT_ITEM_LENGTH = 6;
const SPEC_PORT_MAX_COUNT = 10;

const validateByte =
  process.env.NODE_ENV === "production"
    ? undefined
    : (byte: number) => {
        if (byte < 0 || byte > 255) {
          throw new RangeError(`Invalid byte ${byte}`);
        }
      };

const specPortRawOffset = (index: number) =>
  SPEC_PORT_DB_OFFSET + index * SPEC_PORT_ITEM_LENGTH;

const getSpecPortProps = (raw: Uint8Array): ISupaplexSpecPortProps => ({
  setsGravity: raw[2] === 1,
  setsFreezeZonks: raw[3] === 2,
  setsFreezeEnemies: raw[4] === 1,
});

export const specPortOffsetToCoords = (
  b0: number,
  b1: number,
  width: number,
): [x: number, y: number] => {
  const offset = ((b0 << 8) | b1) >> 1;
  return [offset % width, Math.floor(offset / width)];
};

export const specPortCoordsToOffset = (
  x: number,
  y: number,
  width: number,
): [b0: number, b1: number] => {
  const offset = (y * width + x) << 1;
  if (/*process.env.NODE_ENV !== "production" &&*/ offset > 0xffff) {
    throw new RangeError(
      `Spec port at coords (${x}, ${y}) with width ${width} cannot be saved`,
    );
  }
  return [(offset >> 8) & 0xff, offset & 0xff];
};

export class LevelFooter implements ILevelFooter {
  #width: number;
  #src: Uint8Array;

  constructor(width: number, data?: Uint8Array) {
    if (data) {
      if (
        process.env.NODE_ENV !== "production" &&
        data.length < FOOTER_BYTE_LENGTH
      ) {
        throw new Error(
          `Invalid buffer length ${data.length}, expected at least ${FOOTER_BYTE_LENGTH}`,
        );
      }
      data = new Uint8Array(data);
    } else {
      data = new Uint8Array(FOOTER_BYTE_LENGTH);
      data.set(
        ""
          .padEnd(TITLE_LENGTH)
          .split("")
          .map((ch) => ch.charCodeAt(0)),
        TITLE_OFFSET,
      );
    }
    this.#width = width;
    this.#src = data;
  }

  copy(): this {
    return new LevelFooter(this.#width, this.#src) as this;
  }

  get length() {
    return this.#src.length;
  }

  getRaw(width: number) {
    return new Uint8Array(this.#src);
  }

  get title() {
    return String.fromCharCode(
      ...this.#src.slice(TITLE_OFFSET, TITLE_OFFSET + TITLE_LENGTH),
    );
  }

  setTitle(title: string) {
    if (process.env.NODE_ENV !== "production" && title.length > TITLE_LENGTH) {
      throw new RangeError("Title length exceeds limit");
    }
    if (/[^\x20-\x7F]/.test(title)) {
      throw new Error("Unsupported characters found");
    }

    title = title.padEnd(TITLE_LENGTH);
    if (this.title === title) {
      return this;
    }

    const copy = this.copy();
    copy.#src.set(
      title.split("").map((ch) => ch.charCodeAt(0)),
      TITLE_OFFSET,
    );
    return copy;
  }

  get initialGravity() {
    return this.#src[GRAVITY_OFFSET] === 1;
  }
  setInitialGravity(on: boolean) {
    if (this.initialGravity === on) {
      return this;
    }
    const copy = this.copy();
    copy.#src[GRAVITY_OFFSET] = on ? 1 : 0;
    return copy;
  }

  get initialFreezeZonks() {
    return this.#src[FREEZE_ZONKS_OFFSET] === 2;
  }
  setInitialFreezeZonks(on: boolean) {
    if (this.initialFreezeZonks === on) {
      return this;
    }
    const copy = this.copy();
    copy.#src[FREEZE_ZONKS_OFFSET] = on ? 2 : 0;
    return copy;
  }

  get infotronsNeed() {
    return this.#src[INFOTRONS_NEED_OFFSET];
  }
  setInfotronsNeed(value: number) {
    validateByte?.(value);
    if (this.infotronsNeed === value) {
      return this;
    }
    const copy = this.copy();
    copy.#src[INFOTRONS_NEED_OFFSET] = value;
    return copy;
  }

  get specPortsCount() {
    return Math.min(this.#src[SPEC_PORT_COUNT_OFFSET], SPEC_PORT_MAX_COUNT);
  }

  *getSpecPorts(): Generator<ISupaplexSpecPort, void, void> {
    for (let i = 0, L = this.specPortsCount; i < L; i++) {
      const offset = specPortRawOffset(i);
      const raw = this.#src.slice(offset, offset + SPEC_PORT_ITEM_LENGTH);
      const [x, y] = specPortOffsetToCoords(raw[0], raw[1], this.#width);
      yield { x, y, ...getSpecPortProps(raw) };
    }
  }

  clearSpecPorts() {
    if (!this.specPortsCount) {
      return this;
    }
    const copy = this.copy();
    copy.#src[SPEC_PORT_COUNT_OFFSET] = 0;
    const zeroItem = new Uint8Array(SPEC_PORT_ITEM_LENGTH);
    for (let i = 0; i < SPEC_PORT_MAX_COUNT; i++) {
      copy.#src.set(zeroItem, specPortRawOffset(i));
    }
    return copy;
  }

  findSpecPort(x: number, y: number) {
    for (const port of this.getSpecPorts()) {
      if (port.x === x && port.y === y) {
        const { x: _1, y: _2, ...props } = port;
        return props;
      }
    }
  }

  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps) {
    const list = [...this.getSpecPorts()];
    let index = list.findIndex((p) => p.x === x && p.y === y);
    let newCount = this.specPortsCount;
    if (index >= 0) {
      if (!props) {
        return this;
      }
      const prev = list[index];
      if (
        props.setsGravity === prev.setsGravity &&
        props.setsFreezeZonks === prev.setsFreezeZonks &&
        props.setsFreezeEnemies === prev.setsFreezeEnemies
      ) {
        return this;
      }
    } else {
      index = this.specPortsCount;
      if (index >= SPEC_PORT_MAX_COUNT) {
        throw new RangeError("Cannot add more spec ports");
      }
      newCount++;
      props ??= {
        setsGravity: false,
        setsFreezeZonks: false,
        setsFreezeEnemies: false,
      };
    }

    const result = this.copy();
    const [b0, b1] = specPortCoordsToOffset(x, y, this.#width);
    result.#src.set(
      Uint8Array.of(
        b0,
        b1,
        props.setsGravity ? 1 : 0,
        props.setsFreezeZonks ? 2 : 0,
        props.setsFreezeEnemies ? 1 : 0,
      ),
      specPortRawOffset(index),
    );
    result.#src[SPEC_PORT_COUNT_OFFSET] = newCount;
    return result;
  }

  deleteSpecPort(x: number, y: number) {
    const list = [...this.getSpecPorts()];
    const index = list.findIndex((p) => p.x === x && p.y === y);
    if (index < 0) {
      return this;
    }
    const last = this.specPortsCount - 1;
    const copy = this.copy();
    for (let i = index; i < last; i++) {
      const from = specPortRawOffset(i + 1);
      copy.#src.set(
        this.#src.slice(from, from + SPEC_PORT_ITEM_LENGTH),
        specPortRawOffset(i),
      );
    }
    copy.#src.set(
      new Uint8Array(SPEC_PORT_ITEM_LENGTH),
      specPortRawOffset(last),
    );
    copy.#src[SPEC_PORT_COUNT_OFFSET] = this.specPortsCount - 1;
    return copy;
  }
}
