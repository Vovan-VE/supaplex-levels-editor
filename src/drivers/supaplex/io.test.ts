import fs from "fs";
import { reader, writer } from "./io";
import { dumpLevelset } from "./helpers.dev";

it("read original levelset", (done) => {
  fs.readFile(`${__dirname}/levels.dat`, async (err, data: Buffer) => {
    if (err) {
      throw err;
    }

    try {
      expect(data.length).toBe(1536 * 111);

      const source = new Blob([data.buffer]);
      expect(source.size).toBe(data.length);

      const levelset = await reader.readLevelset(source);

      expect(dumpLevelset(levelset)).toMatchSnapshot("levelset");

      const result = await writer.writeLevelset(levelset);
      expect(result).toEqual(source);

      done();
    } catch (e) {
      done(e);
    }
  });
});

it("invalid file size", async () => {
  await expect(() =>
    reader.readLevelset(new Blob([new Uint8Array(100)])),
  ).rejects.toEqual(new Error("Invalid file size: not a module of level size"));
});
