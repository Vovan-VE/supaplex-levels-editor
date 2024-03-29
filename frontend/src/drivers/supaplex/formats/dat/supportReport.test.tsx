import { Trans } from "i18n/Trans";
import { ISupportReportMessage, SupportReportType } from "../../../types";
import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";
import { levelReporter, supportReport } from "./supportReport";

const level = createLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
const levelset = createLevelset([level]);

describe("supportReport", () => {
  it("ok", () => {
    expect([...supportReport(levelset)]).toEqual([]);
  });
});

describe("levelReporter", () => {
  it("with demo", () => {
    const m = [
      ...levelReporter(level.setDemo(Uint8Array.of(10, 20, 30, 40, 50, 60))),
    ];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.WARN,
        message: (
          <Trans
            i18nKey="main:supaplex.convert.DemoWillBeRemoved"
            values={{ n: 6 }}
          />
        ),
      },
    ]);
  });

  it("correct", () => {
    const m = [...levelReporter(level)];
    expect(m).toEqual([]);
  });
});
