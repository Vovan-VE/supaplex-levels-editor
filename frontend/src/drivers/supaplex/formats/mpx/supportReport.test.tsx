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
        createLevelset(Array.from({ length: 0x8002 }).map(() => level)),
      ),
    ];
    expect(m).toEqual<ISupportReportMessage[]>([
      {
        type: SupportReportType.WARN,
        message: (
          <>
            Only {0x7fff} levels will be used, and all the rest (<b>{3}</b>)
            will be removed.
          </>
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
          <>
            Impossible to save all the rest levels starting from this one due to
            MPX file format limitations: <code>offset+1</code> exceeds{" "}
            <code>signed int32</code>. This is because all previous levels{" "}
            {false}
            together are too large being written into a MPX file.
          </>
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
          <>
            Level size{" "}
            <b>
              {35000}x{10}
            </b>{" "}
            don't fit into{" "}
            <b>
              {0x7fff}x{0x7fff}
            </b>
            .
          </>
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
          <>
            Level size{" "}
            <b>
              {10}x{36000}
            </b>{" "}
            don't fit into{" "}
            <b>
              {0x7fff}x{0x7fff}
            </b>
            .
          </>
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
          <>
            Level size{" "}
            <b>
              {35000}x{36000}
            </b>{" "}
            don't fit into{" "}
            <b>
              {0x7fff}x{0x7fff}
            </b>
            .
          </>
        ),
      },
    ]);
  });

  it("correct", () => {
    const m = [...levelReporter(createLevel(300, 300))];
    expect(m).toEqual([]);
  });
});
