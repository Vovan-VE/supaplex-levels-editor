import { ISupaplexLevel, ISupaplexLevelset } from "./types";
import { SupaplexLevel } from "./level";

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

export class SupaplexLevelset implements ISupaplexLevelset {
  readonly #levels: ISupaplexLevel[];

  constructor(
    levels: readonly ISupaplexLevel[] | Iterable<ISupaplexLevel> | number = 111,
  ) {
    this.#levels = [];
    if (typeof levels === "number") {
      validateLevelsCount?.(levels);
      for (let i = levels; i-- > 0; ) {
        this.#levels.push(new SupaplexLevel());
      }
    } else {
      for (const level of levels) {
        this.#levels.push(level);
      }
      validateLevelsCount?.(this.#levels.length);
    }
  }

  get levelsCount() {
    return this.#levels.length;
  }

  get minLevelsCount() {
    return 1;
  }

  get maxLevelsCount() {
    return null;
  }

  *getLevels() {
    yield* this.#levels;
  }

  getLevel(index: number) {
    validateLevelsIndex?.(index, this.levelsCount);
    return this.#levels[index];
  }

  setLevel(index: number, level: ISupaplexLevel) {
    validateLevelsIndex?.(index, this.levelsCount);
    // TODO: dupe reference check, copy from input or remove method?
    this.#levels[index] = level;
  }

  appendLevel(level: ISupaplexLevel) {
    // TODO
  }

  insertLevel(index: number, level: ISupaplexLevel) {
    // TODO
  }

  removeLevel(index: number) {
    // TODO
  }
}
