import { reader, writer } from "./io";
import { dumpLevelset, readExampleFile } from "./helpers.dev";

it("read mpx levelset", async () => {
  const data = await readExampleFile("levels.mpx");
  const levelset = reader.readLevelset(data.buffer);

  expect(dumpLevelset(levelset)).toMatchSnapshot("levelset");

  const result = writer.writeLevelset(levelset);
  expect(result).toEqual(data.buffer);
});

it("read mpx levelset 1 5x3", async () => {
  const data = await readExampleFile("5x3.mpx");
  const levelset = reader.readLevelset(data.buffer);

  expect(dumpLevelset(levelset)).toMatchSnapshot();

  const result = writer.writeLevelset(levelset);
  expect(result).toEqual(data.buffer);
});

it("read mpx levelset 1 5x3 winplex", async () => {
  const data = await readExampleFile("5x3.winplex.mpx");
  const levelset = reader.readLevelset(data.buffer);

  expect(dumpLevelset(levelset)).toMatchSnapshot();

  const result = writer.writeLevelset(levelset);
  expect(result).toEqual(data.buffer);
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
