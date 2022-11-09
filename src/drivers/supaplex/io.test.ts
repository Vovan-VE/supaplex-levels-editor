import { reader, writer } from "./io";
import { dumpLevelset, readExampleFile } from "./helpers.dev";

it("read original levelset", async () => {
  const data = await readExampleFile("levels.dat");
  expect(data.length).toBe(1536 * 111);

  const levelset = reader.readLevelset(data.buffer);

  expect(dumpLevelset(levelset)).toMatchSnapshot("levelset");

  const result = writer.writeLevelset(levelset);
  expect(result).toEqual(data.buffer);
});

it("invalid file size", () => {
  expect(() => reader.readLevelset(new Uint8Array(100).buffer)).toThrow(
    new Error("Invalid file size: not a module of level size"),
  );
});
