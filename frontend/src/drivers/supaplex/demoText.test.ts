import { demoFromText, demoToText } from "./demoText";
import { readLevelset } from "./formats/sp/io";
import { readExampleFile } from "./helpers.dev";

describe("demo text", () => {
  const getDemo = async (exampleFilename: string) =>
    readLevelset((await readExampleFile(exampleFilename)).buffer).getLevel(0)
      .demo;

  for (const REF of ["D95S001.sp", "D95S018.sp"]) {
    it(`${REF}`, async () => {
      const demo = await getDemo(REF);

      const textDefault = demoToText(demo, {
        wrapWidth: 72,
      });
      const textWithTiles = demoToText(demo, {
        wrapWidth: 72,
        useTilesTime: true,
      });

      expect(textDefault).toMatchSnapshot("default");
      expect(textWithTiles).toMatchSnapshot("+tiles");

      expect(demoFromText(textDefault)).toEqual(demo);
      expect(demoFromText(textWithTiles)).toEqual(demo);
    });
  }
});
