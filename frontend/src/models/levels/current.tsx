import { createEvent, createStore, sample } from "effector";
import { createGate } from "effector-react";
import { withPersistent } from "@cubux/effector-persistent";
import { $instanceIsReadOnly, configStorage } from "backend";
import { getDriver } from "drivers";
import { Rect } from "utils/rect";
import { $currentDriverName } from "../levelsets";

const _$driver = $currentDriverName.map((d) => (d && getDriver(d)) || null);
export const $drvTileRender = _$driver.map(
  (drv) => (drv && drv.TileRender) || null,
);
export const $drvTiles = _$driver.map((drv) => (drv && drv.tiles) || null);

// current tile

export const setTile = createEvent<number>();

// FIXME: may be messed up "tile index" <=> "tile value", because it's equal for Supaplex
export const $tileIndex = createStore(0)
  .on($drvTiles, (n, tiles) => (tiles && n < tiles.length ? n : 0))
  .on(
    sample({
      clock: setTile,
      source: $drvTiles,
      filter: (tiles, n) => n >= 0 && tiles !== null && n < tiles.length,
      fn: (_, n) => n,
    }),
    (_, n) => n,
  );

// export const $tile = combine(
//   $drvTiles,
//   $tileIndex,
//   (tiles, n) => tiles?.[n] || null,
// );

// body

// minimal final scale in `px`
const SCALE_BASE = 8;
// "at least" approx value for maximal final scale in `px`
// so max final scale in `px` >= this value in `px`
const SCALE_MAX_APPROX = 256;
const SCALE_FACTOR_MIN = 2;
// scale step factor, so `scale in px = base * factor**n`
// obviously it must be >1, else zoom will work in reverse
const SCALE_FACTOR = 1 + SCALE_FACTOR_MIN / SCALE_BASE;
// calculating how many scale steps we need to reach beyond "at least" maximum above
// max = base * factor**n
// factor**n = max / base
// n = log(factor, max / base)
// // 20+ years ago...
// //
// //   x = log(a, b)
// //   a**x = b
// //   a = e**ln(a)
// //   (e**ln(a))**x = b
// //   e**(x*ln(a)) = b
// //   x*ln(a) = ln(b)
// //   x = ln(b) / ln(a)
// //   log(a, b) = ln(b) / ln(a)
// //
// // ok
// n = ln(max / base) / ln(factor)
const whichStep = (max: number) =>
  Math.ceil(Math.log(max / SCALE_BASE) / Math.log(SCALE_FACTOR));

// max scale step, so 0 <= step <= SCALE_STEP_MAX
const SCALE_STEP_MAX = whichStep(SCALE_MAX_APPROX);
// final scale in `px`
// rounded to SCALE_FACTOR_MIN
const ROUND_TO_PIXELS = 1 / SCALE_FACTOR_MIN;
const stepToScale = (n: number) =>
  Math.round(SCALE_BASE * SCALE_FACTOR ** n * ROUND_TO_PIXELS) /
  ROUND_TO_PIXELS;
// console.log(
//   SCALE_STEP_MAX,
//   Array.from({ length: SCALE_STEP_MAX + 1 }).map((_, i) => stepToScale(i)),
// );

// approx initial scale in `px`
const SCALE_INIT_APPROX = 24;

export const incBodyScale = createEvent<any>();
export const decBodyScale = createEvent<any>();
const $bodyScaleN = withPersistent(
  createStore(whichStep(SCALE_INIT_APPROX)),
  configStorage,
  "bodyScale",
  {
    ...($instanceIsReadOnly ? { readOnly: $instanceIsReadOnly } : null),
    unserialize: (v: unknown) => {
      const n = Number(v);
      if (isNaN(n)) {
        return whichStep(SCALE_INIT_APPROX);
      }
      return Math.max(0, Math.min(SCALE_STEP_MAX, Math.round(n)));
    },
  },
)
  .on(incBodyScale, (n) => Math.min(n + 1, SCALE_STEP_MAX))
  .on(decBodyScale, (n) => Math.max(n - 1, 0));

export const $bodyScale = $bodyScaleN.map(stepToScale);
export const $bodyScaleCanInc = $bodyScaleN.map((n) => n < SCALE_STEP_MAX);
export const $bodyScaleCanDec = $bodyScaleN.map((n) => n > 0);

export const BodyVisibleRectGate = createGate<{ rect: Rect | null }>({
  defaultState: { rect: null },
});
