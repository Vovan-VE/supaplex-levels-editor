import { ISupaplexLevel } from "./types";
import { TILE_HARDWARE } from "./tiles";

export const fillLevelBorder = <L extends ISupaplexLevel>(
  level: L,
  tile: number = TILE_HARDWARE,
): L => {
  const w = level.width;
  const h = level.height;
  const r = w - 1;
  const b = h - 1;
  const max = Math.max(w, h);
  for (let n = 0; n < max; n++) {
    if (n < w) {
      level = level.setTile(n, 0, tile).setTile(n, b, tile);
    }
    if (n > 0 && n < b) {
      level = level.setTile(0, n, tile).setTile(r, n, tile);
    }
  }
  return level;
};
