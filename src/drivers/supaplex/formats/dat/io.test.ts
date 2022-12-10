import { fillLevelBorder } from "../../fillLevelBorder";
import { dumpLevel, dumpLevelset, readExampleFile } from "../../helpers.dev";
import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";
import { readLevelset, writeLevelset } from "./io";

it("read original levelset", async () => {
  const data = await readExampleFile("levels.dat");
  expect(data.length).toBe(1536 * 111);

  const levelset = readLevelset(data.buffer);

  expect(dumpLevelset(levelset)).toMatchSnapshot("levelset");

  const result = writeLevelset(levelset);
  expect(result).toEqual(data.buffer);
});

it("invalid file size", () => {
  expect(() => readLevelset(new Uint8Array(100).buffer)).toThrow(
    new Error("Invalid file size: not a module of level size"),
  );
});

describe("writeLevelset", () => {
  const level = createLevel(LEVEL_WIDTH, LEVEL_HEIGHT);

  it("level width exceed", () => {
    expect(() =>
      writeLevelset(createLevelset([level, createLevel(70, 20)])),
    ).toThrow(new Error(`Level 2 is too large: 70x20`));
  });

  it("level height exceed", () => {
    expect(() =>
      writeLevelset(createLevelset([level, createLevel(50, 30)])),
    ).toThrow(new Error(`Level 2 is too large: 50x30`));
  });

  it("level width extend", () => {
    expect(
      dumpLevel(
        readLevelset(
          writeLevelset(
            createLevelset([
              level,
              fillLevelBorder(createLevel(50, LEVEL_HEIGHT)),
            ]),
          ),
        ).getLevel(1),
      ),
    ).toMatchSnapshot();
  });

  it("level height extend", () => {
    expect(
      dumpLevel(
        readLevelset(
          writeLevelset(
            createLevelset([
              level,
              fillLevelBorder(createLevel(LEVEL_WIDTH, 20)),
            ]),
          ),
        ).getLevel(1),
      ),
    ).toMatchSnapshot();
  });

  it("level size extend", () => {
    expect(
      dumpLevel(
        readLevelset(
          writeLevelset(
            createLevelset([level, fillLevelBorder(createLevel(50, 20))]),
          ),
        ).getLevel(1),
      ),
    ).toMatchSnapshot();
  });

  it("remove demo", () => {
    expect(
      dumpLevel(
        readLevelset(
          writeLevelset(
            createLevelset([
              level,
              fillLevelBorder(level).setDemo(
                Uint8Array.of(10, 20, 30, 40, 50, 60),
              ),
            ]),
          ),
        ).getLevel(1),
      ),
    ).toMatchSnapshot();
  });
});
