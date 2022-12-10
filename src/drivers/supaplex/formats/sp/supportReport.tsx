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
      <>
        Only first level will be used, and all the rest (
        <b>{levelset.levelsCount - 1}</b>) will be removed.
      </>,
    );
  }
}

export function* levelReporter(
  level: ISupaplexLevel,
): Iterable<ISupportReportMessage> {
  const { width, height } = level;
  if (width > LEVEL_WIDTH || height > LEVEL_HEIGHT) {
    yield err(
      <>
        Level size{" "}
        <b>
          {width}x{height}
        </b>{" "}
        don't fit into{" "}
        <b>
          {LEVEL_WIDTH}x{LEVEL_HEIGHT}
        </b>
        .
      </>,
    );
  } else if (width < LEVEL_WIDTH || height < LEVEL_HEIGHT) {
    yield warn(
      <>
        Level size{" "}
        <b>
          {width}x{height}
        </b>{" "}
        will be extended to{" "}
        <b>
          {LEVEL_WIDTH}x{LEVEL_HEIGHT}
        </b>
        .
      </>,
    );
  }
}