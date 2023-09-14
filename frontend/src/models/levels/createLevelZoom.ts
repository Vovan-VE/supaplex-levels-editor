import { createEvent, createStore } from "effector";
import { minmax } from "utils/number";

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

export const unserializeZoomStep = (v: unknown) => {
  const n = Number(v);
  if (isNaN(n)) {
    return whichStep(SCALE_INIT_APPROX);
  }
  return minmax(Math.round(n), 0, SCALE_STEP_MAX);
};

export const createLevelZoom = () => {
  const zoomIn = createEvent<any>();
  const zoomOut = createEvent<any>();
  const $zoomStep = createStore(whichStep(SCALE_INIT_APPROX))
    .on(zoomIn, (n) => Math.min(n + 1, SCALE_STEP_MAX))
    .on(zoomOut, (n) => Math.max(n - 1, 0));

  return {
    zoomIn,
    zoomOut,
    $zoomStep,
    $zoom: $zoomStep.map(stepToScale),
    $canZoomIn: $zoomStep.map((n) => n < SCALE_STEP_MAX),
    $canZoomOut: $zoomStep.map((n) => n > 0),
  };
};
