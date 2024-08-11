import { getDriver, TranspositionDirection } from "drivers";
import { Trans } from "i18n/Trans";
import { $currentDriverName } from "models/levelsets";
import { HK_EDIT_TRANSPOSE } from "models/ui/hotkeys-defined";
import { svgs } from "ui/icon";
import { SelectionEditor } from "./_types";

export const transpose: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.flip.Transpose" />,
  icon: <svgs.TransposeNW />,
  instant: (r) => {
    const { width, height } = r.tiles;
    const long = Math.max(width, height);
    const short = Math.min(width, height);
    const newW = height;
    const newH = width;
    const { tempLevel } = getDriver($currentDriverName.getState()!)!;
    return tempLevel({
      width: long,
      height: long,
    })
      .batch((level) => {
        level = level.pasteRegion(0, 0, r);
        for (let j = 0; j < short; j++) {
          for (let i = j; i < long; i++) {
            level = level.swapTiles(
              { x: i, y: j },
              { x: j, y: i },
              TranspositionDirection.NW,
            );
          }
        }
        return level;
      })
      .copyRegion({ x: 0, y: 0, width: newW, height: newH });
  },
  hotkeys: HK_EDIT_TRANSPOSE,
};
