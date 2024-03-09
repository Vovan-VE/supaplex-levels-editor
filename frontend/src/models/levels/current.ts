import { createEvent, createStore, sample } from "effector";
import { createGate } from "effector-react";
import { withPersistent } from "@cubux/effector-persistent";
import { $instanceIsReadOnly, configStorage } from "backend";
import { getDriver } from "drivers";
import { Rect } from "utils/rect";
import { $currentDriverName } from "../levelsets";
import { createLevelZoom, unserializeZoomStep } from "./createLevelZoom";

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

// body

const bodyZoom = createLevelZoom();
withPersistent(bodyZoom.$zoomStep, configStorage, "bodyScale", {
  ...($instanceIsReadOnly ? { readOnly: $instanceIsReadOnly } : null),
  unserialize: unserializeZoomStep,
});
export const {
  zoomIn: incBodyScale,
  zoomOut: decBodyScale,
  $zoom: $bodyScale,
  $canZoomIn: $bodyScaleCanInc,
  $canZoomOut: $bodyScaleCanDec,
} = bodyZoom;

export const BodyVisibleRectGate = createGate<{ rect: Rect | null }>({
  defaultState: { rect: null },
});
