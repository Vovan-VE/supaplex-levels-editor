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
  const src = Uint8Array.of(...srcMain, 10, 20, 30, 40, 50, 60, 42, 0, 23);

  let footer = new LevelFooter(1, src);
  expect(footer.demo).toEqual(Uint8Array.of(10, 20, 30, 40, 50, 60, 42, 0, 23));

  footer.demo = Uint8Array.of(2, 4, 8);
  expect(footer.demo).toEqual(Uint8Array.of(2, 4, 8));
  expect(footer.getRaw(1)).toEqual(Uint8Array.of(...srcMain, 2, 4, 8));

  footer.demo = null;
  expect(footer.demo).toBe(null);
  expect(footer.getRaw(1)).toEqual(srcMain);

  footer = new LevelFooter(1, srcMain);
  expect(footer.demo).toBe(null);
  expect(footer.getRaw(1)).toEqual(srcMain);

  footer = new LevelFooter(1);
  expect(footer.demo).toBe(null);
  expect(footer.getRaw(1)).toEqual(srcMain);
});
