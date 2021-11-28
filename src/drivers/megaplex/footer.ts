import {
  FOOTER_BYTE_LENGTH,
  LevelFooter as SpLevelFooter,
} from "../supaplex/footer";
import { ILevelFooter } from "./internal";

export class LevelFooter extends SpLevelFooter implements ILevelFooter {
  #demo: Uint8Array | null = null;

  constructor(width: number, data?: Uint8Array) {
    super(width, data?.slice(0, FOOTER_BYTE_LENGTH));

    if (data && data.length > FOOTER_BYTE_LENGTH) {
      this.#demo = data.slice(FOOTER_BYTE_LENGTH);
    }
  }

  get length() {
    return super.length + (this.#demo ? this.#demo.length : 0);
  }

  getRaw(width: number) {
    const main = super.getRaw(width);
    if (this.#demo) {
      const result = new Uint8Array(this.length);
      result.set(main, 0);
      result.set(this.#demo, main.length);
      return result;
    }
    return main;
  }

  get demo() {
    return this.#demo && new Uint8Array(this.#demo);
  }

  set demo(demo) {
    this.#demo = demo && new Uint8Array(demo);
  }
}
