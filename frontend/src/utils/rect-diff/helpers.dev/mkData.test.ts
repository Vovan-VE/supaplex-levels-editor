import { dumpData, mkData } from "./mkData";

describe("mkData", () => {
  const data = mkData(
    //
    `#### `,
    `# o #`,
    `  oo#`,
    `o# .#`,
  );

  expect(data.width).toBe(5);
  expect(data.height).toBe(4);
  const values = [
    [35, 35, 35, 35, 0],
    [35, 0, 111, 0, 35],
    [0, 0, 111, 111, 35],
    [111, 35, 0, 46, 35],
  ] as const;
  for (const [y, row] of values.entries()) {
    for (const [x, n] of row.entries()) {
      it(`[${x},${y}]`, () => {
        expect(data.getTile(x, y)).toBe(n);
      });
    }
  }

  describe("dumpData", () => {
    expect(dumpData(data)).toEqual([
      //
      `#### `,
      `# o #`,
      `  oo#`,
      `o# .#`,
    ]);
  });
});
