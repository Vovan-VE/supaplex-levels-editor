import * as RoMap from "@cubux/readonly-map";
import { inRect, Point2D, Rect } from "utils/rect";
import {
  SPEC_PORT_ITEM_LENGTH,
  SPEC_PORT_MAX_COUNT,
  SPEC_PORTS_DB_SIZE,
} from "./formats/std";
import { ISupaplexSpecPortDatabase, ISupaplexSpecPortRecord } from "./internal";
import {
  isPortEqual,
  newSpecPortRecord,
  newSpecPortRecordFromBytes,
  newSpecPortRecordFromString,
} from "./specPortsRecord";

type _Key = `${number},${number}`;

const keyCoord = (x: number, y: number): _Key => `${x},${y}`;
const keyPort = (p: Point2D | ISupaplexSpecPortRecord) => keyCoord(p.x, p.y);

class SpecPortsDatabase implements ISupaplexSpecPortDatabase {
  #ports: ReadonlyMap<_Key, ISupaplexSpecPortRecord>;

  constructor(ports?: readonly ISupaplexSpecPortRecord[]) {
    this.#ports = ports ? RoMap.fromArray(ports, keyPort) : new Map();
  }

  isStdCompatible(width: number): boolean {
    if (this.#ports.size > SPEC_PORT_MAX_COUNT) {
      return false;
    }
    for (const p of this.#ports.values()) {
      if (!p.isStdCompatible(width)) {
        return false;
      }
    }
    return true;
  }
  toRaw(width: number): Uint8Array {
    const raw = new Uint8Array(SPEC_PORTS_DB_SIZE);
    let i = 0;
    for (const p of this.#ports.values()) {
      if (i === SPEC_PORT_MAX_COUNT) {
        break;
      }
      raw.set(p.toRaw(width), i * SPEC_PORT_ITEM_LENGTH);
      i++;
    }
    return raw;
  }
  toString(): string {
    return Array.from(this.#ports.values(), (p) => p.toString()).join(",");
  }

  get count(): number {
    return this.#ports.size;
  }
  get countStdCompatible(): number {
    return Math.min(SPEC_PORT_MAX_COUNT, this.#ports.size);
  }

  getAll(): Iterable<ISupaplexSpecPortRecord> {
    return this.#ports.values();
  }

  copySpecPortsInRegion(r: Rect): ISupaplexSpecPortDatabase {
    const result: ISupaplexSpecPortRecord[] = [];
    for (const p of this.#ports.values()) {
      if (inRect(p.x, p.y, r)) {
        result.push(p.setX(p.x - r.x).setY(p.y - r.y));
      }
    }
    return new SpecPortsDatabase(result);
  }

  clear(): SpecPortsDatabase {
    if (!this.#ports.size) {
      return this;
    }
    return new SpecPortsDatabase();
  }

  find(x: number, y: number): ISupaplexSpecPortRecord | null {
    return this.#ports.get(keyCoord(x, y)) ?? null;
  }

  add(x: number, y: number): SpecPortsDatabase {
    const key = keyCoord(x, y);
    if (this.#ports.has(key)) {
      return this;
    }
    const result = new SpecPortsDatabase();
    result.#ports = RoMap.set(this.#ports, key, newSpecPortRecord(x, y));
    return result;
  }

  set(p: ISupaplexSpecPortRecord): SpecPortsDatabase {
    const key = keyPort(p);
    const prev = this.#ports.get(key);
    if (prev && isPortEqual(prev, p)) {
      return this;
    }
    const result = new SpecPortsDatabase();
    result.#ports = RoMap.set(this.#ports, key, p);
    return result;
  }

  update(
    x: number,
    y: number,
    update: (prev: ISupaplexSpecPortRecord) => ISupaplexSpecPortRecord,
  ): SpecPortsDatabase {
    const key = keyCoord(x, y);
    const prev = this.#ports.get(key);
    const next = update(prev ?? newSpecPortRecord(x, y));
    if (next.x !== x || next.y !== y) {
      throw new Error("Not expected to change coords here");
    }
    if (prev && isPortEqual(prev, next)) {
      return this;
    }
    const result = new SpecPortsDatabase();
    result.#ports = RoMap.set(this.#ports, key, next);
    return result;
  }

  delete(x: number, y: number): SpecPortsDatabase {
    const key = keyCoord(x, y);
    if (!this.#ports.has(key)) {
      return this;
    }
    const result = new SpecPortsDatabase();
    result.#ports = RoMap.remove(this.#ports, key);
    return result;
  }
}

export const newSpecPortsDatabase = (
  ports?: readonly ISupaplexSpecPortRecord[],
): ISupaplexSpecPortDatabase => new SpecPortsDatabase(ports);

export const newSpecPortsDatabaseFromBytes = (
  raw: Uint8Array,
  count: number,
  levelWidth: number,
): ISupaplexSpecPortDatabase => {
  if (raw.length !== SPEC_PORTS_DB_SIZE) {
    throw new Error("invalid buffer size");
  }
  const ports: ISupaplexSpecPortRecord[] = [];
  for (let i = 0; i < count && i < SPEC_PORT_MAX_COUNT; i++) {
    const at = i * SPEC_PORT_ITEM_LENGTH;
    ports.push(
      newSpecPortRecordFromBytes(
        raw.slice(at, at + SPEC_PORT_ITEM_LENGTH),
        levelWidth,
      ),
    );
  }
  return new SpecPortsDatabase(ports);
};

export const newSpecPortsDatabaseFromString = (
  s: string,
): ISupaplexSpecPortDatabase =>
  new SpecPortsDatabase(s.split(",").map(newSpecPortRecordFromString));

export const isDbEqual = (
  a: ISupaplexSpecPortDatabase,
  b: ISupaplexSpecPortDatabase,
): boolean => {
  if (a === b) {
    return true;
  }
  if (a.count !== b.count) {
    return false;
  }
  return isDbEqualToArray(a, Array.from(b.getAll()));
};

export const isDbEqualToArray = (
  a: ISupaplexSpecPortDatabase,
  b: readonly ISupaplexSpecPortRecord[],
): boolean => {
  if (a.count !== b.length) {
    return false;
  }
  let i = 0;
  for (const ap of a.getAll()) {
    if (!isPortEqual(ap, b[i])) {
      return false;
    }
    i++;
  }
  return true;
};
