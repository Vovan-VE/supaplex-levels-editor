import { dumpLevelset, readExampleFile } from "../../helpers.dev";
import { readLevelset, writeLevelset } from "./io";

it("read original levelset", async () => {
  const data = await readExampleFile("D95S018.sp");
  expect(data.length).toBe(0x6b0);

  const levelset = readLevelset(data.buffer);

  expect(dumpLevelset(levelset)).toMatchSnapshot("levelset");

  const result = writeLevelset(levelset);
  expect(result).toEqual(data.buffer.slice(0, 0x616));
});

it("invalid file size", () => {
  expect(() => readLevelset(new Uint8Array(100).buffer)).toThrow(
    new Error("Invalid file size: less then level size"),
  );
});
