import { getDriver } from "drivers";
import { Trans } from "i18n/Trans";
import { $currentDriverName } from "models/levelsets";
import { HK_EDIT_SHUFFLE } from "models/ui/hotkeys-defined";
import { svgs } from "ui/icon";
import { SelectionEditor } from "./_types";

export const shuffle: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.flip.Shuffle" />,
  // TODO: icon
  icon: <svgs.Random />,
  cannotWorkWhy: (s) =>
    s.width < 2 && s.height < 2 ? (
      <Trans i18nKey="main:selectionEditors.chess.MinSizeRequire" />
    ) : null,
  instant: (r) => {
    const { tempLevelFromRegion } = getDriver($currentDriverName.getState()!)!;
    const src = tempLevelFromRegion(r);
    return tempLevelFromRegion(r)
      .batch((level) => {
        const { width, height } = level;
        const i2p = (i: number) => [i % width, Math.floor(i / width)] as const;
        const indices = Array.from({ length: width * height }, (_, i) => i);
        shuffleArray(indices);
        for (const [prevI, nextI] of indices.entries()) {
          const [px, py] = i2p(prevI);
          const [nx, ny] = i2p(nextI);
          level = level.pasteRegion(
            nx,
            ny,
            src.copyRegion({ x: px, y: py, width: 1, height: 1 }),
          );
        }
        return level;
      })
      .copyRegion({ x: 0, y: 0, width: r.tiles.width, height: r.tiles.height });
  },
  hotkeys: HK_EDIT_SHUFFLE,
};

function shuffleArray<T>(a: T[]) {
  if (a.length <= 1) return;
  const buf = new Uint16Array(1);
  const rnd = (max: number) => {
    window.crypto.getRandomValues(buf);
    return Math.floor((buf[0] / 0x10000) * (max + 1));
  };
  for (let n = a.length; n-- > 1; ) {
    const i = rnd(n);
    if (i === n) continue;
    [a[i], a[n]] = [a[n], a[i]];
  }
}
