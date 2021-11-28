import { ISupaplexLevel, ISupaplexLevelset } from "./types";
import { SupaplexLevel } from "./level";
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

  get levelsCount() {
    return this.#levels.length;
  }

  get minLevelsCount() {
    return 1;
  }

  get maxLevelsCount(): number | null {
    return null;
  }

  *getLevels() {
    yield* this.#levels;
  }

  getLevel(index: number) {
    validateLevelsIndex?.(index, this.levelsCount);
    return this.#levels[index];
  }

  setLevel(index: number, level: L) {
    validateLevelsIndex?.(index, this.levelsCount);
    // TODO: dupe reference check, copy from input or remove method?
    this.#levels[index] = level;
  }

  appendLevel(level: L) {
    this.#levels.push(level);
  }

  insertLevel(index: number, level: L) {
    validateLevelsIndex?.(index, this.levelsCount);
    this.#levels.splice(index, 0, level);
  }

  removeLevel(index: number) {
    validateLevelsIndex?.(index, this.levelsCount);
    if (process.env.NODE_ENV !== "production" && this.levelsCount === 1) {
      throw new RangeError(`Cannot remove the last one level`);
    }
    this.#levels.splice(index, 1);
  }
}

const newLevels = (count: number) => {
  validateLevelsCount?.(count);
  const result: ISupaplexLevel[] = [];
  for (let i = count; i-- > 0; ) {
    result.push(new SupaplexLevel());
  }
  return result;
};

export class SupaplexLevelset
  extends Levelset<ISupaplexLevel>
  implements ISupaplexLevelset
{
  constructor(
    levels: readonly ISupaplexLevel[] | Iterable<ISupaplexLevel> | number = 111,
  ) {
    super(typeof levels === "number" ? newLevels(levels) : levels);
  }
}
