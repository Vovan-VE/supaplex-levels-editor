import fs from "fs";
import { reader } from "./io";
import { dumpLevelset } from "./helpers.dev";

it("read original levelset", (done) => {
  fs.readFile(`${__dirname}/levels.dat`, async (err, data: Buffer) => {
    if (err) {
      throw err;
    }

    try {
      expect(data.length).toBe(1536 * 111);

      const blob = new Blob([data.buffer]);
      expect(blob.size).toBe(data.length);

      const levelset = await reader.readLevelset(blob);

      expect(dumpLevelset(levelset)).toMatchSnapshot("levelset");

      done();
    } catch (e) {
      done(e);
    }
  });
});
