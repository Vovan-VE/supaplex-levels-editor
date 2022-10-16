import { ISupaplexLevel, ISupaplexSpecPortProps } from "./types";
import { LevelBody } from "./body";
import { BODY_LENGTH, LEVEL_HEIGHT, LEVEL_WIDTH, supaplexBox } from "./box";
import { FOOTER_BYTE_LENGTH, LevelFooter, TITLE_LENGTH } from "./footer";
import { isSpecPort } from "./tiles";

export const LEVEL_BYTES_LENGTH = BODY_LENGTH + FOOTER_BYTE_LENGTH;

const sliceFooter = (data?: Uint8Array) => {
  if (data) {
    if (
      process.env.NODE_ENV !== "production" &&
      data.length !== LEVEL_BYTES_LENGTH
    ) {
      throw new Error(
        `Invalid buffer length ${data.length}, expected ${LEVEL_BYTES_LENGTH}`,
      );
    }
    return data.slice(BODY_LENGTH);
  }
};

export class SupaplexLevel extends LevelFooter implements ISupaplexLevel {
  static fromArrayBuffer(buffer: ArrayBufferLike, byteOffset?: number) {
    return new SupaplexLevel(
      new Uint8Array(buffer, byteOffset, LEVEL_BYTES_LENGTH),
    );
  }

  #body: LevelBody;

  constructor(data?: Uint8Array) {
    super(LEVEL_WIDTH, sliceFooter(data));

    this.#body = new LevelBody(supaplexBox, data?.slice(0, BODY_LENGTH));
  }

  copy(): this {
    return new SupaplexLevel(this.raw) as this;
  }

  get length() {
    return BODY_LENGTH + super.length;
  }

  get raw() {
    const result = new Uint8Array(this.length);
    result.set(super.getRaw(LEVEL_WIDTH), BODY_LENGTH);
    result.set(this.#body.raw, 0);
    return result;
  }

  get body() {
    return this.#body;
  }

  get width() {
    return LEVEL_WIDTH;
  }

  get height() {
    return LEVEL_HEIGHT;
  }

  getTile(x: number, y: number) {
    return this.#body.getTile(x, y);
  }

  setTile(x: number, y: number, value: number) {
    const nextBody = this.#body.setTile(x, y, value);
    if (nextBody === this.#body) {
      return this;
    }
    let next = this.copy();
    next.#body = nextBody;
    if (isSpecPort(this.#body.getTile(x, y))) {
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

  isPlayable() {
    return this.#body.isPlayable();
  }

  get maxTitleLength() {
    return TITLE_LENGTH;
  }

  findSpecPort(x: number, y: number) {
    supaplexBox.validateCoords?.(x, y);
    return super.findSpecPort(x, y);
  }

  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps) {
    supaplexBox.validateCoords?.(x, y);
    return super.setSpecPort(x, y, props);
  }

  deleteSpecPort(x: number, y: number) {
    supaplexBox.validateCoords?.(x, y);
    return super.deleteSpecPort(x, y);
  }
}
