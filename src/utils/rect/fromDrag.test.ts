import { fromDrag } from "./fromDrag";

it("fromDrag", () => {
  expect(fromDrag(2, 3, 5, 7)).toEqual([2, 3, 4, 5]);
  expect(fromDrag(5, 3, 2, 7)).toEqual([2, 3, 4, 5]);
  expect(fromDrag(2, 7, 5, 3)).toEqual([2, 3, 4, 5]);
  expect(fromDrag(5, 7, 2, 3)).toEqual([2, 3, 4, 5]);
});
