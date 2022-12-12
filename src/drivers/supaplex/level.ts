import { clipRect, IBounds, inBounds, Rect } from "utils/rect";
import { DemoSeed, ITilesStreamItem } from "../types";
import { AnyBox } from "./AnyBox";
import { createLevelBody } from "./body";
import { createLevelFooter } from "./footer";
import { FOOTER_BYTE_LENGTH, TITLE_LENGTH } from "./formats/std";
import { ILevelBody, ILevelFooter, ISupaplexSpecPortProps } from "./internal";
import { isSpecPort, TILE_SPACE } from "./tiles-id";
import { ISupaplexLevel, ISupaplexLevelRegion } from "./types";

const sliceFooter = (bodyLength: number, data?: Uint8Array) => {
  if (data) {
    const minLength = bodyLength + FOOTER_BYTE_LENGTH;
    if (process.env.NODE_ENV !== "production" && data.length < minLength) {
      throw new Error(
        `Invalid buffer length ${data.length}, expected at least ${minLength}`,
      );
    }
    return data.slice(bodyLength);
  }
};

export const createLevel = (
  width: number,
  height: number,
  data?: Uint8Array,
): ISupaplexLevel => {
  const box = new AnyBox(width, height);
  const footer = createLevelFooter(box.width, sliceFooter(box.length, data));
  const body = createLevelBody(box, data?.slice(0, box.length));
  return new SupaplexLevel(box, body, footer);
};

class SupaplexLevel implements ISupaplexLevel {
  readonly #box: AnyBox;
  #body;
  #footer;

  constructor(box: AnyBox, body: ILevelBody, footer: ILevelFooter) {
    this.#box = box;
    this.#body = body;
    this.#footer = footer;
  }

  get length() {
    return this.#box.length + this.#footer.length;
  }

  get raw() {
    const result = new Uint8Array(this.length);
    result.set(this.#footer.getRaw(), this.#box.length);
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
    const next = new SupaplexLevel(this.#box, body, this.#footer) as this;
    if (this.#batchingLevel > 0) {
      next.#isBatchCopy = true;
    }
    return next;
  }
  #withFooter(footer: ILevelFooter): this {
    if (footer === this.#footer) {
      return this;
    }
    if (this.#isBatchCopy) {
      this.#footer = footer;
      return this;
    }
    const next = new SupaplexLevel(this.#box, this.#body, footer) as this;
    if (this.#batchingLevel > 0) {
      next.#isBatchCopy = true;
    }
    return next;
  }
  batch(update: (b: this) => this) {
    let nextFooter: ILevelFooter;
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

  resize(width: number, height: number) {
    const origSpecPorts = [...this.getSpecPorts()];

    let src: this = this;
    // reducing any dimension with spec port deletion
    if (
      (width < this.#box.width && origSpecPorts.some((p) => p.x >= width)) ||
      (height < this.#box.height && origSpecPorts.some((p) => p.y >= height))
    ) {
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

    const box = new AnyBox(width, height);
    const body = createLevelBody(box).batch((body) => {
      for (let y = Math.min(height, this.#box.height); y-- > 0; ) {
        for (let x = Math.min(width, this.#box.width); x-- > 0; ) {
          body = body.setTile(x, y, src.getTile(x, y));
        }
      }
      return body;
    });

    let footer = createLevelFooter(
      width,
      src.#footer.getRaw(),
    ).clearSpecPorts();
    for (const p of src.getSpecPorts()) {
      footer = footer.setSpecPort(p.x, p.y, p);
    }

    return new SupaplexLevel(box, body, footer) as this;
  }

  getTile(x: number, y: number) {
    return this.#body.getTile(x, y);
  }

  setTile(x: number, y: number, value: number) {
    const prev = this.#body.getTile(x, y);
    if (prev === value) {
      return this;
    }
    let next: this = this.#withBody(this.#body.setTile(x, y, value));
    if (isSpecPort(prev)) {
      if (!isSpecPort(value)) {
        next = next.#withFooter(next.#footer.deleteSpecPort(x, y));
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

  copyRegion(r: Rect) {
    const [x, y, tiles] = this.#body.copyRegion(r);
    return {
      tiles,
      specPorts: this.#footer.copySpecPortsInRegion({
        x,
        y,
        width: tiles.width,
        height: tiles.height,
      }),
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

    const b: IBounds = this.#box;
    const {
      x: x0,
      y: y0,
      width,
      height,
    } = clipRect({ x, y, width: tiles.width, height: tiles.height }, b);
    return this.batch((l) => {
      for (let j = 0; j < height; j++) {
        const cy = y0 + j;
        for (let i = 0; i < width; i++) {
          const cx = x0 + i;
          l = l.setTile(cx, cy, tiles.getTile(cx - x, cy - y));
        }
      }
      for (const p of specPorts) {
        const cx = p.x + x;
        const cy = p.y + y;
        if (inBounds(cx, cy, b)) {
          l = l.setSpecPort(cx, cy, p);
        }
      }
      return l;
    });
  }

  findPlayer() {
    return this.#body.findPlayer();
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

  findSpecPort(x: number, y: number) {
    this.#box.validateCoords?.(x, y);
    return this.#footer.findSpecPort(x, y);
  }

  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps) {
    this.#box.validateCoords?.(x, y);
    return this.#withFooter(this.#footer.setSpecPort(x, y, props));
  }

  get demoSeed() {
    return this.#footer.demoSeed;
  }

  setDemoSeed(seed: DemoSeed) {
    return this.#withFooter(this.#footer.setDemoSeed(seed));
  }

  get demo() {
    return this.#footer.demo;
  }

  setDemo(demo: Uint8Array | null) {
    return this.#withFooter(this.#footer.setDemo(demo));
  }
}
