import { clipRect, IBounds, inBounds, Point2D, Rect } from "utils/rect";
import {
  DemoSeed,
  FlipDirection,
  INewLevelOptions,
  IResizeLevelOptions,
  ITilesStreamItem,
  LocalOptions,
} from "../types";
import { AnyBox } from "./AnyBox";
import { createLevelBody } from "./body";
import { fillLevelBorder } from "./fillLevelBorder";
import { createLevelFooter } from "./footer";
import {
  FOOTER_BYTE_LENGTH,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  TITLE_LENGTH,
} from "./formats/std";
import {
  ILevelBody,
  ILevelFooter,
  ISupaplexSpecPortProps,
  LocalOpt,
} from "./internal";
import {
  isSpecPort,
  isVariants,
  setPortIsSpecial,
  symmetry,
  TILE_HARDWARE,
  TILE_SPACE,
} from "./tiles-id";
import { ISupaplexLevel, ISupaplexLevelRegion } from "./types";
import { isEmptyObject } from "../../utils/object";

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

export const createNewLevel = ({
  width,
  height,
  borderTile = TILE_HARDWARE,
  fillTile = TILE_SPACE,
}: INewLevelOptions = {}) => {
  const box = new AnyBox(width ?? LEVEL_WIDTH, height ?? LEVEL_HEIGHT);
  const body = createLevelBody(
    box,
    fillTile !== 0 ? new Uint8Array(box.length).fill(fillTile) : undefined,
  );
  const level = new SupaplexLevel(box, body, createLevelFooter(box.width));
  return borderTile !== fillTile ? fillLevelBorder(level, borderTile) : level;
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

  resize({
    x = 0,
    y = 0,
    width = this.#box.width,
    height = this.#box.height,
    ...rest
  }: IResizeLevelOptions): this {
    if (
      x === 0 &&
      y === 0 &&
      width === this.#box.width &&
      height === this.#box.height
    ) {
      return this;
    }
    const inputRect: Rect = { x, y, width, height };
    const readRect = clipRect(inputRect, this.#box);

    const region = this.copyRegion(readRect);

    const footer = createLevelFooter(width, this.#footer.getRaw());
    return createNewLevel({ width, height, ...rest }).batch((level) =>
      level
        .#withFooter(footer.clearSpecPorts())
        .pasteRegion(
          readRect.x - inputRect.x,
          readRect.y - inputRect.y,
          region,
        ),
    ) as this;
  }

  getTile(x: number, y: number) {
    return this.#body.getTile(x, y);
  }

  setTile(x: number, y: number, value: number, keepSameVariant?: boolean) {
    const prev = this.#body.getTile(x, y);
    if (keepSameVariant) {
      if (isVariants(prev, value)) {
        return this;
      }
      if (isSpecPort(prev) && !isSpecPort(value)) {
        value = setPortIsSpecial(value, true);
      }
    }
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

  swapTiles(a: Point2D, b: Point2D, flip?: FlipDirection) {
    let prevA = this.#body.getTile(a.x, a.y);
    let prevB = this.#body.getTile(b.x, b.y);
    if (flip) {
      const s = symmetry[flip];
      [prevA, prevB] = [s.get(prevA) ?? prevA, s.get(prevB) ?? prevB];
    }
    const spA = this.#footer.findSpecPort(a.x, a.y);
    const spB = this.#footer.findSpecPort(b.x, b.y);
    let next = this.setTile(a.x, a.y, prevB).setTile(b.x, b.y, prevA);
    if (spB) {
      next = next.setSpecPort(a.x, a.y, spB);
    }
    if (spA) {
      next = next.setSpecPort(b.x, b.y, spA);
    }
    return next;
  }

  isPlayable() {
    return this.#body.isPlayable();
  }

  *tilesRenderStream(
    x: number,
    y: number,
    w: number,
    h: number,
  ): Iterable<ITilesStreamItem> {
    for (const chunk of this.#body.tilesRenderStream(x, y, w, h)) {
      const [tx, ty, width, tile] = chunk;
      if (isSpecPort(tile)) {
        // just split chunk in separate tiles - easier and harmless since there
        // are no big chunks of spec ports
        const altChunks = Array.from({ length: width }).map<ITilesStreamItem>(
          (_, i) => [
            tx + i,
            ty,
            1,
            tile,
            this.#footer.findSpecPort(tx + i, ty) ? undefined : 1,
          ],
        );
        if (altChunks.some(([, , , , variant]) => variant)) {
          yield* altChunks;
          continue;
        }
      }
      yield chunk;
    }
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

  get localOptions() {
    const o: LocalOptions = {};
    if (this.usePlasma) {
      o[LocalOpt.UsePlasma] = 1;
    }
    if (this.usePlasmaLimit !== undefined) {
      o[LocalOpt.UsePlasmaLimit] = this.usePlasmaLimit;
    }
    if (this.usePlasmaTime !== undefined) {
      o[LocalOpt.UsePlasmaTime] = this.usePlasmaTime;
    }
    if (this.useZonker) {
      o[LocalOpt.UseZonker] = 1;
    }
    if (this.useSerialPorts) {
      o[LocalOpt.UseSerialPorts] = 1;
    }
    if (isEmptyObject(o)) {
      return undefined;
    }
    return o;
  }
  setLocalOptions(opt: LocalOptions | undefined): this {
    if (!opt) {
      return this;
    }
    const toInt = (v: any) => (Number.isInteger(v) ? (v as number) : undefined);
    return this.batch((l) =>
      l
        .setUsePlasma(Boolean(opt[LocalOpt.UsePlasma]))
        .setUsePlasmaLimit(toInt(opt[LocalOpt.UsePlasmaLimit]))
        .setUsePlasmaTime(toInt(opt[LocalOpt.UsePlasmaTime]))
        .setUseZonker(Boolean(opt[LocalOpt.UseZonker]))
        .setUseSerialPorts(Boolean(opt[LocalOpt.UseSerialPorts])),
    );
  }

  get usePlasma() {
    return this.#footer.usePlasma;
  }
  setUsePlasma(on: boolean): this {
    return this.#withFooter(this.#footer.setUsePlasma(on));
  }

  get usePlasmaLimit() {
    return this.#footer.usePlasmaLimit;
  }
  setUsePlasmaLimit(n: number | undefined): this {
    return this.#withFooter(this.#footer.setUsePlasmaLimit(n));
  }

  get usePlasmaTime() {
    return this.#footer.usePlasmaTime;
  }
  setUsePlasmaTime(n: number | undefined): this {
    return this.#withFooter(this.#footer.setUsePlasmaTime(n));
  }

  get useZonker() {
    return this.#footer.useZonker;
  }
  setUseZonker(on: boolean): this {
    return this.#withFooter(this.#footer.setUseZonker(on));
  }

  get useSerialPorts() {
    return this.#footer.useSerialPorts;
  }
  setUseSerialPorts(on: boolean): this {
    return this.#withFooter(this.#footer.setUseSerialPorts(on));
  }
}