import { isOffsetInRange } from "utils/number";
import { fillLevelBorder } from "./fillLevelBorder";
import { createLevel } from "./level";
import { ISupaplexLevel, ISupaplexLevelset } from "./types";

const validateLevelsCount =
  process.env.NODE_ENV === "production"
    ? undefined
    : (count: number) => {
        if (count < 1) {
          throw new RangeError("Invalid levels count");
        }
      };

const validateLevelsIndex =
  process.env.NODE_ENV === "production"
    ? undefined
    : (index: number, count: number) => {
        if (!isOffsetInRange(index, 0, count)) {
          throw new RangeError(`Invalid level index ${index}`);
        }
      };

const newLevels = (count: number) => {
  const result: ISupaplexLevel[] = [];
  const level = fillLevelBorder(createLevel(60, 24));
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
    if (process.env.NODE_ENV !== "production" && this.levelsCount === 1) {
      throw new RangeError(`Cannot remove the last one level`);
    }
    const copy = this.copy();
    copy.#levels.splice(index, 1);
    return copy;
  }
}
