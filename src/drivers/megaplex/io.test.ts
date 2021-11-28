import fs from "fs";
import { reader, writer } from "./io";
import { dumpLevelset } from "./helpers.dev";

const examplesDir = `${__dirname}/examples.dev`;

it("read mpx levelset", (done) => {
  fs.readFile(`${examplesDir}/levels.mpx`, async (err, data: Buffer) => {
    if (err) {
      throw err;
    }

    try {
      const levelset = reader.readLevelset(data.buffer);

      expect(dumpLevelset(levelset)).toMatchSnapshot("levelset");

      const result = writer.writeLevelset(levelset);
      expect(result).toEqual(data.buffer);

      done();
    } catch (e) {
      done(e);
    }
  });
});

it("read mpx levelset 1 5x3", (done) => {
  fs.readFile(`${examplesDir}/5x3.mpx`, async (err, data: Buffer) => {
    if (err) {
      throw err;
    }

    try {
      const levelset = reader.readLevelset(data.buffer);

      expect(dumpLevelset(levelset)).toMatchSnapshot();

      const result = writer.writeLevelset(levelset);
      expect(result).toEqual(data.buffer);

      done();
    } catch (e) {
      done(e);
    }
  });
});

it("read mpx levelset 1 5x3 winplex", (done) => {
  fs.readFile(`${examplesDir}/5x3.winplex.mpx`, async (err, data: Buffer) => {
    if (err) {
      throw err;
    }

    try {
      const levelset = reader.readLevelset(data.buffer);

      expect(dumpLevelset(levelset)).toMatchSnapshot();

      const result = writer.writeLevelset(levelset);
      expect(result).toEqual(data.buffer);

      done();
    } catch (e) {
      done(e);
    }
  });
});

it("invalid file format", () => {
  expect(() => reader.readLevelset(new Uint8Array(100).buffer)).toThrow(
    new Error("Unrecognized file format"),
  );

  expect(() =>
    reader.readLevelset(
      Uint8Array.of(
        0x4d,
        0x50,
        0x58,
        0x20,
        0x01,
        0x7f,
        0x01,
        0x00,
        0x05,
        0x00,
        0x03,
        0x00,
        0x15,
        0x00,
        0x00,
        0x00,
        0x6f,
        0x00,
        0x00,
        0x00,
        ...new Uint8Array(15 + 96),
      ).buffer,
    ),
  ).toThrow(new Error(`Unsupported format version ${0x7f01}`));
});
