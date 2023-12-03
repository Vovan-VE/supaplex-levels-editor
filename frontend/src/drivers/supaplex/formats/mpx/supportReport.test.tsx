import { Trans } from "i18n/Trans";
import { ISupportReportMessage, SupportReportType } from "../../../types";
import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import {
  levelReporter,
  levelsetReporter,
  supportReport,
} from "./supportReport";

describe("supportReport", () => {
  it("ok", () => {
    expect([
      ...supportReport(createLevelset([createLevel(2, 3), createLevel(4, 5)])),
    ]).toEqual([]);
  });
});

describe("levelsetReporter", () => {
  it("too many levels", () => {
    const level = createLevel(2, 2);
    const m = [
      ...levelsetReporter(
        createLevelset(Array.from({ length: 0x8002 }, () => level)),
      ),
    ];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.WARN,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.MaxLevelsTruncate"
            values={{ max: 0x7fff, rest: 3 }}
          />
        ),
      },
    ]);
  });

  it("too large offset", () => {
    const level = createLevel(32000, 32000);
    const m = [
      ...levelsetReporter(createLevelset([level, level, level, level])),
    ];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.ERR,
        message: (
          <Trans i18nKey="main:supaplex.convert.MpxSpecPortOffsetExceed" />
        ),
        levelIndex: 3,
      },
    ]);
  });

  it("correct", () => {
    const m = [
      ...levelsetReporter(
        createLevelset([createLevel(2, 3), createLevel(4, 5)]),
      ),
    ];
    expect(m).toEqual([]);
  });
});

describe("levelReporter", () => {
  it("exceed width", () => {
    const m = [...levelReporter(createLevel(35000, 10))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.ERR,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.BodySizeExceed"
            values={{
              width: 35000,
              height: 10,
              maxWidth: 0x7fff,
              maxHeight: 0x7fff,
            }}
          />
        ),
      },
    ]);
  });

  it("exceed height", () => {
    const m = [...levelReporter(createLevel(10, 36000))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.ERR,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.BodySizeExceed"
            values={{
              width: 10,
              height: 36000,
              maxWidth: 0x7fff,
              maxHeight: 0x7fff,
            }}
          />
        ),
      },
    ]);
  });

  it("exceed both", () => {
    const m = [...levelReporter(createLevel(35000, 36000))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.ERR,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.BodySizeExceed"
            values={{
              width: 35000,
              height: 36000,
              maxWidth: 0x7fff,
              maxHeight: 0x7fff,
            }}
          />
        ),
      },
    ]);
  });

  it("correct", () => {
    const m = [...levelReporter(createLevel(300, 300))];
    expect(m).toEqual([]);
  });
});
