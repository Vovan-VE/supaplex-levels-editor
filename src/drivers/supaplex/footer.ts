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
  initialGravity: boolean;
  initialFreezeZonks: boolean;

  #title: string;
  #infotronsNeed: number;
  readonly #specPorts: ISupaplexSpecPort[] = [];
  readonly #src: Uint8Array;

  constructor(width: number, data?: Uint8Array) {
    const isNew = !data;
    if (data) {
      if (
        process.env.NODE_ENV !== "production" &&
        data.length < FOOTER_BYTE_LENGTH
      ) {
        throw new Error(
          `Invalid buffer length ${data.length}, expected at least ${FOOTER_BYTE_LENGTH}`,
        );
      }
    } else {
      data = new Uint8Array(FOOTER_BYTE_LENGTH);
    }
    this.#src = data;

    this.initialGravity = data[GRAVITY_OFFSET] === 1;
    this.initialFreezeZonks = data[FREEZE_ZONKS_OFFSET] === 2;
    this.#title = isNew
      ? "".padEnd(TITLE_LENGTH)
      : String.fromCharCode(
          ...data.slice(TITLE_OFFSET, TITLE_OFFSET + TITLE_LENGTH),
        );
    this.#infotronsNeed = data[INFOTRONS_NEED_OFFSET];

    for (
      let i = 0,
        L = Math.min(data[SPEC_PORT_COUNT_OFFSET], SPEC_PORT_MAX_COUNT);
      i < L;
      i++
    ) {
      const offset = specPortRawOffset(i);
      const raw = data.slice(offset, offset + SPEC_PORT_ITEM_LENGTH);
      const [x, y] = specPortOffsetToCoords(raw[0], raw[1], width);
      this.#specPorts.push({
        x,
        y,
        ...getSpecPortProps(raw),
      });
    }
  }

  get length() {
    return this.#src.length;
  }

  getRaw(width: number) {
    const ret = new Uint8Array(this.#src);
    ret[GRAVITY_OFFSET] = this.initialGravity ? 1 : 0;
    ret[FREEZE_ZONKS_OFFSET] = this.initialFreezeZonks ? 2 : 0;
    ret.set(
      this.#title.split("").map((ch) => {
        const byte = ch.charCodeAt(0);
        validateByte?.(byte);
        return byte;
      }),
      TITLE_OFFSET,
    );
    ret[INFOTRONS_NEED_OFFSET] = this.#infotronsNeed;

    ret[SPEC_PORT_COUNT_OFFSET] = this.#specPorts.length;
    ret.fill(
      0,
      SPEC_PORT_DB_OFFSET,
      SPEC_PORT_DB_OFFSET + SPEC_PORT_MAX_COUNT * SPEC_PORT_ITEM_LENGTH,
    );
    for (const [i, p] of this.#specPorts.entries()) {
      const [b0, b1] = specPortCoordsToOffset(p.x, p.y, width);
      ret.set(
        Uint8Array.of(
          b0,
          b1,
          p.setsGravity ? 1 : 0,
          p.setsFreezeZonks ? 2 : 0,
          p.setsFreezeEnemies ? 1 : 0,
        ),
        specPortRawOffset(i),
      );
    }
    return ret;
  }

  get title() {
    return this.#title;
  }
  set title(title) {
    if (process.env.NODE_ENV !== "production" && title.length > TITLE_LENGTH) {
      throw new RangeError("Title length exceeds limit");
    }
    if (/[^\x20-\x7F]/.test(title)) {
      throw new Error("Unsupported characters found");
    }

    this.#title = title.padEnd(TITLE_LENGTH);
  }

  get infotronsNeed() {
    return this.#infotronsNeed || "all";
  }
  set infotronsNeed(inf) {
    if (inf === "all") {
      this.#infotronsNeed = 0;
    } else {
      validateByte?.(inf);
      if (process.env.NODE_ENV !== "production" && inf === 0) {
        throw new RangeError("Value cannot be 0 since it has special meaning");
      }
      this.#infotronsNeed = inf;
    }
  }

  get specPortsCount() {
    return this.#specPorts.length;
  }

  *getSpecPorts(): Generator<ISupaplexSpecPort, void, void> {
    for (const port of this.#specPorts) {
      yield { ...port };
    }
  }

  clearSpecPorts() {
    this.#specPorts.splice(0);
  }

  findSpecPort(x: number, y: number) {
    const port = this.#specPorts.find((p) => p.x === x && p.y === y);
    if (!port) {
      return undefined;
    }
    const { x: _1, y: _2, ...props } = port;
    return props;
  }

  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps) {
    let index = this.#specPorts.findIndex((p) => p.x === x && p.y === y);
    if (index >= 0) {
      if (props) {
        this.#specPorts[index] = { x, y, ...props };
      }
    } else {
      if (this.#specPorts.length >= SPEC_PORT_MAX_COUNT) {
        throw new RangeError("Cannot add more spec ports");
      }
      this.#specPorts.push({
        x,
        y,
        ...(props ?? {
          setsGravity: false,
          setsFreezeZonks: false,
          setsFreezeEnemies: false,
        }),
      });
    }
  }

  deleteSpecPort(x: number, y: number) {
    const index = this.#specPorts.findIndex((p) => p.x === x && p.y === y);
    if (index >= 0) {
      this.#specPorts.splice(index, 1);
    }
  }
}
