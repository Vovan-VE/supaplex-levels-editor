import { clipRect, IBounds, inBounds, Point2D, Rect } from "utils/rect";
import {
  DemoSeed,
  FlipDirection,
  ILevelRegion,
  INewLevelOptions,
  IResizeLevelOptions,
  ITilesStreamItem,
  LocalOptions,
} from "../types";
import { AnyBox } from "./AnyBox";
import { createLevelBody } from "./body";
import { fillLevelBorder } from "./fillLevelBorder";
import {
  createLevelFooter,
  FOOTER_SPEC_PORT_COUNT_OFFSET,
  FOOTER_SPEC_PORT_DB_OFFSET,
} from "./footer";
import {
  FOOTER_BYTE_LENGTH,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  SPEC_PORTS_DB_SIZE,
  TITLE_LENGTH,
} from "./formats/std";
import {
  ILevelBody,
  ILevelFooter,
  ISupaplexSpecPortDatabase,
  LocalOpt,
} from "./internal";
import {
  canHaveSpecPortsDB,
  isOtherPort,
  isSpecPort,
  isVariants,
  requiresSpecPortsDB,
  setPortIsSpecial,
  symmetry,
  TILE_HARDWARE,
  TILE_SPACE,
} from "./tiles-id";
import { ISupaplexLevel, ISupaplexLevelRegion } from "./types";
import { isEmptyObject } from "../../utils/object";
import {
  isDbEqual,
  newSpecPortsDatabase,
  newSpecPortsDatabaseFromBytes,
  newSpecPortsDatabaseFromString,
} from "./specPortsDb";

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
  const level = new SupaplexLevel(
    box,
    body,
    createLevelFooter(box.width),
    newSpecPortsDatabase(),
  );
  return borderTile !== fillTile ? fillLevelBorder(level, borderTile) : level;
};

export const createLevel = (
  width: number,
  height: number,
  data?: Uint8Array,
): ISupaplexLevel => {
  const box = new AnyBox(width, height);
  const footer = createLevelFooter(width, sliceFooter(box.length, data));
  const body = createLevelBody(box, data?.slice(0, box.length));
  const spdbStart = box.length + FOOTER_SPEC_PORT_DB_OFFSET;
  const spdb = data
    ? newSpecPortsDatabaseFromBytes(
        data.slice(spdbStart, spdbStart + SPEC_PORTS_DB_SIZE),
        data[box.length + FOOTER_SPEC_PORT_COUNT_OFFSET],
        width,
      )
    : newSpecPortsDatabase();
  return new SupaplexLevel(box, body, footer, spdb);
};

class SupaplexLevel implements ISupaplexLevel {
  readonly #box: AnyBox;
  #body: ILevelBody;
  #footer: ILevelFooter;
  #specports: ISupaplexSpecPortDatabase;

  constructor(
    box: AnyBox,
    body: ILevelBody,
    footer: ILevelFooter,
    specports: ISupaplexSpecPortDatabase,
  ) {
    this.#box = box;
    this.#body = body;
    this.#footer = footer;
    this.#specports = specports;
  }

  get length() {
    return this.#box.length + this.#footer.length;
  }

