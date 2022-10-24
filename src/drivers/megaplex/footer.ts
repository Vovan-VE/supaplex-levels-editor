import {
  FOOTER_BYTE_LENGTH,
  LevelFooter as SpLevelFooter,
} from "../supaplex/footer";
import { ILevelFooter } from "./internal";

export class LevelFooter extends SpLevelFooter implements ILevelFooter {
  #width: number;
  #demo: Uint8Array | null = null;

  constructor(width: number, data?: Uint8Array) {
    super(data?.slice(0, FOOTER_BYTE_LENGTH));
    this.#width = width;

    if (
      data &&
      data.length > FOOTER_BYTE_LENGTH &&
      data[data.length - 1] === 0xff
    ) {
      this.#demo = data.slice(FOOTER_BYTE_LENGTH + 1, data.length - 1);
    }
  }

  copy() {
    return new LevelFooter(this.width, this.getRaw()) as this;
  }

  get width() {
    return this.#width;
  }

  get length() {
    return super.length + (this.#demo ? this.#demo.length + 2 : 0);
  }

  getRaw() {
    const main = super.getRaw();
    const demo = this.#demo;
    if (demo) {
      const result = new Uint8Array(main.length + demo.length + 2);
      result.set(main, 0);
      result[main.length] = 0;
      result.set(demo, main.length + 1);
      result[main.length + 1 + demo.length] = 0xff;
      return result;
    }
    return main;
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
}
