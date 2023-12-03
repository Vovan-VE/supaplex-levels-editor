import { Trans } from "i18n/Trans";
import { ISupportReportMessage } from "../../../types";
import { ISupaplexLevel, ISupaplexLevelset } from "../../types";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";
import { err, warn } from "../supportLevelsetReporter";

export function* supportReport(levelset: ISupaplexLevelset) {
  yield* levelsetReporter(levelset);
  for (const item of levelReporter(levelset.getLevel(0))) {
    yield { ...item, levelIndex: 0 };
  }
}

export function* levelsetReporter(
  levelset: ISupaplexLevelset,
): Iterable<ISupportReportMessage> {
  if (levelset.levelsCount > 1) {
    yield warn(
      <Trans
        i18nKey="main:supaplex.convert.OnlyFirstLevelWillLeft"
        values={{ rest: levelset.levelsCount - 1 }}
      />,
    );
  }
}

export function* levelReporter(
  level: ISupaplexLevel,
): Iterable<ISupportReportMessage> {
  const { width, height } = level;
  if (width > LEVEL_WIDTH || height > LEVEL_HEIGHT) {
    yield err(
      <Trans
        i18nKey="main:supaplex.convert.BodySizeExceed"
        values={{
          width,
          height,
          maxWidth: LEVEL_WIDTH,
          maxHeight: LEVEL_HEIGHT,
        }}
      />,
    );
  } else if (width < LEVEL_WIDTH || height < LEVEL_HEIGHT) {
    yield warn(
      <Trans
        i18nKey="main:supaplex.convert.BodySizeWillExtend"
        values={{
          width,
          height,
          maxWidth: LEVEL_WIDTH,
          maxHeight: LEVEL_HEIGHT,
        }}
      />,
    );
  }
}
