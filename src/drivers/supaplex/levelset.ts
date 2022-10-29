import { ISupaplexLevel, ISupaplexLevelset } from "./types";
import { createLevel } from "./level";
import { fillLevelBorder } from "./fillLevelBorder";
import { IBaseLevelset } from "../types";

const validateLevelsCount =
  process.env.NODE_ENV === "production"
    ? undefined
    : (count: number) => {
        if (count < 1) {
          throw new RangeError(`Invalid levels count ${count}`);
        }
      };

const validateLevelsIndex =
  process.env.NODE_ENV === "production"
    ? undefined
    : (index: number, count: number) => {
        if (index < 0 || index >= count) {
          throw new RangeError(`Invalid level index ${index}`);
        }
      };

export class Levelset<L extends ISupaplexLevel> implements IBaseLevelset<L> {
  readonly #levels: L[];

  constructor(levels: readonly L[] | Iterable<L>) {
    this.#levels = [...levels];
    validateLevelsCount?.(this.#levels.length);
  }

  copy(): this {
    return new Levelset(this.#levels) as this;
  }

  get levelsCount() {
    return this.#levels.length;
  }

  get minLevelsCount() {
    return 1;
  }

  get maxLevelsCount(): number | null {
    return null;
  }

  getLevels() {
    return [...this.#levels];
  }

  getLevel(index: number) {
    validateLevelsIndex?.(index, this.levelsCount);
    return this.#levels[index];
  }

  setLevel(index: number, level: L) {
    validateLevelsIndex?.(index, this.levelsCount);
    const copy = this.copy();
    copy.#levels[index] = level;
    return copy;
  }

  appendLevel(level: L) {
    const copy = this.copy();
    copy.#levels.push(level);
    return copy;
  }

  insertLevel(index: number, level: L) {
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

const newLevels = (count: number) => {
  validateLevelsCount?.(count);
  const result: ISupaplexLevel[] = [];
  const level = fillLevelBorder(createLevel());
  for (let i = count; i-- > 0; ) {
    result.push(level);
  }
  return result;
};

export const createLevelset = (
  levels: readonly ISupaplexLevel[] | Iterable<ISupaplexLevel> | number = 111,
): ISupaplexLevelset => new SupaplexLevelset(levels);

class SupaplexLevelset
  extends Levelset<ISupaplexLevel>
  implements ISupaplexLevelset
{
  constructor(
    levels: readonly ISupaplexLevel[] | Iterable<ISupaplexLevel> | number = 111,
  ) {
    super(typeof levels === "number" ? newLevels(levels) : levels);
  }

  copy(): this {
    return new SupaplexLevelset(this.getLevels()) as this;
  }
}
