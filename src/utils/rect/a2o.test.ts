import { a2o } from "./a2o";
import { RectO } from "./types";

it("a2o", () => {
  expect(a2o([1, 2, 3, 4])).toEqual<RectO>({ x: 1, y: 2, w: 3, h: 4 });
});
