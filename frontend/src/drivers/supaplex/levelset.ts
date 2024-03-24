import * as RoArray from "@cubux/readonly-array";
import { isOffsetInRange } from "utils/number";
import { LocalOptionsList } from "../types";
import { createNewLevel } from "./level";
import { ISupaplexLevel, ISupaplexLevelset } from "./types";

const validateLevelsCount = import.meta.env.PROD
  ? undefined
  : (count: number) => {
      if (count < 1) {
        throw new RangeError("Invalid levels count");
      }
    };

const validateLevelsIndex = import.meta.env.PROD
  ? undefined
  : (index: number, count: number) => {
      if (!isOffsetInRange(index, 0, count)) {
        throw new RangeError(`Invalid level index ${index}`);
      }
    };

const newLevels = (count: number) => {
  const result: ISupaplexLevel[] = [];
  const level = createNewLevel();
  for (let i = count; i-- > 0; ) {
    result.push(level);
  }
  return result;
};

export const createLevelset = (
  levels: readonly ISupaplexLevel[] | Iterable<ISupaplexLevel> | number,
): ISupaplexLevelset => new SupaplexLevelset(levels);

class SupaplexLevelset implements ISupaplexLevelset {
  readonly #levels: ISupaplexLevel[];

  constructor(
    levels: readonly ISupaplexLevel[] | Iterable<ISupaplexLevel> | number,
  ) {
    if (typeof levels === "number") {
      validateLevelsCount?.(levels);
      this.#levels = newLevels(levels);
    } else {
      this.#levels = [...levels];
      validateLevelsCount?.(this.#levels.length);
    }
  }

  copy(): this {
    return new SupaplexLevelset(this.getLevels()) as this;
  }

  get levelsCount() {
    return this.#levels.length;
  }

  getLevels() {
    return [...this.#levels];
  }

  getLevel(index: number) {
    validateLevelsIndex?.(index, this.levelsCount);
    return this.#levels[index];
  }

  setLevel(index: number, level: ISupaplexLevel) {
    validateLevelsIndex?.(index, this.levelsCount);
    const copy = this.copy();
    copy.#levels[index] = level;
    return copy;
  }

  appendLevel(level: ISupaplexLevel) {
    const copy = this.copy();
    copy.#levels.push(level);
    return copy;
  }

  insertLevel(index: number, level: ISupaplexLevel) {
    validateLevelsIndex?.(index, this.levelsCount);
    const copy = this.copy();
    copy.#levels.splice(index, 0, level);
    return copy;
  }

  removeLevel(index: number) {
    validateLevelsIndex?.(index, this.levelsCount);
    if (!import.meta.env.PROD && this.levelsCount === 1) {
      throw new RangeError(`Cannot remove the last one level`);
    }
    const copy = this.copy();
    copy.#levels.splice(index, 1);
    return copy;
  }

  get hasLocalOptions(): boolean {
    return this.#levels.some((l) => l.localOptions);
  }
  get localOptions(): LocalOptionsList | undefined {
    const list = this.#levels.map((l) => l.localOptions ?? null);
    if (list.some(Boolean)) {
      while (list.length && !list[list.length - 1]) {
        list.splice(list.length - 1);
      }
      return list;
    }
    return undefined;
  }
  setLocalOptions(opt: LocalOptionsList | undefined): this {
    if (!opt) {
      return this;
    }

    let next: readonly ISupaplexLevel[] = this.#levels;
    for (let i = 0, L = Math.min(next.length, opt.length); i < L; i++) {
      const o = opt[i];
      if (o) {
        next = RoArray.update(next, i, (l) => l.setLocalOptions(o));
      }
    }

    if (next === this.#levels) {
      return this;
    }
    return new SupaplexLevelset(next) as this;
  }
}
