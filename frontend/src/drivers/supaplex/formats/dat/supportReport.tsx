import { ISupportReportMessage } from "../../../types";
import { ISupaplexLevel, ISupaplexLevelset } from "../../types";
import { levelReporter as sp_levelReporter } from "../sp/supportReport";
import { supportLevelsetReporter, warn } from "../supportLevelsetReporter";

export const supportReport = (levelset: ISupaplexLevelset) =>
  supportLevelsetReporter(levelset, undefined, levelReporter);

export function* levelReporter(
  level: ISupaplexLevel,
): Iterable<ISupportReportMessage> {
  yield* sp_levelReporter(level);

  if (level.demo !== null) {
    yield warn(<>Demo ({level.demo.length} bytes) will be removed.</>);
  }
}
