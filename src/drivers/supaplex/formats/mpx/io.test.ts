import { dumpLevelset, readExampleFile } from "../../helpers.dev";
import { createLevel } from "../../level";
import { createLevelset } from "../../levelset";
import { LEVEL_HEIGHT, LEVEL_WIDTH } from "../std";
import { readLevelset, writeLevelset } from "./io";

it("read mpx levelset", async () => {
  const data = await readExampleFile("levels.mpx");
  const levelset = readLevelset(data.buffer);

  expect(dumpLevelset(levelset)).toMatchSnapshot("levelset");

  const result = writeLevelset(levelset);
  expect(result).toEqual(data.buffer);
});

it("read mpx levelset 1 5x3", async () => {
  const data = await readExampleFile("5x3.mpx");
  const levelset = readLevelset(data.buffer);

  expect(dumpLevelset(levelset)).toMatchSnapshot();

  const result = writeLevelset(levelset);
  expect(result).toEqual(data.buffer);
});

it("read mpx levelset 1 5x3 winplex", async () => {
  const data = await readExampleFile("5x3.winplex.mpx");
  const levelset = readLevelset(data.buffer);

  expect(dumpLevelset(levelset)).toMatchSnapshot();

  const result = writeLevelset(levelset);
  expect(result).toEqual(data.buffer);
});

it("invalid file format", () => {
  expect(() => readLevelset(new Uint8Array(100).buffer)).toThrow(
    new Error("Unrecognized file format"),
  );

  expect(() =>
    readLevelset(
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

describe("writeLevelset", () => {
  const level = createLevel(LEVEL_WIDTH, LEVEL_HEIGHT);

  it("remove extra levels", () => {
    const level = createLevel(2, 2);
    expect(
      readLevelset(
        writeLevelset(
          createLevelset(Array.from({ length: 0x8002 }).map(() => level)),
        ),
      ).levelsCount,
    ).toBe(0x7fff);
  });

  it("level width exceed", () => {
    expect(() =>
      writeLevelset(createLevelset([level, createLevel(0x8002, 10)])),
    ).toThrow(new Error(`Level 2 is too large: ${0x8002}x10`));
  });

  it("level height exceed", () => {
    expect(() =>
      writeLevelset(createLevelset([level, createLevel(10, 0x8002)])),
    ).toThrow(new Error(`Level 2 is too large: 10x${0x8002}`));
  });

  it("offset exceed", () => {
    const level = createLevel(0x7fff, 0x7fff);

    expect(() =>
      writeLevelset(createLevelset([level, level, level, level, level])),
    ).toThrow(
      new Error(
        `Level 4 cannot be saved due to MPX file format limitations (offset+1 exceeds maximum)`,
      ),
    );

    // it takes about 20 sec to write 2 GB
    //
    // expect(() =>
    //   writeLevelset(createLevelset([level, level, level])),
    // ).not.toThrow();
  });
});
