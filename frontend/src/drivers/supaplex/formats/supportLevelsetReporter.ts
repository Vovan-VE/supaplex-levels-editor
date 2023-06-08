import { ReactNode } from "react";
import { ISupportReportMessage, SupportReportType } from "../../types";
import { ISupaplexLevel, ISupaplexLevelset } from "../types";

export function* supportLevelsetReporter(
  levelset: ISupaplexLevelset,
  levelsetReporter?: (
    levelset: ISupaplexLevelset,
  ) => Iterable<ISupportReportMessage>,
  levelReporter?: (level: ISupaplexLevel) => Iterable<ISupportReportMessage>,
): Iterable<ISupportReportMessage> {
  if (levelsetReporter) {
    yield* levelsetReporter(levelset);
  }
  if (levelReporter) {
    for (const [levelIndex, level] of levelset.getLevels().entries()) {
      for (const item of levelReporter(level)) {
        yield { ...item, levelIndex };
      }
    }
  }
}

export const err = (message: ReactNode): ISupportReportMessage => ({
  type: SupportReportType.ERR,
  message,
});
export const warn = (message: ReactNode): ISupportReportMessage => ({
  type: SupportReportType.WARN,
  message,
});
