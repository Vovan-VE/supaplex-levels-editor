import { fromDrag } from "./fromDrag";
import { Rect } from "./types";

it("fromDrag", () => {
  expect(fromDrag(2, 3, 5, 7)).toEqual<Rect>({
    x: 2,
    y: 3,
    width: 4,
    height: 5,
  });
  expect(fromDrag(5, 3, 2, 7)).toEqual<Rect>({
    x: 2,
    y: 3,
    width: 4,
    height: 5,
  });
  expect(fromDrag(2, 7, 5, 3)).toEqual<Rect>({
    x: 2,
    y: 3,
    width: 4,
    height: 5,
  });
  expect(fromDrag(5, 7, 2, 3)).toEqual<Rect>({
    x: 2,
    y: 3,
    width: 4,
    height: 5,
  });
});
