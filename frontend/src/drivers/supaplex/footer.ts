import { DemoSeed } from "../types";
import {
  FOOTER_BYTE_LENGTH,
  SIGNATURE_MAX_LENGTH,
  TITLE_LENGTH,
} from "./formats/std";
import { ILevelFooter } from "./internal";

//      |    |  0  1  2  3   4  5  6  7   8  9  A  B   C  D  E  F |
// -----|----|----------------------------------------------------|------------------
// 05A0 | 00 | .. .. .. ..  GG .. TT TT  TT TT TT TT  TT TT TT TT | ....G.LEVEL_TITL
// 05B0 | 10 | TT TT TT TT  TT TT TT TT  TT TT TT TT  TT FZ IN SC | E_LEVEL_TITLEzic
// 05C0 | 20 | OH OL GG FZ  FE .. OH OL  GG FZ FE ..  OH OL GG FZ | hlgze.hlgze.hlgz
// 05D0 | 30 | FE .. OH OL  GG FZ FE ..  OH OL GG FZ  FE .. OH OL | e.hlgze.hlgze.hl
// 05E0 | 40 | GG FZ FE ..  OH OL GG FZ  FE .. OH OL  GG FZ FE .. | gze.hlgze.hlgze.
// 05F0 | 50 | OH OL GG FZ  FE .. OH OL  GG FZ FE ..  SA SB SL SH | hlgze.hlgze.ABLH
//
//        00                GG    TT
//        10                 |     |                     FZ IN SC
//        20   SD            |     |         .------------'  |  |
//        30    |            |     |         |  .------------'  |
//        40    '------------|-----|-----.   |  |  .------------'
//        50                 |     |     |   |  |  |  SA SB SL SH
const GRAVITY_OFFSET = 4; //-'     |     |   |  |  |   |  |  |  |
const TITLE_OFFSET = 6; //---------'     |   |  |  |   |  |  |  |
const FREEZE_ZONKS_OFFSET = 0x1d; //---------'  |  |   |  |  |  |
const INFOTRONS_NEED_OFFSET = 0x1e; //----------'  |   |  |  |  |
const SPEC_PORT_COUNT_OFFSET = 0x1f; //------------'   |  |  |  |
const SPEC_PORT_DB_OFFSET = 0x20; //-----'             |  |  |  |
const DEMO_SPEED_A_OFFSET = 0x5c; //-------------------'  |  |  |
const DEMO_SPEED_B_OFFSET = 0x5d; //----------------------'  |  |
const DEMO_RNG_SEED_LO_OFFSET = 0x5e; //---------------------'  |
const DEMO_RNG_SEED_HI_OFFSET = 0x5f; //------------------------'

export const FOOTER_SPEC_PORT_COUNT_OFFSET = SPEC_PORT_COUNT_OFFSET;
export const FOOTER_SPEC_PORT_DB_OFFSET = SPEC_PORT_DB_OFFSET;

const validateByte = import.meta.env.PROD
  ? undefined
  : (byte: number) => {
      if (byte < 0 || byte > 255) {
        throw new RangeError(`Invalid byte ${byte}`);
      }
    };

export const createLevelFooter = (
  width: number,
  data?: Uint8Array,
): ILevelFooter => new LevelFooter(width, data);

class LevelFooter implements ILevelFooter {
  readonly #width: number;
  readonly #src: Uint8Array;
  #demo: Uint8Array | null = null;
  #signature: Uint8Array | null = null;

  #usePlasma = false;
  #usePlasmaLimit: number | undefined;
  #usePlasmaTime: number | undefined;
  #useZonker = false;
  #useSerialPorts = false;
  #useInfotronsNeeded: number | undefined;
  #initialFreezeEnemies = false;

