import { o2a } from "./o2a";
import { RectA } from "./types";

it("o2a", () => {
  expect(o2a({ x: 1, y: 2, w: 3, h: 4 })).toEqual<RectA>([1, 2, 3, 4]);
});
