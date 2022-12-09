import { fillLevelBorder } from "../../fillLevelBorder";
import { dumpLevel, dumpLevelset, readExampleFile } from "../../helpers.dev";
import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";
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

describe("writeLevelset", () => {
  it("remove extra levels", () => {
    const level = fillLevelBorder(
      createLevel(LEVEL_WIDTH, LEVEL_HEIGHT),
    ).setDemo(Uint8Array.of(10, 20, 30, 40, 50, 60));
    expect(
      dumpLevelset(readLevelset(writeLevelset(createLevelset([level, level])))),
    ).toMatchSnapshot();
  });

  it("level width exceed", () => {
    expect(() => writeLevelset(createLevelset([createLevel(70, 20)]))).toThrow(
      new Error(`Level is too large: 70x20`),
    );
  });

  it("level height exceed", () => {
    expect(() => writeLevelset(createLevelset([createLevel(50, 30)]))).toThrow(
      new Error(`Level is too large: 50x30`),
    );
  });

  it("level width extend", () => {
    expect(
      dumpLevel(
        readLevelset(
          writeLevelset(
            createLevelset([fillLevelBorder(createLevel(50, LEVEL_HEIGHT))]),
          ),
        ).getLevel(0),
      ),
    ).toMatchSnapshot();
  });

  it("level height extend", () => {
    expect(
      dumpLevel(
        readLevelset(
          writeLevelset(
            createLevelset([fillLevelBorder(createLevel(LEVEL_WIDTH, 20))]),
          ),
        ).getLevel(0),
      ),
    ).toMatchSnapshot();
  });

  it("level size extend", () => {
    expect(
      dumpLevel(
        readLevelset(
          writeLevelset(createLevelset([fillLevelBorder(createLevel(50, 20))])),
        ).getLevel(0),
      ),
    ).toMatchSnapshot();
  });
});