  constructor(width: number, data?: Uint8Array) {
    this.#width = width;

    if (data) {
      this.#src = data.slice(0, FOOTER_BYTE_LENGTH);
      if (!import.meta.env.PROD && this.#src.length !== FOOTER_BYTE_LENGTH) {
        throw new Error(
          `Invalid buffer length ${this.#src.length}, expected exactly ${FOOTER_BYTE_LENGTH}`,
        );
      }

      if (data.length > FOOTER_BYTE_LENGTH) {
        // <level-index> <demo> FF [<signature> FF]
        //     1 byte      n          0..511

        // SPFIX63a.pdf:
        //
        // Original *.BIN demo used first byte to store target level index.
        // In *.SP file the level is attached, but the first byte is still
        // presented and unused.
        //
        // This is why here is `+1`.
        const demoStart = FOOTER_BYTE_LENGTH + 1;
        let endAt = data.indexOf(0xff, demoStart);
        if (endAt > demoStart) {
          this.#demo = data.slice(demoStart, endAt);
        }
        if (endAt >= demoStart) {
          const signatureStart = endAt + 1;
          endAt = data.indexOf(0xff, signatureStart);
          if (
            endAt > signatureStart &&
            endAt - signatureStart <= SIGNATURE_MAX_LENGTH
          ) {
            this.#signature = data.slice(signatureStart, endAt);
          }
        }
      }
    } else {
      this.#src = new Uint8Array(FOOTER_BYTE_LENGTH);
      this.#src.set(
        ""
          .padEnd(TITLE_LENGTH)
          .split("")
          .map((ch) => ch.charCodeAt(0)),
        TITLE_OFFSET,
      );
    }
  }

  copy() {
    const copy = new LevelFooter(this.width, this.getRaw()) as this;
    copy.#usePlasma = this.#usePlasma;
    copy.#usePlasmaLimit = this.#usePlasmaLimit;
    copy.#usePlasmaTime = this.#usePlasmaTime;
    copy.#useZonker = this.#useZonker;
    copy.#useSerialPorts = this.#useSerialPorts;
    copy.#useInfotronsNeeded = this.#useInfotronsNeeded;
    copy.#initialFreezeEnemies = this.#initialFreezeEnemies;
    return copy;
  }

  get width() {
    return this.#width;
  }

  get length() {
    const demo = this.#demo;
    const sign = this.#signature;
    let length = this.#src.length;
    if (demo || sign) {
      // <level-index> <demo> FF
      length += 1 + (demo?.length ?? 0) + 1;
      if (sign) {
        // <signature> FF
        length += sign.length + 1;
      }
    }
    return length;
  }

  getRaw() {
    const result = new Uint8Array(this.length);
    result.set(this.#src, 0);
    if (result.length > this.#src.length) {
      let pos = this.#src.length;
      // <level-index> useless
      result[pos] = 0;
      pos++;
      const demo = this.#demo;
      if (demo) {
        result.set(demo, pos);
        pos += demo.length;
      }
      result[pos] = 0xff;
      pos++;

      const sign = this.#signature;
      if (sign) {
        result.set(sign, pos);
        pos += sign.length;
        result[pos] = 0xff;
      }
    }
    return result;
  }

  get title() {
    return String.fromCharCode(
      ...this.#src.slice(TITLE_OFFSET, TITLE_OFFSET + TITLE_LENGTH),
    );
  }

  setTitle(title: string) {
    if (!import.meta.env.PROD && title.length > TITLE_LENGTH) {
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
    return this.#src[GRAVITY_OFFSET] !== 0;
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

  get demoSeed(): DemoSeed {
    return {
      lo: this.#src[DEMO_RNG_SEED_LO_OFFSET],
      hi: this.#src[DEMO_RNG_SEED_HI_OFFSET],
    };
  }

  setDemoSeed({ lo, hi }: DemoSeed) {
    if (validateByte) {
      validateByte(lo);
      validateByte(hi);
    }
    if (
      this.#src[DEMO_SPEED_A_OFFSET] === 0 &&
      this.#src[DEMO_SPEED_B_OFFSET] === 0 &&
      this.#src[DEMO_RNG_SEED_LO_OFFSET] === lo &&
      this.#src[DEMO_RNG_SEED_HI_OFFSET] === hi
    ) {
      return this;
    }
    const copy = this.copy();
    copy.#src[DEMO_SPEED_A_OFFSET] = 0;
    copy.#src[DEMO_SPEED_B_OFFSET] = 0;
    copy.#src[DEMO_RNG_SEED_LO_OFFSET] = lo;
    copy.#src[DEMO_RNG_SEED_HI_OFFSET] = hi;
    return copy;
  }

  get demo() {
    return this.#demo && new Uint8Array(this.#demo);
  }

  setDemo(demo: Uint8Array | null) {
    if (demo) {
      if (
        this.#demo &&
        demo.length === this.#demo.length &&
        demo.every((v, i) => v === this.#demo![i])
      ) {
        return this;
      }
    } else {
      if (!this.#demo) {
        return this;
      }
    }
    const copy = this.copy();
    copy.#demo = demo && new Uint8Array(demo);
    return copy;
  }

  get signature() {
    return this.#signature && new Uint8Array(this.#signature);
  }
  get signatureString() {
    return this.#signature ? String.fromCharCode(...this.#signature) : "";
  }

  setSignature(signature: Uint8Array | string | null) {
    if (typeof signature === "string") {
      signature = Uint8Array.of(
        ...Array.from(signature, (c: string) => {
          const b = c.charCodeAt(0);
          if (b > 255) {
            throw new Error("Invalid character out of support range");
          }
          return b;
        }),
      );
    }

    if (signature) {
      if (
        this.#signature &&
        signature.length === this.#signature.length &&
        signature.every((v, i) => v === this.#signature![i])
      ) {
        return this;
      }
      if (signature.length > SIGNATURE_MAX_LENGTH) {
        throw new Error("Too long signature");
      }
    } else {
      if (!this.#signature) {
        return this;
      }
    }
    const copy = this.copy();
    copy.#signature = signature && new Uint8Array(signature);
    return copy;
  }

  get usePlasma() {
    return this.#usePlasma;
  }
  setUsePlasma(on: boolean): this {
    if (on === this.#usePlasma) {
      return this;
    }
    const next = this.copy();
    next.#usePlasma = on;
    return next;
  }

  get usePlasmaLimit() {
    return this.#usePlasmaLimit;
  }
  setUsePlasmaLimit(n: number | undefined): this {
    if (n === this.#usePlasmaLimit) {
      return this;
    }
    const next = this.copy();
    next.#usePlasmaLimit = n;
    return next;
  }

  get usePlasmaTime() {
    return this.#usePlasmaTime;
  }
  setUsePlasmaTime(n: number | undefined): this {
    if (n === this.#usePlasmaTime) {
      return this;
    }
    const next = this.copy();
    next.#usePlasmaTime = n;
    return next;
  }

  get useZonker() {
    return this.#useZonker;
  }
  setUseZonker(on: boolean): this {
    if (on === this.#useZonker) {
      return this;
    }
    const next = this.copy();
    next.#useZonker = on;
    return next;
  }

  get useSerialPorts() {
    return this.#useSerialPorts;
  }
  setUseSerialPorts(on: boolean): this {
    if (on === this.#useSerialPorts) {
      return this;
    }
    const next = this.copy();
    next.#useSerialPorts = on;
    return next;
  }

  get useInfotronsNeeded() {
    return this.#useInfotronsNeeded;
  }
  setUseInfotronsNeeded(n: number | undefined): this {
    if (n === this.#useInfotronsNeeded) {
      return this;
    }
    const next = this.copy();
    next.#useInfotronsNeeded = n;
    return next;
  }

  get initialFreezeEnemies() {
    return this.#initialFreezeEnemies;
  }
  setInitialFreezeEnemies(on: boolean): this {
    if (on === this.#initialFreezeEnemies) {
      return this;
    }
    const next = this.copy();
    next.#initialFreezeEnemies = on;
    return next;
  }
}
