import { Levelset } from "../supaplex/levelset";
import { IMegaplexLevel, IMegaplexLevelset } from "./types";
import { MegaplexLevel } from "./level";

const newLevels = (count: number) => {
  const result: IMegaplexLevel[] = [];
  for (let i = count; i-- > 0; ) {
    result.push(new MegaplexLevel(60, 24));
  }
  return result;
};

export class MegaplexLevelset
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
