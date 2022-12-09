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
});

describe("levelsetReporter", () => {
  it("many levels", () => {
    const m = [...levelsetReporter(createLevelset([level, level, level]))];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.WARN,
        message: (
          <>
            Only first level will be used, and all the rest (<b>{2}</b>) will be
            removed.
          </>
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
          <>
            Level size{" "}
            <b>
              {62}x{40}
            </b>{" "}
            don't fit into{" "}
            <b>
              {LEVEL_WIDTH}x{LEVEL_HEIGHT}
            </b>
            .
          </>
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
          <>
            Level size{" "}
            <b>
              {50}x{30}
            </b>{" "}
            don't fit into{" "}
            <b>
              {LEVEL_WIDTH}x{LEVEL_HEIGHT}
            </b>
            .
          </>
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
          <>
            Level size{" "}
            <b>
              {62}x{50}
            </b>{" "}
            don't fit into{" "}
            <b>
              {LEVEL_WIDTH}x{LEVEL_HEIGHT}
            </b>
            .
          </>
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
          <>
            Level size{" "}
            <b>
              {50}x{LEVEL_HEIGHT}
            </b>{" "}
            will be extended to{" "}
            <b>
              {LEVEL_WIDTH}x{LEVEL_HEIGHT}
            </b>
            .
          </>
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
          <>
            Level size{" "}
            <b>
              {LEVEL_WIDTH}x{20}
            </b>{" "}
            will be extended to{" "}
            <b>
              {LEVEL_WIDTH}x{LEVEL_HEIGHT}
            </b>
            .
          </>
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
          <>
            Level size{" "}
            <b>
              {50}x{20}
            </b>{" "}
            will be extended to{" "}
            <b>
              {LEVEL_WIDTH}x{LEVEL_HEIGHT}
            </b>
            .
          </>
        ),
      },
    ]);
  });

  it("exact size", () => {
    const m = [...levelReporter(level)];
    expect(m).toEqual([]);
  });
});
