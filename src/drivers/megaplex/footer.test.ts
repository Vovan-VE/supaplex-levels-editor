import { FOOTER_BYTE_LENGTH } from "../supaplex/footer";
import { LevelFooter } from "./footer";

const srcMain = new Uint8Array(FOOTER_BYTE_LENGTH);
srcMain.set(
  ""
    .padEnd(23)
    .split("")
    .map((ch) => ch.charCodeAt(0)),
  6,
);

it("demo", () => {
  const src = Uint8Array.of(
    ...srcMain,
    0,
    10,
    20,
    30,
    40,
    50,
    60,
    42,
    0,
    23,
    0xff,
  );

  let footer = new LevelFooter(1, src);
  expect(footer.demo).toEqual(Uint8Array.of(10, 20, 30, 40, 50, 60, 42, 0, 23));
  expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + 9 + 2);

  footer = footer.setDemo(Uint8Array.of(2, 4, 8));
  expect(footer.demo).toEqual(Uint8Array.of(2, 4, 8));
  expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + 3 + 2);
  expect(footer.getRaw()).toEqual(Uint8Array.of(...srcMain, 0, 2, 4, 8, 0xff));

  footer = footer.setDemo(Uint8Array.of(11, 13, 17, 19, 23));
  expect(footer.demo).toEqual(Uint8Array.of(11, 13, 17, 19, 23));
  expect(footer.length).toEqual(FOOTER_BYTE_LENGTH + 5 + 2);
  expect(footer.getRaw()).toEqual(
    Uint8Array.of(...srcMain, 0, 11, 13, 17, 19, 23, 0xff),
  );

  footer = footer.setDemo(null);
  expect(footer.demo).toBe(null);
  expect(footer.length).toEqual(FOOTER_BYTE_LENGTH);
  expect(footer.getRaw()).toEqual(srcMain);

  footer = new LevelFooter(1, srcMain);
  expect(footer.demo).toBe(null);
  expect(footer.length).toEqual(FOOTER_BYTE_LENGTH);
  expect(footer.getRaw()).toEqual(srcMain);

  footer = new LevelFooter(1);
  expect(footer.demo).toBe(null);
  expect(footer.length).toEqual(FOOTER_BYTE_LENGTH);
  expect(footer.getRaw()).toEqual(srcMain);
});
