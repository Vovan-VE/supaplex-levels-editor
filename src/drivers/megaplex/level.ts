import { DemoSeed, ITilesStreamItem } from "../types";
import { LevelBody } from "../supaplex/body";
import { supaplexBox } from "../supaplex/box";
import { FOOTER_BYTE_LENGTH, TITLE_LENGTH } from "../supaplex/footer";
import { isSpecPort, TILE_SPACE } from "../supaplex/tiles-id";
import { ISupaplexSpecPortProps } from "../supaplex/internal";
import { AnyBox } from "./box";
import { LevelFooter } from "./footer";
import { resizable } from "./resizable";
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

export class MegaplexLevel implements IMegaplexLevel {
  readonly #box: AnyBox;
  #body: LevelBody;
  #footer: LevelFooter;

  constructor(width: number, height: number, data?: Uint8Array) {
    this.#footer = new LevelFooter(width, sliceFooter(width, height, data));
    this.#box = new AnyBox(width, height);
    this.#body = new LevelBody(this.#box, data?.slice(0, this.#box.length));
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

  get resizable() {
    return resizable;
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

    let src: this = this;
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

    const temp = new Uint8Array(width * height + this.#footer.length);
    temp.set(src.#footer.getRaw(), width * height);
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
    const nextBody = this.#body.setTile(x, y, value);
    if (nextBody === this.#body) {
      return this;
    }
    const prev = this.#body.getTile(x, y);
    let next = this.copy();
    next.#body = nextBody;
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

  isPlayable() {
    return this.#body.isPlayable();
  }

  tilesRenderStream(
    x: number,
    y: number,
    w: number,
    h: number,
  ): Iterable<ITilesStreamItem> {
    return this.#body.tilesRenderStream(
      x,
      y,
      w,
      h,
      this.#box.width,
      this.#box.height,
    );
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
    this.#box.validateCoords?.(x, y);
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

  get demo() {
    return this.#footer.demo;
  }

  setDemo(demo: Uint8Array | null) {
    const nextFooter = this.#footer.setDemo(demo);
    if (nextFooter === this.#footer) {
      return this;
    }
    const copy = this.copy();
    copy.#footer = nextFooter;
    return copy;
  }
}
