import { ITilesStreamItem } from "../../types";

export function* restreamChunkVariants(
  chunk: ITilesStreamItem,
  getVariant: (x: number, y: number) => number | undefined,
): Iterable<ITilesStreamItem> {
  const [x, y, width, tile] = chunk;
  let lastItem: [
    x: number,
    y: number,
    width: number,
    tile: number,
    variant: number | undefined,
  ] = [x, y, 0, tile, undefined];
  for (let i = 0; i < width; i++) {
    const cx = x + i;
    const variant = getVariant(cx, y);
    if (variant === lastItem[4]) {
      lastItem[2]++;
    } else {
      if (lastItem[2]) {
        yield lastItem;
      }
      lastItem = [cx, y, 1, tile, variant];
    }
  }
  if (lastItem[2]) {
    yield lastItem;
  }
}
