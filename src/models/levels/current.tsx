import { combine, createEvent, createStore, sample } from "effector";
import { withPersistent } from "@cubux/effector-persistent";
import { getDriver } from "drivers";
import { $currentDriverName } from "../levelsets";
import { localStorageDriver } from "../_utils/persistent";

const _$driver = $currentDriverName.map((d) => (d && getDriver(d)) || null);

// current tile

export const setTile = createEvent<number>();

export const $tileIndex = createStore(0)
  .on(_$driver, (n, d) => (d && n < d.tiles.length ? n : 0))
  .on(
    sample({
      clock: setTile,
      source: _$driver,
      filter: (d, n) => n >= 0 && d !== null && n < d.tiles.length,
      fn: (_, n) => n,
    }),
    (_, n) => n,
  );

export const $tile = combine(
  _$driver,
  $tileIndex,
  (d, n) => (d && d.tiles[n]) || null,
);

// body

// minimal final scale in `px`
const SCALE_BASE = 8;
// "at least" approx value for maximal final scale in `px`
// so max final scale in `px` >= this value in `px`
const SCALE_MAX_APPROX = 256;
const SCALE_FACTOR_MIN = 2;
// scale step factor, so `scale in px = base * factor**n`
// obviously it must be >1, else zoom will work in reverse
const SCALE_FACTOR = (SCALE_BASE + SCALE_FACTOR_MIN) / SCALE_BASE;
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

const SCALE_STEPS_TOTAL = whichStep(SCALE_MAX_APPROX);
// console.log(
//   SCALE_STEPS_TOTAL,
//   Array.from({ length: SCALE_STEPS_TOTAL + 1 }).map((_, i) =>
//     (SCALE_BASE * SCALE_FACTOR ** i).toFixed(4),
//   ),
// );

// approx initial scale in `px`
const SCALE_INIT_APPROX = 24;

export const incBodyScale = createEvent<any>();
export const decBodyScale = createEvent<any>();
const $bodyScaleN = withPersistent(
  createStore(whichStep(SCALE_INIT_APPROX)),
  localStorageDriver,
  "bodyScale",
  {
    unserialize: (v: unknown) => {
      const n = Number(v);
      if (isNaN(n)) {
        return whichStep(SCALE_INIT_APPROX);
      }
      return Math.max(0, Math.min(SCALE_STEPS_TOTAL, Math.round(n)));
    },
  },
)
  .on(incBodyScale, (n) => Math.min(n + 1, SCALE_STEPS_TOTAL))
  .on(decBodyScale, (n) => Math.max(n - 1, 0));

// final scale in `px`
// rounded to SCALE_FACTOR_MIN
const k = 1 / SCALE_FACTOR_MIN;
export const $bodyScale = $bodyScaleN.map(
  (n) => Math.round(SCALE_BASE * SCALE_FACTOR ** n * k) / k,
);
export const $bodyScaleCanInc = $bodyScaleN.map((n) => n < SCALE_STEPS_TOTAL);
export const $bodyScaleCanDec = $bodyScaleN.map((n) => n > 0);

export const $drvTileRender = _$driver.map(
  (drv) => (drv && drv.TileRender) || null,
);
export const $drvTiles = _$driver.map((drv) => (drv && drv.tiles) || null);
