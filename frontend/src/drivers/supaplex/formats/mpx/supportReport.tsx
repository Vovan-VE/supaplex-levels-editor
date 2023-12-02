import { Trans } from "i18n/Trans";
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
      <Trans
        i18nKey="main:supaplex.convert.MaxLevelsTruncate"
        values={{ max: 0x7fff, rest: levelsCount - 0x7fff }}
      />,
    );
  }

  let offset = 8 + 12 * levelsCount;
  // let hasDemo = false;
  for (const [levelIndex, level] of levelset.getLevels().entries()) {
    // hasDemo ||= level.demo !== null;
    if (offset >= 0x7fffffff - 1) {
      yield {
        type: SupportReportType.ERR,
        message: (
          <Trans i18nKey="main:supaplex.convert.MpxSpecPortOffsetExceed" />
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
      <Trans
        i18nKey="main:supaplex.convert.BodySizeExceed"
        values={{ width, height, maxWidth: 0x7fff, maxHeight: 0x7fff }}
      />,
    );
  }
}
