import { createEvent, createStore, restore } from "effector";
import { withPersistent } from "@cubux/effector-persistent";
import { $instanceIsReadOnly, configStorage } from "backend";
import { createLevelZoom, unserializeZoomStep } from "./createLevelZoom";
import { minmax } from "utils/number";

const ro = $instanceIsReadOnly ? { readOnly: $instanceIsReadOnly } : null;

const diffZoom = createLevelZoom();
withPersistent(diffZoom.$zoomStep, configStorage, "diffScale", {
  ...ro,
  unserialize: unserializeZoomStep,
});
export const {
  zoomIn: diffZoomIn,
  zoomOut: diffZoomOut,
  $zoom: $diffZoom,
  $canZoomIn: $diffCanZoomIn,
  $canZoomOut: $diffCanZoomOut,
} = diffZoom;

export const diffFancyToggle = createEvent<any>();
export const $diffFancyIgnore = withPersistent(
  createStore(false),
  configStorage,
  "diffFancyIgnore",
  {
    ...ro,
    serialize: (b) => (b ? "1" : ""),
    unserialize: Boolean,
  },
).on(diffFancyToggle, (b) => !b);

export const enum DiffTileShape {
  DIAGONAL = "/",
  HORIZONTAL = "-",
  VERTICAL = "|",
  FADE = "fade",
}

export const diffSetTileShape = createEvent<DiffTileShape>();
export const $diffTileShape = withPersistent(
  restore(diffSetTileShape, DiffTileShape.DIAGONAL),
  configStorage,
  "diffTileShape",
  {
    ...ro,
    unserialize: (v: unknown) => {
      switch (v) {
        case DiffTileShape.DIAGONAL:
        case DiffTileShape.HORIZONTAL:
        case DiffTileShape.VERTICAL:
        case DiffTileShape.FADE:
          return v;
        default:
          return DiffTileShape.DIAGONAL;
      }
    },
  },
);

export const diffSetSide = createEvent<number>();
export const $diffSide = withPersistent(
  restore(
    diffSetSide.map((n) => minmax(n, 0, 100)),
    50,
  ),
  configStorage,
  "diffSide",
  {
    ...ro,
    unserialize: (v: unknown) => {
      const n = Number(v);
      if (isNaN(n)) {
        return 50;
      }
      return minmax(Math.round(n), 0, 100);
    },
  },
);
