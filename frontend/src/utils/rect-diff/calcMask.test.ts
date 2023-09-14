import { calcMask } from "./calcMask";
import { BORDERS } from "./helpers.dev/defs";
import { mkData } from "./helpers.dev/mkData";

describe("calcMask", () => {
  it("8x6 a", () => {
    const src = mkData(
      //
      `########`,
      `########`,
      `### o###`,
      `## o####`,
      `###o####`,
      `########`,
    );

    const { padding } = calcMask(src, BORDERS);

    expect(padding.left).toBe(1);
    expect(padding.top).toBe(1);
    expect(padding.right).toBe(5);
    expect(padding.bottom).toBe(5);
    // expect(dumpData(mask)).toEqual([
    //   //
    //   `........`,
    //   `.ooooo..`,
    //   `.ooooo..`,
    //   `.ooooo..`,
    //   `.ooooo..`,
    //   `.ooooo..`,
    // ]);
  });

  it("5x4 a", () => {
    const src = mkData(
      //
      `#####`,
      `# oo#`,
      `#####`,
      `#####`,
    );

    const { padding } = calcMask(src, BORDERS);

    expect(padding.left).toBe(0);
    expect(padding.top).toBe(0);
    expect(padding.right).toBe(4);
    expect(padding.bottom).toBe(2);
    // expect(dumpData(mask)).toEqual([
    //   //
    //   `ooooo`,
    //   `ooooo`,
    //   `ooooo`,
    //   `.....`,
    // ]);
  });
});
