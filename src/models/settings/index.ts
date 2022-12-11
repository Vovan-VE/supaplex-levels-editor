import { createEvent, createStore } from "effector";
import { withPersistent } from "@cubux/effector-persistent";
import { localStorageDriver } from "../_utils/persistent";

export const openSettings = createEvent<any>();
export const closeSettings = createEvent<any>();
export const $opened = createStore(false)
  .reset(closeSettings)
  .on(openSettings, () => true);

export const setPrefAskTestSO = createEvent<boolean>();
export const $prefConfirmedTestSO = withPersistent(
  createStore(false),
  localStorageDriver,
  "prefConfirmTestSO",
  { unserialize: Boolean },
).on(setPrefAskTestSO, (_, v) => v);

export const setCoordsDisplayBasis = createEvent<0 | 1>();
export const $coordsDisplayBasis = withPersistent(
  createStore<0 | 1>(0),
  localStorageDriver,
  "coordsBasis",
  { unserialize: (v) => (v ? 1 : 0) },
).on(setCoordsDisplayBasis, (_, v) => v);

export enum LayoutType {
  AUTO = "auto",
  COMPACT = "compact",
  FULL = "full",
}
const isLayoutType = (v: any): v is LayoutType =>
  typeof v === "string" && LayoutType.hasOwnProperty(v);
export const setLayoutType = createEvent<LayoutType>();
export const $layoutType = withPersistent(
  createStore<LayoutType>(LayoutType.AUTO),
  localStorageDriver,
  "layout",
  { unserialize: (v) => (isLayoutType(v) ? v : LayoutType.AUTO) },
).on(setLayoutType, (_, v) => v);

type SpChipType = 0 | 1;
const isSpChipType = (v: any): v is SpChipType =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 1;
export const setSpChip = createEvent<SpChipType>();
export const $spChip = withPersistent(
  createStore<SpChipType>(0),
  localStorageDriver,
  "spChip",
  { unserialize: (v) => (isSpChipType(v) ? v : 0) },
).on(setSpChip, (_, v) => v);
