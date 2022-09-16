import { combine, createEvent, createStore, sample } from "effector";
import { withPersistent } from "@cubux/effector-persistent";
import { getDriver } from "drivers";
import { $currentLevel, $currentLevelsetFile } from "../levelsets";
import { localStorageDriver } from "../_utils/persistent";

const _$driver = $currentLevelsetFile.map(
  (f) => (f && getDriver(f.driverName)) || null,
);

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

// current tool

// body
const SCALE_STEP = 0.05;
const correctScale = (n: number) => (n < SCALE_STEP ? SCALE_STEP : n);
export const setBodyScale = createEvent<number>();
export const incBodyScale = createEvent<any>();
export const decBodyScale = createEvent<any>();
export const $bodyScale = withPersistent(
  createStore(1.35),
  localStorageDriver,
  "bodyScale",
)
  .on(setBodyScale, (_, n) => correctScale(n))
  .on(incBodyScale, (s) => s + SCALE_STEP)
  .on(decBodyScale, (s) => correctScale(s - SCALE_STEP));

export const $drvTiles = $currentLevelsetFile.map((file) => {
  if (file) {
    const { TileRender } = getDriver(file.driverName)!;
    return TileRender;
  }
  return null;
});

export const $levelTiles = $currentLevel.map((level) => {
  if (level) {
    const rawLevel = level.level.undoQueue.current;
    const { width, height } = rawLevel;
    let chunk: number[] = [];
    const chunks = [chunk];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const v = rawLevel.getTile(x, y);
        chunk.push(v);
        if (chunk.length === 64) {
          chunk = [];
          chunks.push(chunk);
        }
      }
    }
    if (chunk.length === 0) {
      chunks.pop();
    }
    return {
      width,
      height,
      chunks,
    };
  }
  return null;
});
