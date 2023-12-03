import { Trans } from "i18n/Trans";
import { ISupportReportMessage, SupportReportType } from "../../../types";
import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";
import {
  levelReporter,
  levelsetReporter,
  supportReport,
} from "./supportReport";

const level = createLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
const levelset = createLevelset([level]);

describe("supportReport", () => {
  it("ok", () => {
    expect([...supportReport(levelset)]).toEqual([]);
  });

  it("ignores rest levels", () => {
    expect([...supportReport(levelset.appendLevel(createLevel(2, 3)))]).toEqual<
      ISupportReportMessage[]
    >([
      {
        type: SupportReportType.WARN,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.OnlyFirstLevelWillLeft"
            values={{ rest: 1 }}
          />
        ),
      },
    ]);
  });
});

describe("levelsetReporter", () => {
  it("many levels", () => {
    const m = [...levelsetReporter(createLevelset([level, level, level]))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.WARN,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.OnlyFirstLevelWillLeft"
            values={{ rest: 2 }}
          />
        ),
      },
    ]);
  });

  it("one level", () => {
    const m = [...levelsetReporter(levelset)];
    expect(m).toEqual([]);
  });
});

describe("levelReporter", () => {
  it("exceed width", () => {
    const m = [...levelReporter(createLevel(62, 40))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.ERR,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.BodySizeExceed"
            values={{
              width: 62,
              height: 40,
              maxWidth: LEVEL_WIDTH,
              maxHeight: LEVEL_HEIGHT,
            }}
          />
        ),
      },
    ]);
  });

  it("exceed height", () => {
    const m = [...levelReporter(createLevel(50, 30))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.ERR,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.BodySizeExceed"
            values={{
              width: 50,
              height: 30,
              maxWidth: LEVEL_WIDTH,
              maxHeight: LEVEL_HEIGHT,
            }}
          />
        ),
      },
    ]);
  });

  it("exceed both", () => {
    const m = [...levelReporter(createLevel(62, 50))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.ERR,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.BodySizeExceed"
            values={{
              width: 62,
              height: 50,
              maxWidth: LEVEL_WIDTH,
              maxHeight: LEVEL_HEIGHT,
            }}
          />
        ),
      },
    ]);
  });

  it("low width", () => {
    const m = [...levelReporter(createLevel(50, LEVEL_HEIGHT))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.WARN,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.BodySizeWillExtend"
            values={{
              width: 50,
              height: LEVEL_HEIGHT,
              maxWidth: LEVEL_WIDTH,
              maxHeight: LEVEL_HEIGHT,
            }}
          />
        ),
      },
    ]);
  });

  it("low height", () => {
    const m = [...levelReporter(createLevel(LEVEL_WIDTH, 20))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.WARN,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.BodySizeWillExtend"
            values={{
              width: LEVEL_WIDTH,
              height: 20,
              maxWidth: LEVEL_WIDTH,
              maxHeight: LEVEL_HEIGHT,
            }}
          />
        ),
      },
    ]);
  });

  it("low both", () => {
    const m = [...levelReporter(createLevel(50, 20))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.WARN,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.BodySizeWillExtend"
            values={{
              width: 50,
              height: 20,
              maxWidth: LEVEL_WIDTH,
              maxHeight: LEVEL_HEIGHT,
            }}
          />
        ),
      },
    ]);
  });

  it("exact size", () => {
    const m = [...levelReporter(level)];
    expect(m).toEqual([]);
  });
});
