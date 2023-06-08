import { ISupportReportMessage, SupportReportType } from "../../../types";
import { ISupaplexLevel, ISupaplexLevelset } from "../../types";
import { err, supportLevelsetReporter, warn } from "../supportLevelsetReporter";

export const supportReport = (levelset: ISupaplexLevelset) =>
  supportLevelsetReporter(levelset, levelsetReporter, levelReporter);

export function* levelsetReporter(
  levelset: ISupaplexLevelset,
): Iterable<ISupportReportMessage> {
  const levelsCount = levelset.levelsCount;

  if (levelsCount > 0x7fff) {
    yield warn(
      <>
        Only {0x7fff} levels will be used, and all the rest (
        <b>{levelsCount - 0x7fff}</b>) will be removed.
      </>,
    );
  }

  let offset = 8 + 12 * levelsCount;
  let hasDemo = false;
  for (const [levelIndex, level] of levelset.getLevels().entries()) {
    hasDemo ||= level.demo !== null;
    if (offset >= 0x7fffffff - 1) {
      yield {
        type: SupportReportType.ERR,
        message: (
          <>
            Impossible to save all the rest levels starting from this one due to
            MPX file format limitations: <code>offset+1</code> exceeds{" "}
            <code>signed int32</code>. This is because all previous levels{" "}
            {hasDemo && <>with demos </>}
            together are too large being written into a MPX file.
          </>
        ),
        levelIndex,
      };
    }
    offset += level.length;
  }
}

export function* levelReporter(
  level: ISupaplexLevel,
): Iterable<ISupportReportMessage> {
  const { width, height } = level;
  if (width > 0x7fff || height > 0x7fff) {
    yield err(
      <>
        Level size{" "}
        <b>
          {width}x{height}
        </b>{" "}
        don't fit into{" "}
        <b>
          {0x7fff}x{0x7fff}
        </b>
        .
      </>,
    );
  }
}
