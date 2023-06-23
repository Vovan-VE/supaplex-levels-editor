import { FlipDirection, getDriver } from "drivers";
import { $currentDriverName } from "models/levelsets";
import { HK_EDIT_FLIP_H, HK_EDIT_FLIP_V } from "models/ui/hotkeys-defined";
import { svgs } from "ui/icon";
import { IBounds, Point2D } from "utils/rect";
import { SelectionEditor, SelectionEditorFn } from "./_types";

const buildFlip =
  (
    len: (r: IBounds) => readonly [vary: number, constant: number],
    point: (vary: number, constant: number) => Point2D,
    direction: FlipDirection,
  ): SelectionEditorFn =>
  (r) => {
    const { tempLevelFromRegion } = getDriver($currentDriverName.getState()!)!;
    return tempLevelFromRegion(r)
      .batch((level) => {
        const [lVar, lConst] = len(r.tiles);
        // `i <= j` to include the middle to apply the symmetry if any
        for (let i = 0, j = lVar - 1; i <= j; i++, j--) {
          for (let c = lConst; c-- > 0; ) {
            const a = point(i, c);
            const b = point(j, c);
            level = level.swapTiles(a, b, direction);
          }
        }
        return level;
      })
      .copyRegion({ x: 0, y: 0, width: r.tiles.width, height: r.tiles.height });
  };

export const flipH: SelectionEditor = {
  title: "Flip Horizontal",
  icon: <svgs.FlipH />,
  instant: buildFlip(
    (r) => [r.width, r.height],
    (v, c) => ({ x: v, y: c }),
    FlipDirection.H,
  ),
  hotkeys: HK_EDIT_FLIP_H,
};
export const flipV: SelectionEditor = {
  title: "Flip Vertical",
  icon: <svgs.FlipV />,
  instant: buildFlip(
    (r) => [r.height, r.width],
    (v, c) => ({ x: c, y: v }),
    FlipDirection.V,
  ),
  hotkeys: HK_EDIT_FLIP_V,
};
