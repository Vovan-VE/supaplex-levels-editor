import { clipRect, inRect, RectA } from "utils/rect";
import { DemoSeed, ITilesStreamItem, IWithDemoSeed } from "../types";
import { ISupaplexLevel, ISupaplexLevelRegion } from "./types";
import { createLevelBody } from "./body";
import { BODY_LENGTH, LEVEL_HEIGHT, LEVEL_WIDTH, supaplexBox } from "./box";
import { createLevelFooter, FOOTER_BYTE_LENGTH, TITLE_LENGTH } from "./footer";
import { isSpecPort } from "./tiles-id";
import { ILevelBody, ILevelFooter, ISupaplexSpecPortProps } from "./internal";

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

export const createLevel = (data?: Uint8Array): ISupaplexLevel => {
  const footer = createLevelFooter(sliceFooter(data));
  const body = createLevelBody(supaplexBox, data?.slice(0, BODY_LENGTH));
  return new SupaplexLevel(body, footer);
};

export const createLevelFromArrayBuffer = (
  buffer: ArrayBufferLike,
  byteOffset?: number,
): ISupaplexLevel =>
  createLevel(new Uint8Array(buffer, byteOffset, LEVEL_BYTES_LENGTH));

class SupaplexLevel implements ISupaplexLevel {
  #body;
  #footer;

  constructor(body: ILevelBody, footer: ILevelFooter & IWithDemoSeed) {
    this.#body = body;
    this.#footer = footer;
  }

  #batchingLevel = 0;
  #isBatchCopy = false;
  #withBody(body: ILevelBody): this {
    if (body === this.#body) {
      return this;
    }
    if (this.#isBatchCopy) {
      this.#body = body;
      return this;
    }
    const next = new SupaplexLevel(body, this.#footer) as this;
    if (this.#batchingLevel > 0) {
      next.#isBatchCopy = true;
    }
    return next;
  }
  #withFooter(footer: ILevelFooter & IWithDemoSeed): this {
    if (footer === this.#footer) {
      return this;
    }
    if (this.#isBatchCopy) {
      this.#footer = footer;
      return this;
    }
    const next = new SupaplexLevel(this.#body, footer) as this;
    if (this.#batchingLevel > 0) {
      next.#isBatchCopy = true;
    }
    return next;
  }
  batch(update: (b: this) => this) {
    let nextFooter: ILevelFooter & IWithDemoSeed;
    const nextBody = this.#body.batch((body) => {
      this.#batchingLevel++;
      let result: this;
      try {
        result = update(this.#withBody(body));
      } finally {
        this.#batchingLevel--;
      }
      if (!this.#batchingLevel) {
        result.#isBatchCopy = false;
      }
      nextFooter = result.#footer;
      return result.#body;
    });
    return this.#withBody(nextBody).#withFooter(nextFooter!);
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
    const prevTile = this.#body.getTile(x, y);
    if (prevTile === value) {
      return this;
    }
    let next = this.#withBody(this.#body.setTile(x, y, value));
    if (isSpecPort(prevTile)) {
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
    return this.#body.tilesRenderStream(x, y, w, h);
  }

  copyRegion(x: number, y: number, w: number, h: number) {
    const [x0, y0, tiles] = this.#body.copyRegion(x, y, w, h);
    return {
      tiles,
      specPorts: this.#footer.copySpecPortsInRegion([
        x0,
        y0,
        tiles.width,
        tiles.height,
      ]),
    };
  }

  pasteRegion(
    x: number,
    y: number,
    { tiles, specPorts }: ISupaplexLevelRegion,
  ) {
    //         ------------------------ level
    //  ------------------ region
    //         ----------- clip

    const [x0, y0, w, h] = clipRect([x, y, tiles.width, tiles.height], this);
    return this.batch((l) => {
      for (let j = 0; j < h; j++) {
        const cy = y0 + j;
        for (let i = 0; i < w; i++) {
          const cx = x0 + i;
          l = l.setTile(cx, cy, tiles.getTile(cx - x, cy - y));
        }
      }
      const r: RectA = [0, 0, this.width, this.height];
      for (const p of specPorts) {
        const cx = p.x + x;
        const cy = p.y + y;
        if (inRect(cx, cy, r)) {
          l = l.setSpecPort(cx, cy, p);
        }
      }
      return l;
    });
  }

  get title() {
    return this.#footer.title;
  }

  setTitle(title: string) {
    return this.#withFooter(this.#footer.setTitle(title));
  }

  get maxTitleLength() {
    return TITLE_LENGTH;
  }

  get initialGravity() {
    return this.#footer.initialGravity;
  }

  setInitialGravity(on: boolean) {
    return this.#withFooter(this.#footer.setInitialGravity(on));
  }

  get initialFreezeZonks() {
    return this.#footer.initialFreezeZonks;
  }

  setInitialFreezeZonks(on: boolean) {
    return this.#withFooter(this.#footer.setInitialFreezeZonks(on));
  }

  get infotronsNeed() {
    return this.#footer.infotronsNeed;
  }

  setInfotronsNeed(value: number) {
    return this.#withFooter(this.#footer.setInfotronsNeed(value));
  }

  get specPortsCount() {
    return this.#footer.specPortsCount;
  }

  getSpecPorts() {
    return this.#footer.getSpecPorts();
  }

  clearSpecPorts() {
    return this.#withFooter(this.#footer.clearSpecPorts());
  }

  findSpecPort(x: number, y: number) {
    supaplexBox.validateCoords?.(x, y);
    return this.#footer.findSpecPort(x, y);
  }

  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps) {
    supaplexBox.validateCoords?.(x, y);
    return this.#withFooter(this.#footer.setSpecPort(x, y, props));
  }

  deleteSpecPort(x: number, y: number) {
    supaplexBox.validateCoords?.(x, y);
    return this.#withFooter(this.#footer.deleteSpecPort(x, y));
  }

  get demoSeed() {
    return this.#footer.demoSeed;
  }

  setDemoSeed(seed: DemoSeed) {
    return this.#withFooter(this.#footer.setDemoSeed(seed));
  }
}
