import { SPEC_PORT_ITEM_LENGTH } from "./formats/std";
import {
  ISupaplexSpecPortRecord,
  SpecPortAlterMod,
  SpecPortFreezeEnemies,
  SpecPortFreezeZonks,
  SpecPortGravity,
} from "./internal";

const coordsToOffsetNumber = (x: number, y: number, width: number) =>
  (y * width + x) << 1;

const isOffsetNumberValid = (offset: number) => offset <= 0xffff;

const offsetNumberToRaw = (offset: number): [b0: number, b1: number] => [
  (offset >> 8) & 0xff,
  offset & 0xff,
];

export const specPortCoordsToOffset = (
  x: number,
  y: number,
  width: number,
): [b0: number, b1: number] => {
  const offset = coordsToOffsetNumber(x, y, width);
  if (!isOffsetNumberValid(offset)) {
    throw new RangeError(
      `Spec port at coords (${x}, ${y}) with width ${width} cannot be saved`,
    );
  }
  return offsetNumberToRaw(offset);
};

const specPortCoordsToOffsetTruncated = (
  x: number,
  y: number,
  width: number,
): [b0: number, b1: number] =>
  offsetNumberToRaw(coordsToOffsetNumber(x, y, width) & 0xffff);

export const specPortOffsetToCoords = (
  b0: number,
  b1: number,
  width: number,
): [x: number, y: number] => {
  const offset = ((b0 << 8) | b1) >> 1;
  return [offset % width, Math.floor(offset / width)];
};

// --------------------------------------

const actionNumberToByte = (b: number) => (b < 0 ? 0 : b & 0xff);

const correctUserNumber = (n: number): number =>
  n < -2 ? SpecPortAlterMod.NOTHING : n > 255 ? 255 : n;

// --------------------------------------

type SpecPortRecordProps = Record<"x" | "y" | "g" | "z" | "e" | "u", number>;
const zeroProps: Readonly<SpecPortRecordProps> = {
  x: 0,
  y: 0,
  g: 0,
  z: 0,
  e: 0,
  u: 0,
};

class SpecPortRecord implements ISupaplexSpecPortRecord {
  #x: number;
  #y: number;
  #gravity: number;
  #freezeZonks: number;
  #freezeEnemies: number;
  #unusedByte: number;

  constructor({ x, y, g, z, e, u }: Readonly<SpecPortRecordProps>) {
    this.#x = x;
    this.#y = y;
    this.#gravity = correctUserNumber(g);
    this.#freezeZonks = correctUserNumber(z);
    this.#freezeEnemies = correctUserNumber(e);
    this.#unusedByte = u & 0xff;
  }

  with({ x, y, g, z, e, u }: Partial<SpecPortRecordProps>): SpecPortRecord {
    return new SpecPortRecord({
      x: x ?? this.#x,
      y: y ?? this.#y,
      g: g ?? this.#gravity,
      z: z ?? this.#freezeZonks,
      e: e ?? this.#freezeEnemies,
      u: u ?? this.#unusedByte,
    });
  }

  isStdCompatible(width: number): boolean {
    return (
      isOffsetNumberValid(coordsToOffsetNumber(this.#x, this.#y, width)) &&
      this.#gravity >= 0 &&
      this.#freezeZonks >= 0 &&
      this.#freezeEnemies >= 0
    );
  }
  toRaw(width: number): Uint8Array {
    const [b0, b1] = specPortCoordsToOffsetTruncated(this.#x, this.#y, width);
    return Uint8Array.of(
      b0,
      b1,
      actionNumberToByte(this.#gravity),
      actionNumberToByte(this.#freezeZonks),
      actionNumberToByte(this.#freezeEnemies),
      this.#unusedByte,
    );
  }
  toString(): string {
    let s = `x${this.#x}y${this.#y}`;
    for (const [w, n] of [
      // ["x", this.#x],
      // ["y", this.#y],
      ["g", this.#gravity],
      ["z", this.#freezeZonks],
      ["e", this.#freezeEnemies],
      ["u", this.#unusedByte],
    ] as const) {
      if (n !== 0) {
        s += w + String(n);
      }
    }
    return s;
  }

  get x(): number {
    return this.#x;
  }
  setX(x: number) {
    if (this.#x === x) {
      return this;
    }
    return this.with({ x });
  }

  get y(): number {
    return this.#y;
  }
  setY(y: number) {
    if (this.#y === y) {
      return this;
    }
    return this.with({ y });
  }

  get gravity(): SpecPortGravity {
    return this.#gravity;
  }
  setGravity(g: SpecPortGravity) {
    g = correctUserNumber(g);
    if (this.#gravity === g) {
      return this;
    }
    return this.with({ g });
  }

  get freezeZonks(): SpecPortFreezeZonks {
    return this.#freezeZonks;
  }
  setFreezeZonks(z: SpecPortFreezeZonks) {
    z = correctUserNumber(z);
    if (this.#freezeZonks === z) {
      return this;
    }
    return this.with({ z });
  }

  get freezeEnemies(): SpecPortFreezeEnemies {
    return this.#freezeEnemies;
  }
  setFreezeEnemies(e: SpecPortFreezeEnemies) {
    e = correctUserNumber(e);
    if (this.#freezeEnemies === e) {
      return this;
    }
    return this.with({ e });
  }

  get unusedByte(): number {
    return this.#unusedByte;
  }
  setUnusedByte(u: number) {
    if (this.#unusedByte === u) {
      return this;
    }
    return this.with({ u });
  }
}

// --------------------------------------

export const newSpecPortRecord = (
  x: number,
  y: number,
): ISupaplexSpecPortRecord => new SpecPortRecord({ ...zeroProps, x, y });

export const newSpecPortRecordFromBytes = (
  raw: Uint8Array,
  width: number,
): ISupaplexSpecPortRecord => {
  if (raw.length !== SPEC_PORT_ITEM_LENGTH) {
    throw new Error("Invalid array length");
  }
  const [x, y] = specPortOffsetToCoords(raw[0], raw[1], width);
  return new SpecPortRecord({
    x,
    y,
    g: raw[2],
    z: raw[3],
    e: raw[4],
    u: raw[5],
  });
};

export const newSpecPortRecordFromString = (
  s: string,
): ISupaplexSpecPortRecord => {
  const p: SpecPortRecordProps = { ...zeroProps };
  for (const [, w, d] of s.matchAll(/([xygzeu])(-?\d+)/g)) {
    p[w as keyof SpecPortRecordProps] = Number(d);
  }
  return new SpecPortRecord(p);
};

export const isPortEqual = (
  a: ISupaplexSpecPortRecord,
  b: ISupaplexSpecPortRecord,
) => a.toString() === b.toString();
