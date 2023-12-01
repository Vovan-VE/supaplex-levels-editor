import { restreamChunkVariants } from "./restreamChunkVariants";

it("restreamChunkVariants", () => {
  expect(
    Array.from(
      restreamChunkVariants([42, 37, 11, 97], (x) => Math.floor(x / 4)),
    ),
  ).toEqual([
    [42, 37, 2, 97, 10],
    [44, 37, 4, 97, 11],
    [48, 37, 4, 97, 12],
    [52, 37, 1, 97, 13],
  ]);

  expect(
    Array.from(
      restreamChunkVariants([42, 37, 10, 97], (x) => Math.floor(x / 4)),
    ),
  ).toEqual([
    [42, 37, 2, 97, 10],
    [44, 37, 4, 97, 11],
    [48, 37, 4, 97, 12],
  ]);

  expect(
    Array.from(
      restreamChunkVariants(
        [42, 37, 10, 97],
        (x) => Math.floor(x / 4) % 3 || undefined,
      ),
    ),
  ).toEqual([
    [42, 37, 2, 97, 1],
    [44, 37, 4, 97, 2],
    [48, 37, 4, 97, undefined],
  ]);

  expect(
    Array.from(
      restreamChunkVariants(
        [42, 37, 12, 97],
        (x) => Math.floor(x / 4) % 3 || undefined,
      ),
    ),
  ).toEqual([
    [42, 37, 2, 97, 1],
    [44, 37, 4, 97, 2],
    [48, 37, 4, 97, undefined],
    [52, 37, 2, 97, 1],
  ]);
});
