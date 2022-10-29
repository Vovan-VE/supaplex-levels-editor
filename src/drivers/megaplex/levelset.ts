import { Levelset } from "../supaplex/levelset";
import { fillLevelBorder } from "../supaplex/fillLevelBorder";
import { IMegaplexLevel, IMegaplexLevelset } from "./types";
import { createLevel } from "./level";

const newLevels = (count: number) => {
  const result: IMegaplexLevel[] = [];
  const level = fillLevelBorder(createLevel(60, 24));
  for (let i = count; i-- > 0; ) {
    result.push(level);
  }
  return result;
};

export const createLevelset = (
  levels: readonly IMegaplexLevel[] | Iterable<IMegaplexLevel> | number = 1,
): IMegaplexLevelset => new MegaplexLevelset(levels);

class MegaplexLevelset
  extends Levelset<IMegaplexLevel>
  implements IMegaplexLevelset
{
  constructor(
    levels: readonly IMegaplexLevel[] | Iterable<IMegaplexLevel> | number = 1,
  ) {
    super(typeof levels === "number" ? newLevels(levels) : levels);
  }

  copy(): this {
    return new MegaplexLevelset(this.getLevels()) as this;
  }

  get maxLevelsCount(): number | null {
    return 0x7fff;
  }
}
