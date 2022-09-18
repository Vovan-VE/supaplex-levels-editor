import { ILevelBody } from "../supaplex/internal";
import { LevelBody } from "../supaplex/body";
import { FOOTER_BYTE_LENGTH, TITLE_LENGTH } from "../supaplex/footer";
import { isSpecPort, TILE_SPACE } from "../supaplex/tiles";
import { ISupaplexSpecPortProps } from "../supaplex/types";
import { AnyBox } from "./box";
import { LevelFooter } from "./footer";
import { IMegaplexLevel } from "./types";

const sliceFooter = (width: number, height: number, data?: Uint8Array) => {
  if (data) {
    const bodyLength = width * height;
    const minLength = bodyLength + FOOTER_BYTE_LENGTH;
    if (process.env.NODE_ENV !== "production" && data.length < minLength) {
      throw new Error(
        `Invalid buffer length ${data.length}, expected at least ${minLength}`,
      );
    }
    return data.slice(bodyLength);
  }
};

export class MegaplexLevel extends LevelFooter implements IMegaplexLevel {
  readonly #box: AnyBox;
  #body: ILevelBody;

  constructor(width: number, height: number, data?: Uint8Array) {
    super(width, sliceFooter(width, height, data));
    this.#box = new AnyBox(width, height);
    this.#body = new LevelBody(this.#box, data?.slice(0, this.#box.length));
  }

  get length() {
    return this.#box.length + super.length;
  }

  get raw() {
    const result = new Uint8Array(this.length);
    result.set(super.getRaw(this.#box.width), this.#box.length);
    result.set(this.#body.raw, 0);
    return result;
  }

  get body() {
    return this.#body;
  }

  get width() {
    return this.#box.width;
  }

  get height() {
    return this.#box.height;
  }

  get resizable() {
    return {
      maxWidth: 0x7fff,
      maxHeight: 0x7fff,
    };
  }

  copy(): this {
    return new MegaplexLevel(
      this.#box.width,
      this.#box.height,
      this.raw,
    ) as this;
  }

  resize(width: number, height: number) {
    const origSpecPorts = [...this.getSpecPorts()];

    let src = this;
    // reducing any dimension with spec port deletion
    if (
      (width < this.#box.width && origSpecPorts.some((p) => p.x >= width)) ||
      (height < this.#box.height && origSpecPorts.some((p) => p.y >= height))
    ) {
      src = this.copy();
      // delete spec ports entry
      for (let p of origSpecPorts) {
        if (
          (width < this.#box.width && p.x >= width) ||
          (height < this.#box.height && p.y >= height)
        ) {
          src = src.setTile(p.x, p.y, TILE_SPACE);
        }
      }
    }

    const temp = new Uint8Array(width * height + src.length - src.#box.length);
    temp.set(src.getRaw(width), width * height);
    let result = new MegaplexLevel(width, height, temp) as this;

    for (let y = Math.min(height, this.#box.height); y-- > 0; ) {
      for (let x = Math.min(width, this.#box.width); x-- > 0; ) {
        result = result.setTile(x, y, src.getTile(x, y));
      }
    }

    return result;
  }

  getTile(x: number, y: number) {
    return this.#body.getTile(x, y);
  }

  setTile(x: number, y: number, value: number) {
    const prev = this.#body.getTile(x, y);
    let next = this.copy();
    next.#body = next.#body.setTile(x, y, value);
    if (isSpecPort(prev)) {
      if (!isSpecPort(value)) {
        next = next.deleteSpecPort(x, y);
      }
    } else {
      if (isSpecPort(value)) {
        next = next.setSpecPort(x, y);
      }
    }
    return next;
  }

  get maxTitleLength() {
    return TITLE_LENGTH;
  }

  findSpecPort(x: number, y: number) {
    this.#box.validateCoords?.(x, y);
    return super.findSpecPort(x, y);
  }

  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps) {
    this.#box.validateCoords?.(x, y);
    return super.setSpecPort(x, y, props);
  }

  deleteSpecPort(x: number, y: number) {
    this.#box.validateCoords?.(x, y);
    return super.deleteSpecPort(x, y);
  }
}
