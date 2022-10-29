import { DemoSeed, ITilesStreamItem } from "../types";
import { ISupaplexLevel } from "./types";
import { createLevelBody } from "./body";
import { BODY_LENGTH, LEVEL_HEIGHT, LEVEL_WIDTH, supaplexBox } from "./box";
import { createLevelFooter, FOOTER_BYTE_LENGTH, TITLE_LENGTH } from "./footer";
import { isSpecPort } from "./tiles-id";
import { ISupaplexSpecPortProps } from "./internal";

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

export const createLevel = (data?: Uint8Array): ISupaplexLevel =>
  new SupaplexLevel(data);

export const createLevelFromArrayBuffer = (
  buffer: ArrayBufferLike,
  byteOffset?: number,
): ISupaplexLevel =>
  new SupaplexLevel(new Uint8Array(buffer, byteOffset, LEVEL_BYTES_LENGTH));

class SupaplexLevel implements ISupaplexLevel {
  #body;
  #footer;

  constructor(data?: Uint8Array) {
    this.#footer = createLevelFooter(sliceFooter(data));
    this.#body = createLevelBody(supaplexBox, data?.slice(0, BODY_LENGTH));
  }

  copy(): this {
    return new SupaplexLevel(this.raw) as this;
  }

  get length() {
    return BODY_LENGTH + this.#footer.length;
  }

  get raw() {
    const result = new Uint8Array(this.length);
    result.set(this.#footer.getRaw(), BODY_LENGTH);
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

  tilesRenderStream(
    x: number,
    y: number,
    w: number,
    h: number,
  ): Iterable<ITilesStreamItem> {
    return this.#body.tilesRenderStream(x, y, w, h, LEVEL_WIDTH, LEVEL_HEIGHT);
  }

  get title() {
    return this.#footer.title;
  }

  setTitle(title: string) {
    const nextFooter = this.#footer.setTitle(title);
    if (nextFooter === this.#footer) {
      return this;
    }
    const copy = this.copy();
    copy.#footer = nextFooter;
    return copy;
  }

  get maxTitleLength() {
    return TITLE_LENGTH;
  }

  get initialGravity() {
    return this.#footer.initialGravity;
  }

  setInitialGravity(on: boolean) {
    const nextFooter = this.#footer.setInitialGravity(on);
    if (nextFooter === this.#footer) {
      return this;
    }
    const copy = this.copy();
    copy.#footer = nextFooter;
    return copy;
  }

  get initialFreezeZonks() {
    return this.#footer.initialFreezeZonks;
  }

  setInitialFreezeZonks(on: boolean) {
    const nextFooter = this.#footer.setInitialFreezeZonks(on);
    if (nextFooter === this.#footer) {
      return this;
    }
    const copy = this.copy();
    copy.#footer = nextFooter;
    return copy;
  }

  get infotronsNeed() {
    return this.#footer.infotronsNeed;
  }

  setInfotronsNeed(value: number) {
    const nextFooter = this.#footer.setInfotronsNeed(value);
    if (nextFooter === this.#footer) {
      return this;
    }
    const copy = this.copy();
    copy.#footer = nextFooter;
    return copy;
  }

  get specPortsCount() {
    return this.#footer.specPortsCount;
  }

  getSpecPorts() {
    return this.#footer.getSpecPorts();
  }

  clearSpecPorts() {
    const nextFooter = this.#footer.clearSpecPorts();
    if (nextFooter !== this.#footer) {
      return this;
    }
    const copy = this.copy();
    copy.#footer = nextFooter;
    return copy;
  }

  findSpecPort(x: number, y: number) {
    supaplexBox.validateCoords?.(x, y);
    return this.#footer.findSpecPort(x, y);
  }

  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps) {
    supaplexBox.validateCoords?.(x, y);
    const nextFooter = this.#footer.setSpecPort(x, y, props);
    if (nextFooter === this.#footer) {
      return this;
    }
    const copy = this.copy();
    copy.#footer = nextFooter;
    return copy;
  }

  deleteSpecPort(x: number, y: number) {
    supaplexBox.validateCoords?.(x, y);
    const nextFooter = this.#footer.deleteSpecPort(x, y);
    if (nextFooter === this.#footer) {
      return this;
    }
    const copy = this.copy();
    copy.#footer = nextFooter;
    return copy;
  }

  get demoSeed() {
    return this.#footer.demoSeed;
  }

  setDemoSeed(seed: DemoSeed) {
    const nextFooter = this.#footer.setDemoSeed(seed);
    if (nextFooter === this.#footer) {
      return this;
    }
    const copy = this.copy();
    copy.#footer = nextFooter;
    return copy;
  }
}

export type { SupaplexLevel };