  get raw() {
    const result = new Uint8Array(this.length);
    result.set(this.#footer.getRaw(), this.#box.length);

    result[this.#box.length + FOOTER_SPEC_PORT_COUNT_OFFSET] =
      this.#specports.countStdCompatible;
    result.set(
      this.#specports.toRaw(this.#box.width),
      this.#box.length + FOOTER_SPEC_PORT_DB_OFFSET,
    );

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
    const next = new SupaplexLevel(
      this.#box,
      body,
      this.#footer,
      this.#specports,
    ) as this;
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
    const next = new SupaplexLevel(
      this.#box,
      this.#body,
      footer,
      this.#specports,
    ) as this;
    if (this.#batchingLevel > 0) {
      next.#isBatchCopy = true;
    }
    return next;
  }
  setSpecports(spdb: ISupaplexSpecPortDatabase): this {
    if (isDbEqual(spdb, this.#specports)) {
      return this;
    }
    if (this.#isBatchCopy) {
      this.#specports = spdb;
      return this;
    }
    const next = new SupaplexLevel(
      this.#box,
      this.#body,
      this.#footer,
      spdb,
    ) as this;
    if (this.#batchingLevel > 0) {
      next.#isBatchCopy = true;
    }
    return next;
  }
  batch(update: (b: this) => this) {
    let nextFooter: ILevelFooter;
    let spdb: ISupaplexSpecPortDatabase;
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
      spdb = result.#specports;
      return result.#body;
    });
    return this.#withBody(nextBody)
      .#withFooter(nextFooter!)
      .setSpecports(spdb!);
  }

  get specports(): ISupaplexSpecPortDatabase {
    return this.#specports;
  }
  updateSpecports(
    update: (spdb: ISupaplexSpecPortDatabase) => ISupaplexSpecPortDatabase,
  ): this {
    return this.setSpecports(update(this.#specports));
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
        .#withFooter(footer)
        .updateSpecports((db) => db.clear())
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
      // when placing regular port (but different form/direction),
      // in place of specport (either real or de-facto)
      // and new tile supports specport DB,
      // then trying to convert regular tile to its special counterpart
      if (
        (requiresSpecPortsDB(prev) || this.#specports.find(x, y)) &&
        canHaveSpecPortsDB(value)
      ) {
        value = setPortIsSpecial(value, true);
      }
    }
    if (prev === value) {
      return this;
    }
    let next: this = this.#withBody(this.#body.setTile(x, y, value));
    if (requiresSpecPortsDB(value)) {
      next = next.updateSpecports((db) => db.add(x, y));
    } else if (!canHaveSpecPortsDB(value)) {
      next = next.updateSpecports((db) => db.delete(x, y));
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
    const spA = this.#specports.find(a.x, a.y);
    const spB = this.#specports.find(b.x, b.y);
    return this.setTile(a.x, a.y, prevB)
      .setTile(b.x, b.y, prevA)
      .updateSpecports((db) => {
        db = spB ? db.set(spB.setX(a.x).setY(a.y)) : db.delete(a.x, a.y);
        db = spA ? db.set(spA.setX(b.x).setY(b.y)) : db.delete(b.x, b.y);
        return db;
      });
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
        // REFACT: axiom broken:
        // just split chunk in separate tiles - easier and harmless since there
        // are no big chunks of spec ports
        const altChunks = Array.from(
          { length: width },
          (_, i): ITilesStreamItem => [
            tx + i,
            ty,
            1,
            tile,
            this.#specports.find(tx + i, ty) ? undefined : 1,
          ],
        );
        if (altChunks.some(([, , , , variant]) => variant)) {
          yield* altChunks;
          continue;
        }
      }
      if (isOtherPort(tile)) {
        // REFACT: axiom broken:
        // just split chunk in separate tiles - easier and harmless since there
        // are no big chunks of spec ports
        const altChunks = Array.from(
          { length: width },
          (_, i): ITilesStreamItem => [
            tx + i,
            ty,
            1,
            tile,
            this.#specports.find(tx + i, ty) ? 1 : undefined,
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

  copyRegion(r: Rect): ISupaplexLevelRegion {
    const [x, y, body] = this.#body.copyRegion(r);
    return {
      tiles: new SupaplexLevel(
        new AnyBox(body.width, body.height),
        body,
        createLevelFooter(body.width),
        this.#specports.copySpecPortsInRegion({
          x,
          y,
          width: body.width,
          height: body.height,
        }),
      ),
    };
  }

  pasteRegion(x: number, y: number, { tiles }: ILevelRegion) {
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
      if (tiles instanceof SupaplexLevel) {
        for (const p of tiles.specports.getAll()) {
          const cx = p.x + x;
          const cy = p.y + y;
          if (inBounds(cx, cy, b)) {
            l = l.updateSpecports((db) => db.set(p.setX(cx).setY(cy)));
          }
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

  get signature() {
    return this.#footer.signature;
  }
  get signatureString() {
    return this.#footer.signatureString;
  }

  setSignature(signature: Uint8Array | string | null) {
    return this.#withFooter(this.#footer.setSignature(signature));
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
    if (this.useInfotronsNeeded !== undefined) {
      o[LocalOpt.UseInfotronsNeeded] = this.useInfotronsNeeded;
    }
    if (this.initialFreezeEnemies) {
      o[LocalOpt.InitialFreezeEnemies] = 1;
    }
    if (!this.#specports.isStdCompatible(this.width)) {
      o[LocalOpt.PortsDatabase] = this.#specports.toString();
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
    return this.batch((l) => {
      l = l
        .setUsePlasma(Boolean(opt[LocalOpt.UsePlasma]))
        .setUsePlasmaLimit(toInt(opt[LocalOpt.UsePlasmaLimit]))
        .setUsePlasmaTime(toInt(opt[LocalOpt.UsePlasmaTime]))
        .setUseZonker(Boolean(opt[LocalOpt.UseZonker]))
        .setUseSerialPorts(Boolean(opt[LocalOpt.UseSerialPorts]))
        .setUseInfotronsNeeded(toInt(opt[LocalOpt.UseInfotronsNeeded]))
        .setInitialFreezeEnemies(Boolean(opt[LocalOpt.InitialFreezeEnemies]));
      const pdStr = opt[LocalOpt.PortsDatabase];
      if (pdStr !== undefined) {
        l = l.setSpecports(newSpecPortsDatabaseFromString(pdStr));
      }
      return l;
    });
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

  get useInfotronsNeeded() {
    return this.#footer.useInfotronsNeeded;
  }
  setUseInfotronsNeeded(n: number | undefined): this {
    return this.#withFooter(this.#footer.setUseInfotronsNeeded(n));
  }

  get initialFreezeEnemies() {
    return this.#footer.initialFreezeEnemies;
  }
  setInitialFreezeEnemies(on: boolean): this {
    return this.#withFooter(this.#footer.setInitialFreezeEnemies(on));
  }
}
