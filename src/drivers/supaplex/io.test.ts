import fs from "fs";
import { reader, writer } from "./io";
import { dumpLevelset } from "./helpers.dev";

it("read original levelset", (done) => {
  fs.readFile(
    `${__dirname}/examples.dev/levels.dat`,
    async (err, data: Buffer) => {
      if (err) {
        throw err;
      }

      try {
        expect(data.length).toBe(1536 * 111);

        const levelset = reader.readLevelset(data.buffer);

        expect(dumpLevelset(levelset)).toMatchSnapshot("levelset");

        const result = writer.writeLevelset(levelset);
        expect(result).toEqual(data.buffer);

        done();
      } catch (e) {
        done(e);
      }
    },
  );
});

it("invalid file size", () => {
  expect(() => reader.readLevelset(new Uint8Array(100).buffer)).toThrow(
    new Error("Invalid file size: not a module of level size"),
  );
});
